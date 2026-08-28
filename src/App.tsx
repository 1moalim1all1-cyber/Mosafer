import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, GuestOnlyRoute } from './routes/guards'





























import { AdminRoute, DriverRoute } from './routes/roleGuards'
import { RootRoute } from './routes/guards'
import { useAuth } from './contexts/useAuth'
import { SplashScreen } from './components/SplashScreen'
import { DesktopNav } from './components/DesktopNav'
import { ChunkErrorBoundary } from './components/ChunkErrorBoundary'
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const RoleSelectionPage = lazy(() => import('./pages/RoleSelectionPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'))
const TripDetailsPage = lazy(() => import('./pages/TripDetailsPage'))
const DriverDocumentsPage = lazy(() => import('./pages/DriverDocumentsPage'))
const DriverPendingApprovalPage = lazy(() => import('./pages/DriverPendingApprovalPage'))
const DriverDashboardPage = lazy(() => import('./pages/DriverDashboardPage'))
const CreateTripPage = lazy(() => import('./pages/CreateTripPage'))
const DriverTripBookingsPage = lazy(() => import('./pages/DriverTripBookingsPage'))
const WalletPage = lazy(() => import('./pages/WalletPage'))
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))
const AdminDriverQueuePage = lazy(() => import('./pages/AdminDriverQueuePage'))
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'))
const AdminTripsPage = lazy(() => import('./pages/AdminTripsPage'))
const TripsCommunityPage = lazy(() => import('./pages/TripsCommunityPage'))
const CreateTripRequestPage = lazy(() => import('./pages/CreateTripRequestPage'))
const MyTripRequestsPage = lazy(() => import('./pages/MyTripRequestsPage'))
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'))
const AdminWalletRequestsPage = lazy(() => import('./pages/AdminWalletRequestsPage'))
const AdminGovernoratesPage = lazy(() => import('./pages/AdminGovernoratesPage'))
const AdminCouponsPage = lazy(() => import('./pages/AdminCouponsPage'))
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'))
const SupportPage = lazy(() => import('./pages/SupportPage'))
const AboutHelpPage = lazy(() => import('./pages/AboutHelpPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const TrackTripPage = lazy(() => import('./pages/TrackTripPage'))
const StaticPageView = lazy(() => import('./pages/StaticPageView'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'))
const LandingPage = lazy(() => import('./pages/LandingPage'))

import { WhatsAppButton } from './components/WhatsAppButton'
import { PageTransition } from './components/PageTransition'

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

/**
 * بنفصل الجزء ده عشان useAuth() لازم يتنادى جوه AuthProvider - وبيوريك
 * شاشة البداية بملء الشاشة (اللوجو الجديد) لحد ما Firebase يتأكد هل
 * إنت مسجّل دخول ولا لأ، بدل شاشة بيضا أو دائرة تحميل عادية.
 */
function AppShell() {
  const { loading, firebaseUser } = useAuth()

  // لو التطبيق شغّال تمام (مفيش خطأ)، بنصفّي علامة "حصل Refresh قبل
  // كده" عشان لو تحديث تاني حصل بعدين ولسه نفس التاب مفتوح، آلية
  // الإصلاح التلقائي تشتغل تاني من غير ما تتعطل
  useEffect(() => {
    sessionStorage.removeItem('mosafer_chunk_reload')
  }, [])

  if (loading) return <SplashScreen />

  return (
    <HashRouter>
        {firebaseUser && <DesktopNav />}
        <WhatsAppButton />
        <PageTransition>
        <ChunkErrorBoundary>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-bg">
              <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          }
        >
        <Routes>
          <Route
            path="/login"
            element={
              <GuestOnlyRoute>
                <LoginPage />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/role-selection"
            element={
              <GuestOnlyRoute>
                <RoleSelectionPage />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnlyRoute>
                <RegisterPage />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/"
            element={
              <RootRoute
                authed={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
                guest={<LandingPage />}
              />
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trip/:tripId"
            element={
              <ProtectedRoute>
                <TripDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/documents"
            element={
              <ProtectedRoute>
                <DriverRoute>
                  <DriverDocumentsPage />
                </DriverRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/pending-approval"
            element={
              <ProtectedRoute>
                <DriverRoute>
                  <DriverPendingApprovalPage />
                </DriverRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver"
            element={
              <ProtectedRoute>
                <DriverRoute>
                  <DriverDashboardPage />
                </DriverRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/create-trip"
            element={
              <ProtectedRoute>
                <DriverRoute>
                  <CreateTripPage />
                </DriverRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/trip/:tripId/bookings"
            element={
              <ProtectedRoute>
                <DriverRoute>
                  <DriverTripBookingsPage />
                </DriverRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/trips"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminTripsPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/drivers"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminDriverQueuePage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/wallet-requests"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminWalletRequestsPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/governorates"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminGovernoratesPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminCouponsPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:chatId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <TripsCommunityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community/new-request"
            element={
              <ProtectedRoute>
                <CreateTripRequestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community/my-requests"
            element={
              <ProtectedRoute>
                <MyTripRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <PublicProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminSettingsPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <SupportPage />
              </ProtectedRoute>
            }
          />
          <Route path="/about-help" element={<AboutHelpPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route
            path="/track/:bookingId"
            element={
              <ProtectedRoute>
                <TrackTripPage />
              </ProtectedRoute>
            }
          />
          <Route path="/page/:pageId" element={<StaticPageView />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          </Routes>
        </Suspense>
        </ChunkErrorBoundary>
        </PageTransition>
      </HashRouter>
  )
}
