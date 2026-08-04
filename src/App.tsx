import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, GuestOnlyRoute } from './routes/guards'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RoleSelectionPage from './pages/RoleSelectionPage'
import HomePage from './pages/HomePage'
import SearchResultsPage from './pages/SearchResultsPage'
import TripDetailsPage from './pages/TripDetailsPage'
import DriverDocumentsPage from './pages/DriverDocumentsPage'
import DriverPendingApprovalPage from './pages/DriverPendingApprovalPage'
import DriverDashboardPage from './pages/DriverDashboardPage'
import CreateTripPage from './pages/CreateTripPage'
import DriverTripBookingsPage from './pages/DriverTripBookingsPage'
import WalletPage from './pages/WalletPage'
import MyBookingsPage from './pages/MyBookingsPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminDriverQueuePage from './pages/AdminDriverQueuePage'
import AdminWalletRequestsPage from './pages/AdminWalletRequestsPage'
import AdminGovernoratesPage from './pages/AdminGovernoratesPage'
import AdminCouponsPage from './pages/AdminCouponsPage'
import NotificationsPage from './pages/NotificationsPage'
import ChatPage from './pages/ChatPage'
import FavoritesPage from './pages/FavoritesPage'
import StaticPageView from './pages/StaticPageView'
import { AdminRoute, DriverRoute } from './routes/roleGuards'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
          <Route path="/page/:pageId" element={<StaticPageView />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
