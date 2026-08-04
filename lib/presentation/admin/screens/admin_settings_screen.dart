import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/admin_providers.dart';
import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/app_button.dart';
import '../../../domain/entities/admin_entities.dart';

class AdminSettingsScreen extends ConsumerStatefulWidget {
  const AdminSettingsScreen({super.key});

  @override
  ConsumerState<AdminSettingsScreen> createState() => _AdminSettingsScreenState();
}

class _AdminSettingsScreenState extends ConsumerState<AdminSettingsScreen> {
  final _commissionController = TextEditingController();
  final _commissionEmptyController = TextEditingController();
  final _facebookController = TextEditingController();
  final _instagramController = TextEditingController();
  final _whatsappController = TextEditingController();
  final _supportEmailController = TextEditingController();

  bool _initialized = false;
  bool _isSaving = false;

  void _populateFromSettings(AppSettingsEntity settings) {
    if (_initialized) return;
    _commissionController.text = settings.commissionStandardPercent.toString();
    _commissionEmptyController.text = settings.commissionReturnEmptyPercent.toString();
    _facebookController.text = settings.facebookUrl ?? '';
    _instagramController.text = settings.instagramUrl ?? '';
    _whatsappController.text = settings.whatsappNumber ?? '';
    _supportEmailController.text = settings.supportEmail;
    _initialized = true;
  }

  Future<void> _save() async {
    setState(() => _isSaving = true);
    try {
      final settings = AppSettingsEntity(
        commissionStandardPercent: double.tryParse(_commissionController.text) ?? 10,
        commissionReturnEmptyPercent:
            double.tryParse(_commissionEmptyController.text) ?? 5,
        facebookUrl: _facebookController.text.trim(),
        instagramUrl: _instagramController.text.trim(),
        whatsappNumber: _whatsappController.text.trim(),
        supportEmail: _supportEmailController.text.trim(),
      );
      await ref.read(adminConfigRepositoryProvider).updateAppSettings(settings);
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('تم حفظ الإعدادات')));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final settingsAsync = ref.watch(adminAppSettingsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الإعدادات العامة')),
      body: settingsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('حصل خطأ')),
        data: (settings) {
          _populateFromSettings(settings);
          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('العمولات', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 12),
                AppTextField(
                  controller: _commissionController,
                  label: 'عمولة الرحلة العادية (%)',
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),
                AppTextField(
                  controller: _commissionEmptyController,
                  label: 'عمولة "راجع فاضي" (%)',
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 24),
                Text('وسائل التواصل', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 12),
                AppTextField(controller: _facebookController, label: 'رابط فيسبوك'),
                const SizedBox(height: 12),
                AppTextField(controller: _instagramController, label: 'رابط إنستجرام'),
                const SizedBox(height: 12),
                AppTextField(
                  controller: _whatsappController,
                  label: 'رقم واتساب الدعم',
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 12),
                AppTextField(
                  controller: _supportEmailController,
                  label: 'بريد الدعم الفني',
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 24),
                AppButton(label: 'حفظ الإعدادات', isLoading: _isSaving, onPressed: _save),
              ],
            ),
          );
        },
      ),
    );
  }
}
