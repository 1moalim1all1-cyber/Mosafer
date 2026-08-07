import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, GuestOnlyRoute } from './routes/guards'





























import { AdminRoute, DriverRoute } from './routes/roleGuards'
import { useAuth } from './contexts/AuthContext'
import { SplashScreen } from './components/SplashScreen'
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
  const { loading } = useAuth()

  if (loading) return <SplashScreen />

  return (
    <BrowserRouter basename="/Mosafer">
        <WhatsAppButton />
        <PageTransition>
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
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
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
        </PageTransition>
      </BrowserRouter>
  )
}
