class AppConstants {
  AppConstants._();

  static const String appName = 'مسافر';
  static const String appNameEn = 'Mosafer';

  // ---- Firestore Collection Names ----
  static const String usersCollection = 'users';
  static const String driversCollection = 'drivers';
  static const String tripsCollection = 'trips';
  static const String bookingsCollection = 'bookings';
  static const String walletsCollection = 'wallets';
  static const String walletTransactionsSubCollection = 'walletTransactions';
  static const String ratingsCollection = 'ratings';
  static const String chatsCollection = 'chats';
  static const String messagesSubCollection = 'messages';
  static const String notificationsCollection = 'notifications';
  static const String reportsCollection = 'reports';
  static const String couponsCollection = 'coupons';
  static const String governoratesCollection = 'governorates';
  static const String citiesCollection = 'cities';
  static const String carTypesCollection = 'carTypes';
  static const String appSettingsCollection = 'appSettings';
  static const String pagesCollection = 'pages';

  // ---- Cloudinary Folders ----
  static const String cloudinaryProfileFolder = 'mosafer/users/profile';
  static const String cloudinaryNationalIdFolder =
      'mosafer/drivers/national_id';
  static const String cloudinaryLicenseFolder = 'mosafer/drivers/license';
  static const String cloudinaryVehicleFolder = 'mosafer/drivers/vehicle';

  // ---- SharedPreferences Keys ----
  static const String keyLanguage = 'app_language';
  static const String keyThemeMode = 'app_theme_mode';
  static const String keyOnboardingSeen = 'onboarding_seen';

  // ---- Business Rules ----
  static const int minDriverAge = 21;
  static const double platformCommissionPercent = 10.0; // العمولة القياسية
  static const double returnEmptyTripCommissionPercent =
      5.0; // عمولة مخفضة لـ"راجع فاضي" لتشجيع المعروض الرخيص
  static const int cancellationFreeWindowHours =
      24; // إلغاء مجاني قبل الرحلة بـ24 ساعة
}
