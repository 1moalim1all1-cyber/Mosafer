import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../presentation/auth/screens/splash_screen.dart';
import '../../presentation/auth/screens/role_selection_screen.dart';
import '../../presentation/auth/screens/register_screen.dart';
import '../../presentation/auth/screens/login_screen.dart';
import '../../presentation/auth/screens/forgot_password_screen.dart';
import '../../presentation/auth/providers/auth_providers.dart';
import '../../presentation/trips/screens/home_screen.dart';
import '../../presentation/trips/screens/search_results_screen.dart';
import '../../presentation/trips/screens/trip_details_screen.dart';
import '../../presentation/driver/screens/driver_documents_screen.dart';
import '../../presentation/driver/screens/driver_pending_approval_screen.dart';
import '../../presentation/driver/screens/driver_dashboard_screen.dart';
import '../../presentation/driver/screens/create_trip_screen.dart';
import '../../presentation/driver/screens/driver_trip_bookings_screen.dart';
import '../../presentation/wallet/screens/wallet_screen.dart';
import '../../presentation/wallet/screens/wallet_action_screen.dart';
import '../../presentation/trips/screens/my_bookings_screen.dart';
import '../../presentation/trips/screens/favorites_screen.dart';
import '../../presentation/pages/screens/about_help_screen.dart';
import '../../presentation/pages/screens/static_page_screen.dart';
import '../../presentation/pages/screens/faq_screen.dart';
import '../../presentation/chat/screens/chat_screen.dart';
import '../../presentation/notifications/screens/notifications_screen.dart';
import '../../presentation/admin/screens/admin_dashboard_screen.dart';
import '../../presentation/admin/screens/admin_driver_queue_screen.dart';
import '../../presentation/admin/screens/admin_driver_review_screen.dart';
import '../../presentation/admin/screens/admin_governorates_screen.dart';
import '../../presentation/admin/screens/admin_car_types_screen.dart';
import '../../presentation/admin/screens/admin_coupons_screen.dart';
import '../../presentation/admin/screens/admin_wallet_requests_screen.dart';
import '../../presentation/admin/screens/admin_settings_screen.dart';

class AppRoutes {
  AppRoutes._();

  static const splash = '/';
  static const roleSelection = '/role-selection';
  static const login = '/login';
  static const register = '/register';
  static const forgotPassword = '/forgot-password';

  static const home = '/home';
  static const search = '/search';
  static const searchResults = '/search-results';
  static const tripDetails = '/trip/:tripId';

  static const passengerDashboard = '/passenger';
  static const driverDashboard = '/driver';
  static const driverDocuments = '/driver/documents';
  static const driverPendingApproval = '/driver/pending-approval';
  static const createTrip = '/driver/create-trip';
  static const driverTripBookings = '/driver/trip/:tripId/bookings';

  static const wallet = '/wallet';
  static const walletDeposit = '/wallet/deposit';
  static const walletWithdraw = '/wallet/withdraw';
  static const chat = '/chat/:chatId';
  static const notifications = '/notifications';
  static const profile = '/profile';
  static const favorites = '/favorites';
  static const myBookings = '/my-bookings';
  static const about = '/about-help';
  static const staticPage = '/page/:pageId';
  static const faq = '/faq';

  static const adminDashboard = '/admin';
  static const adminDrivers = '/admin/drivers';
  static const adminDriverReview = '/admin/drivers/:driverId';
  static const adminGovernorates = '/admin/governorates';
  static const adminCarTypes = '/admin/car-types';
  static const adminCoupons = '/admin/coupons';
  static const adminWalletRequests = '/admin/wallet-requests';
  static const adminSettings = '/admin/settings';
}

/// الراوتر بيتبنى كـ Provider عشان يقدر "يسمع" حالة تسجيل الدخول
/// ويحوّل المستخدم أوتوماتيك (مثلاً لو الـ Session انتهت فجأة، يرجعه لصفحة الدخول)
final goRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateChangesProvider);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: false,
    redirect: (context, state) {
      final isSplash = state.matchedLocation == AppRoutes.splash;
      if (isSplash) return null; // الـ Splash نفسها بتتحكم في أول توجيه

      final currentUser = authState.valueOrNull;
      final isLoggedIn = currentUser != null;
      final isAuthRoute = [
        AppRoutes.login,
        AppRoutes.register,
        AppRoutes.roleSelection,
        AppRoutes.forgotPassword,
      ].contains(state.matchedLocation);

      // صفحات عامة (من نحن، الشروط، الخصوصية، الأسئلة الشائعة) متاحة
      // حتى من غير تسجيل دخول، زي أي تطبيق حقيقي.
      final isPublicPage = state.matchedLocation.startsWith('/page/') ||
          state.matchedLocation == AppRoutes.faq;

      if (!isLoggedIn && !isAuthRoute && !isPublicPage) return AppRoutes.login;
      if (isLoggedIn && isAuthRoute) return AppRoutes.home;

      // حماية مسارات لوحة الإدارة بالكامل - غير الأدمن يترفض فورًا
      final isAdminRoute = state.matchedLocation.startsWith('/admin');
      if (isAdminRoute && (currentUser == null || !currentUser.isAdmin)) {
        return AppRoutes.home;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: AppRoutes.roleSelection,
        builder: (context, state) => const RoleSelectionScreen(),
      ),
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.register,
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: AppRoutes.forgotPassword,
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: AppRoutes.home,
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: AppRoutes.searchResults,
        builder: (context, state) => const SearchResultsScreen(),
      ),
      GoRoute(
        path: AppRoutes.tripDetails,
        builder: (context, state) {
          final tripId = state.pathParameters['tripId']!;
          return TripDetailsScreen(tripId: tripId);
        },
      ),
      GoRoute(
        path: AppRoutes.profile,
        builder: (context, state) => const _ProfilePlaceholder(),
      ),
      GoRoute(
        path: AppRoutes.driverDocuments,
        builder: (context, state) => const DriverDocumentsScreen(),
      ),
      GoRoute(
        path: AppRoutes.driverPendingApproval,
        builder: (context, state) => const DriverPendingApprovalScreen(),
      ),
      GoRoute(
        path: AppRoutes.driverDashboard,
        builder: (context, state) => const DriverDashboardScreen(),
      ),
      GoRoute(
        path: AppRoutes.createTrip,
        builder: (context, state) => const CreateTripScreen(),
      ),
      GoRoute(
        path: AppRoutes.driverTripBookings,
        builder: (context, state) {
          final tripId = state.pathParameters['tripId']!;
          return DriverTripBookingsScreen(tripId: tripId);
        },
      ),
      GoRoute(
        path: AppRoutes.wallet,
        builder: (context, state) => const WalletScreen(),
      ),
      GoRoute(
        path: AppRoutes.walletDeposit,
        builder: (context, state) =>
            const WalletActionScreen(actionType: WalletActionType.deposit),
      ),
      GoRoute(
        path: AppRoutes.walletWithdraw,
        builder: (context, state) =>
            const WalletActionScreen(actionType: WalletActionType.withdraw),
      ),
      GoRoute(
        path: AppRoutes.myBookings,
        builder: (context, state) => const MyBookingsScreen(),
      ),
      GoRoute(
        path: AppRoutes.favorites,
        builder: (context, state) => const FavoritesScreen(),
      ),
      GoRoute(
        path: AppRoutes.about,
        builder: (context, state) => const AboutHelpScreen(),
      ),
      GoRoute(
        path: AppRoutes.staticPage,
        builder: (context, state) {
          final pageId = state.pathParameters['pageId']!;
          return StaticPageScreen(pageId: pageId);
        },
      ),
      GoRoute(
        path: AppRoutes.faq,
        builder: (context, state) => const FaqScreen(),
      ),
      GoRoute(
        path: AppRoutes.chat,
        builder: (context, state) {
          final chatId = state.pathParameters['chatId']!;
          return ChatScreen(chatId: chatId);
        },
      ),
      GoRoute(
        path: AppRoutes.notifications,
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminDashboard,
        builder: (context, state) => const AdminDashboardScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminDrivers,
        builder: (context, state) => const AdminDriverQueueScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminDriverReview,
        builder: (context, state) {
          final driverId = state.pathParameters['driverId']!;
          return AdminDriverReviewScreen(driverId: driverId);
        },
      ),
      GoRoute(
        path: AppRoutes.adminGovernorates,
        builder: (context, state) => const AdminGovernoratesScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminCarTypes,
        builder: (context, state) => const AdminCarTypesScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminCoupons,
        builder: (context, state) => const AdminCouponsScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminWalletRequests,
        builder: (context, state) => const AdminWalletRequestsScreen(),
      ),
      GoRoute(
        path: AppRoutes.adminSettings,
        builder: (context, state) => const AdminSettingsScreen(),
      ),
    ],
  );
});

/// شاشة بروفايل مبدئية فيها زرار تسجيل خروج فقط - التفاصيل الكاملة
/// (رحلاتي، المفضلة، الإعدادات) هتتضاف في مرحلة لاحقة.
class _ProfilePlaceholder extends ConsumerWidget {
  const _ProfilePlaceholder();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('الملف الشخصي')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (user?.isDriver == true) ...[
              ElevatedButton.icon(
                icon: const Icon(Icons.dashboard_outlined),
                label: const Text('لوحة السائق'),
                onPressed: () => context.push(AppRoutes.driverDashboard),
              ),
              const SizedBox(height: 12),
            ],
            if (user?.isAdmin == true) ...[
              ElevatedButton.icon(
                icon: const Icon(Icons.admin_panel_settings_outlined),
                label: const Text('لوحة الإدارة'),
                onPressed: () => context.push(AppRoutes.adminDashboard),
              ),
              const SizedBox(height: 12),
            ],
            OutlinedButton.icon(
              icon: const Icon(Icons.account_balance_wallet_outlined),
              label: const Text('المحفظة'),
              onPressed: () => context.push(AppRoutes.wallet),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              icon: const Icon(Icons.list_alt_outlined),
              label: const Text('رحلاتي'),
              onPressed: () => context.push(AppRoutes.myBookings),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              icon: const Icon(Icons.favorite_border),
              label: const Text('المفضلة'),
              onPressed: () => context.push(AppRoutes.favorites),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              icon: const Icon(Icons.info_outline),
              label: const Text('عن مسافر ومساعدة'),
              onPressed: () => context.push(AppRoutes.about),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              icon: const Icon(Icons.logout),
              label: const Text('تسجيل الخروج'),
              onPressed: () => ref.read(authRepositoryProvider).logout(),
            ),
          ],
        ),
      ),
    );
  }
}
