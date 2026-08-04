import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

/// خدمة رفع الصور على Cloudinary باستخدام Unsigned Upload Preset.
/// بتاخد بيانات الصورة كـ Bytes (مش dart:io File) عشان تشتغل على
/// الموبايل والويب من نفس الكود بدون أي تفريع (Conditional Imports).
class CloudinaryService {
  CloudinaryService._();
  static final CloudinaryService instance = CloudinaryService._();

  String get _cloudName => dotenv.env['CLOUDINARY_CLOUD_NAME'] ?? '';
  String get _uploadPreset => dotenv.env['CLOUDINARY_UPLOAD_PRESET'] ?? '';

  /// رفع صورة واحدة من بياناتها الخام وإرجاع رابط secure_url
  /// [folder] مثال: 'drivers/national_id' أو 'users/profile'
  /// [filename] اسم افتراضي للملف (مطلوب لتحديد الامتداد، مش لازم يكون فريد)
  Future<String> uploadImageBytes({
    required List<int> bytes,
    required String folder,
    String filename = 'upload.jpg',
  }) async {
    final uri =
        Uri.parse('https://api.cloudinary.com/v1_1/$_cloudName/image/upload');

    final request = http.MultipartRequest('POST', uri)
      ..fields['upload_preset'] = _uploadPreset
      ..fields['folder'] = folder
      ..files.add(http.MultipartFile.fromBytes('file', bytes, filename: filename));

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
}

class CloudinaryUploadException implements Exception {
  final String message;
  CloudinaryUploadException(this.message);
  @override
  String toString() => message;
}
