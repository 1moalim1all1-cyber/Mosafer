import { db, auth } from './firebase'
import {
  doc,
  collection,
  query,
  where,
  limit,
  getDocs,
  increment,
  runTransaction,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import type { PaymentMethod } from '../types/booking'

/**
 * الحجز بيتم بالكامل من المتصفح دلوقتي (Firestore Transaction) بدل
 * Cloud Function - عشان المشروع يشتغل من غير خطة Blaze (تحتاج بطاقة).
 * الأمان بقى معتمد على قواعد Firestore بدل سيرفر مخصص - مقبول لمرحلة
 * الاختبار والإطلاق المبكر، لكن أضعف من الحل السابق تقنيًا.
 */
export async function createBooking(params: {
  tripId: string
  seatsBooked: number
  paymentMethod: PaymentMethod
  couponCode?: string
  pickupLat?: number
  pickupLng?: number
}): Promise<string> {
  const { tripId, seatsBooked, paymentMethod, couponCode, pickupLat, pickupLng } = params
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('لازم تسجّل دخول الأول')

  const tripRef = doc(db, 'trips', tripId)
  const bookingRef = doc(collection(db, 'bookings'))
  const walletRef = doc(db, 'wallets', uid)
  const userRef = doc(db, 'users', uid)

  // لازم نلاقي مرجع الكوبون *قبل* الدخول في الـ Transaction، لأن
  // Firestore على الويب مبيسمحش بعمل Query جوه Transaction - بس قراءة
  // مستندات بمرجع مباشر. القراءة الفعلية للتأكد من صلاحية الكوبون
  // (نشط، غير منتهي، غير مستهلك) بتحصل جوه الـ Transaction زي العادة.
  let couponRef = null as ReturnType<typeof doc> | null
  if (couponCode && couponCode.trim()) {
    const couponsSnap = await getDocs(
      query(collection(db, 'coupons'), where('code', '==', couponCode.trim().toUpperCase()), limit(1)),
    )
    if (!couponsSnap.empty) couponRef = couponsSnap.docs[0].ref
  }

  try {
    await runTransaction(db, async (tx) => {
      const tripSnap = await tx.get(tripRef)
      if (!tripSnap.exists()) throw new Error('الرحلة دي مش موجودة')
      const trip = tripSnap.data()

      if (trip.status !== 'active') throw new Error('الرحلة دي مش متاحة للحجز حاليًا')
      if (trip.driverId === uid) throw new Error('مستحيل تحجز في رحلتك إنت')

      if (trip.isWomenOnly) {
        const userSnap = await tx.get(userRef)
        if (userSnap.data()?.gender !== 'female') {
          throw new Error('الرحلة دي مخصصة للسيدات فقط')
        }
      }

      const currentAvailable = trip.availableSeats as number
      if (currentAvailable < seatsBooked) {
        throw new Error(`للأسف متبقاش إلا ${currentAvailable} مقاعد متاحة`)
      }

      const originalPrice = (trip.pricePerSeat as number) * seatsBooked
      let totalPrice = originalPrice
      let appliedCouponRef: ReturnType<typeof doc> | null = null
      let appliedCouponCode: string | null = null

      if (couponRef) {
        const couponSnap = await tx.get(couponRef)
        if (couponSnap.exists()) {
          const coupon = couponSnap.data()
          const isActive = coupon.isActive === true
          const notExpired = !coupon.expiresAt || (coupon.expiresAt as Timestamp).toDate() > new Date()
          const notExhausted = (coupon.usedCount ?? 0) < (coupon.maxUses ?? 0)
          if (isActive && notExpired && notExhausted) {
            const discount = coupon.discountType === 'percentage' ? originalPrice * (coupon.value / 100) : coupon.value
            totalPrice = Math.max(0, originalPrice - discount)
            appliedCouponRef = couponRef
            appliedCouponCode = coupon.code
          }
        }
      }

      let paymentStatus: 'pending' | 'paid' = 'pending'

      if (paymentMethod === 'wallet') {
        const walletSnap = await tx.get(walletRef)
        const currentBalance = (walletSnap.data()?.balance ?? 0) as number
        if (currentBalance < totalPrice) {
          throw new Error(`رصيد محفظتك مش كافي، رصيدك الحالي ${currentBalance.toFixed(0)} ج.م`)
        }
        const newBalance = currentBalance - totalPrice
        tx.update(walletRef, { balance: newBalance })
        tx.set(doc(collection(walletRef, 'walletTransactions')), {
          type: 'payment',
          amount: totalPrice,
          balanceAfter: newBalance,
          relatedBookingId: bookingRef.id,
          status: 'completed',
          createdAt: serverTimestamp(),
        })
        paymentStatus = 'paid'
      }

      const newAvailable = currentAvailable - seatsBooked
      tx.update(tripRef, {
        availableSeats: newAvailable,
        status: newAvailable === 0 ? 'full' : 'active',
      })

      if (appliedCouponRef) {
        tx.update(appliedCouponRef, { usedCount: increment(1) })
      }

      tx.set(bookingRef, {
        tripId,
        passengerId: uid,
        driverId: trip.driverId,
        seatsBooked,
        status: 'pending',
        totalPrice,
        originalPrice,
        couponCode: appliedCouponCode,
        paymentMethod,
        paymentStatus,
        pickupLat: pickupLat ?? null,
        pickupLng: pickupLng ?? null,
        // كود تحقق من 4 أرقام - السائق بيطلبه من الراكب وقت الاستلام
        // عشان يتأكد إنه فعلاً الشخص اللي حجز، زي نظام Uber بالظبط
        startPin: String(Math.floor(1000 + Math.random() * 9000)),
        pinVerified: false,
        createdAt: serverTimestamp(),
      })
    })
    return bookingRef.id
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('حصل خطأ، حاول تاني')
  }
}

export async function cancelBooking(bookingId: string): Promise<void> {
  const bookingRef = doc(db, 'bookings', bookingId)
  try {
    await runTransaction(db, async (tx) => {
      const bookingSnap = await tx.get(bookingRef)
      if (!bookingSnap.exists()) throw new Error('الحجز ده مش موجود')
      const booking = bookingSnap.data()
      if (booking.status === 'cancelled' || booking.status === 'completed') {
        throw new Error('الحجز ده مينفعش يتلغي دلوقتي')
      }

      const tripRef = doc(db, 'trips', booking.tripId)
      const tripSnap = await tx.get(tripRef)
      if (tripSnap.exists()) {
        const trip = tripSnap.data()
        tx.update(tripRef, {
          availableSeats: (trip.availableSeats as number) + (booking.seatsBooked as number),
          status: 'active',
        })
      }

      if (booking.paymentStatus === 'paid') {
        const walletRef = doc(db, 'wallets', booking.passengerId)
        const walletSnap = await tx.get(walletRef)
        const currentBalance = (walletSnap.data()?.balance ?? 0) as number
        const newBalance = currentBalance + (booking.totalPrice as number)
        tx.update(walletRef, { balance: newBalance })
        tx.set(doc(collection(walletRef, 'walletTransactions')), {
          type: 'refund',
          amount: booking.totalPrice,
          balanceAfter: newBalance,
          relatedBookingId: bookingId,
          status: 'completed',
          createdAt: serverTimestamp(),
        })
      }

      tx.update(bookingRef, { status: 'cancelled' })
    })
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('حصل خطأ، حاول تاني')
  }
}
