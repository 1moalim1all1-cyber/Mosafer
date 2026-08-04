import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/driver_providers.dart';
import '../widgets/document_upload_tile.dart';
import '../../auth/providers/auth_providers.dart';
import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/app_button.dart';
import '../../../domain/entities/driver_entity.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/routing/app_router.dart';

class DriverDocumentsScreen extends ConsumerStatefulWidget {
  const DriverDocumentsScreen({super.key});

  @override
  ConsumerState<DriverDocumentsScreen> createState() =>
      _DriverDocumentsScreenState();
}

class _DriverDocumentsScreenState extends ConsumerState<DriverDocumentsScreen> {
  Uint8List? _nationalId;
  Uint8List? _license;
  Uint8List? _vehicleLicense;
  Uint8List? _vehicleImage;
  Uint8List? _selfie;

  final _makeController = TextEditingController();
  final _modelController = TextEditingController();
  final _yearController = TextEditingController();
  final _colorController = TextEditingController();
  final _plateController = TextEditingController();
  final _seatsController = TextEditingController(text: '4');

  bool get _allDocsSelected =>
      _nationalId != null &&
      _license != null &&
      _vehicleLicense != null &&
      _vehicleImage != null &&
      _selfie != null;

  bool get _vehicleFormValid =>
      _makeController.text.trim().isNotEmpty &&
      _modelController.text.trim().isNotEmpty &&
      _plateController.text.trim().isNotEmpty &&
      int.tryParse(_yearController.text) != null;

  Future<void> _submit() async {
    if (!_allDocsSelected) {
      ref.read(driverDocsUploadErrorProvider.notifier).state =
          'من فضلك ارفع كل المستندات الخمسة';
      return;
    }
    if (!_vehicleFormValid) {
      ref.read(driverDocsUploadErrorProvider.notifier).state =
          'من فضلك أكمل بيانات السيارة كاملة';
      return;
    }

    final user = ref.read(currentUserProvider);
    if (user == null) return;

    ref.read(driverDocsUploadLoadingProvider.notifier).state = true;
    ref.read(driverDocsUploadErrorProvider.notifier).state = null;

    try {
      await ref.read(driverRepositoryProvider).submitDriverDocuments(
            uid: user.uid,
            nationalIdBytes: _nationalId!,
            licenseBytes: _license!,
            vehicleLicenseBytes: _vehicleLicense!,
            vehicleBytes: _vehicleImage!,
            selfieBytes: _selfie!,
            vehicle: VehicleInfo(
              make: _makeController.text.trim(),
              model: _modelController.text.trim(),
              year: int.parse(_yearController.text),
              color: _colorController.text.trim(),
              plateNumber: _plateController.text.trim(),
              carType: 'اقتصادية', // هيتحول لاختيار من قائمة مُدارة بالإدارة لاحقًا
              seats: int.tryParse(_seatsController.text) ?? 4,
            ),
          );

      if (!mounted) return;
      context.go(AppRoutes.driverPendingApproval);
    } catch (_) {
      ref.read(driverDocsUploadErrorProvider.notifier).state =
          'حصل خطأ أثناء رفع المستندات، تأكد من اتصال الإنترنت وحاول تاني';
    } finally {
      if (mounted) ref.read(driverDocsUploadLoadingProvider.notifier).state = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(driverDocsUploadLoadingProvider);
    final error = ref.watch(driverDocsUploadErrorProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('اعتماد السائق')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'المستندات دي بتتراجع من فريق مسافر قبل ما تقدر تنشر أي رحلة، '
              'وده أساسي لأمان الركاب.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 20),

            DocumentUploadTile(
              label: 'بطاقة الرقم القومي',
              hint: 'الوجهين في صورة واحدة واضحة',
              selectedBytes: _nationalId,
              onPicked: (bytes, name) => setState(() => _nationalId = bytes),
            ),
            const SizedBox(height: 12),
            DocumentUploadTile(
              label: 'رخصة القيادة',
              hint: 'سارية الصلاحية',
              selectedBytes: _license,
              onPicked: (bytes, name) => setState(() => _license = bytes),
            ),
            const SizedBox(height: 12),
            DocumentUploadTile(
              label: 'رخصة السيارة',
              hint: 'استمارة السيارة سارية',
              selectedBytes: _vehicleLicense,
              onPicked: (bytes, name) => setState(() => _vehicleLicense = bytes),
            ),
            const SizedBox(height: 12),
            DocumentUploadTile(
              label: 'صورة السيارة',
              hint: 'من برّه، واضحة اللوحة',
              selectedBytes: _vehicleImage,
              onPicked: (bytes, name) => setState(() => _vehicleImage = bytes),
            ),
            const SizedBox(height: 12),
            DocumentUploadTile(
              label: 'صورة شخصية للتحقق',
              hint: 'سيلفي واضح لوجهك',
              selectedBytes: _selfie,
              onPicked: (bytes, name) => setState(() => _selfie = bytes),
            ),

            const SizedBox(height: 28),
            Text('بيانات السيارة', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            AppTextField(controller: _makeController, label: 'الماركة (مثال: Hyundai)'),
            const SizedBox(height: 12),
            AppTextField(controller: _modelController, label: 'الموديل (مثال: Elantra)'),
            const SizedBox(height: 12),
            AppTextField(
              controller: _yearController,
              label: 'سنة الصنع',
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 12),
            AppTextField(controller: _colorController, label: 'اللون'),
            const SizedBox(height: 12),
            AppTextField(controller: _plateController, label: 'رقم اللوحة'),
            const SizedBox(height: 12),
            AppTextField(
              controller: _seatsController,
              label: 'عدد المقاعد المتاحة للركاب',
              keyboardType: TextInputType.number,
            ),

            if (error != null) ...[
              const SizedBox(height: 16),
              Text(error, style: const TextStyle(color: AppColors.error)),
            ],

            const SizedBox(height: 24),
            AppButton(
              label: 'إرسال للمراجعة',
              isLoading: isLoading,
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }
}
