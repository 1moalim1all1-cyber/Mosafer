import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/theme/app_colors.dart';

class DocumentUploadTile extends StatelessWidget {
  final String label;
  final String hint;
  final Uint8List? selectedBytes;
  final void Function(Uint8List bytes, String filename) onPicked;

  const DocumentUploadTile({
    super.key,
    required this.label,
    required this.hint,
    required this.selectedBytes,
    required this.onPicked,
  });

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (picked != null) {
      final bytes = await picked.readAsBytes();
      onPicked(bytes, picked.name);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isSelected = selectedBytes != null;

    return InkWell(
      onTap: _pickImage,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected ? AppColors.success : AppColors.lightBorder,
            width: isSelected ? 1.6 : 1,
          ),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            if (isSelected)
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.memory(selectedBytes!, width: 56, height: 56, fit: BoxFit.cover),
              )
            else
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: AppColors.lightBackground,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.add_a_photo_outlined),
              ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: Theme.of(context).textTheme.titleMedium),
                  Text(hint, style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            Icon(
              isSelected ? Icons.check_circle : Icons.chevron_left,
              color: isSelected ? AppColors.success : null,
            ),
          ],
        ),
      ),
    );
  }
}
