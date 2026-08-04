import { httpsCallable, FunctionsError } from 'firebase/functions'
import { functions } from './firebase'
import type { PaymentMethod } from '../types/booking'

/**
 * بينادي نفس Cloud Function (createBooking) اللي بنيناها وقت نسخة Flutter -
 * الدوال دي مش مرتبطة بلغة برمجة معيّنة، فمفيش أي داعي نعيد كتابة منطق
 * الحجز والتحقق من المقاعد والدفع من الصفر. نفس الأمان، نفس القواعد.
 */
export async function createBooking(params: {
  tripId: string
  seatsBooked: number
  paymentMethod: PaymentMethod
  couponCode?: string
}): Promise<string> {
  try {
    const callable = httpsCallable<typeof params, { bookingId: string }>(functions, 'createBooking')
    const result = await callable(params)
    return result.data.bookingId
  } catch (err) {
    if (err instanceof FunctionsError) {
      throw new Error(err.message)
    }
    throw new Error('حصل خطأ، حاول تاني')
  }
}

export async function cancelBooking(bookingId: string): Promise<void> {
  try {
    const callable = httpsCallable(functions, 'cancelBooking')
    await callable({ bookingId })
  } catch (err) {
    if (err instanceof FunctionsError) {
      throw new Error(err.message)
    }
    throw new Error('حصل خطأ، حاول تاني')
  }
}
