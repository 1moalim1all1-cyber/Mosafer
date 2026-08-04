import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

/// خدمة رفع الصور على Cloudinary باستخدام Unsigned Upload Preset.
/// السبب في استخدام Unsigned Upload: يسمح بالرفع مباشرة من التطبيق
/// بدون الحاجة لتمرير الـ API Secret داخل كود العميل (أكثر أمانًا).
///
/// الإعداد المطلوب في لوحة Cloudinary (مرة واحدة، مجانًا):
/// Settings -> Upload -> Add upload preset -> Signing Mode: Unsigned
class CloudinaryService {
  CloudinaryService._();
  static final CloudinaryService instance = CloudinaryService._();

  String get _cloudName => dotenv.env['CLOUDINARY_CLOUD_NAME'] ?? '';
  String get _uploadPreset => dotenv.env['CLOUDINARY_UPLOAD_PRESET'] ?? '';

  /// رفع صورة واحدة وإرجاع رابط secure_url
  /// [folder] مثال: 'drivers/national_id' أو 'users/profile'
  Future<String> uploadImage({
    required File imageFile,
    required String folder,
  }) async {
    final uri =
        Uri.parse('https://api.cloudinary.com/v1_1/$_cloudName/image/upload');

    final request = http.MultipartRequest('POST', uri)
      ..fields['upload_preset'] = _uploadPreset
      ..fields['folder'] = folder
      ..files.add(await http.MultipartFile.fromPath('file', imageFile.path));

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode != 200) {
      throw CloudinaryUploadException(
        'فشل رفع الصورة: ${response.statusCode} - ${response.body}',
      );
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return data['secure_url'] as String;
  }

  /// رفع عدة صور دفعة واحدة (مثال: مستندات السائق الخمسة)
  Future<List<String>> uploadMultiple({
    required List<File> files,
    required String folder,
  }) async {
    final urls = <String>[];
    for (final file in files) {
      final url = await uploadImage(imageFile: file, folder: folder);
      urls.add(url);
    }
    return urls;
  }
}

class CloudinaryUploadException implements Exception {
  final String message;
  CloudinaryUploadException(this.message);
  @override
  String toString() => message;
}
