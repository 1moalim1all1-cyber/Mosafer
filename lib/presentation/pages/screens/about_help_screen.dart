import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';

class AboutHelpScreen extends StatelessWidget {
  const AboutHelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      ('about', 'من نحن', Icons.info_outline),
      ('faq', 'الأسئلة الشائعة', Icons.help_outline),
      ('contact', 'اتصل بنا', Icons.mail_outline),
      ('terms', 'الشروط والأحكام', Icons.description_outlined),
      ('privacy', 'سياسة الخصوصية', Icons.privacy_tip_outlined),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('عن مسافر ومساعدة')),
      body: ListView.builder(
        itemCount: items.length,
        itemBuilder: (context, index) {
          final (id, title, icon) = items[index];
          return ListTile(
            leading: Icon(icon, color: AppColors.primary),
            title: Text(title),
            trailing: const Icon(Icons.chevron_left),
            onTap: () => id == 'faq'
                ? context.push('/faq')
                : context.push('/page/$id'),
          );
        },
      ),
    );
  }
}
