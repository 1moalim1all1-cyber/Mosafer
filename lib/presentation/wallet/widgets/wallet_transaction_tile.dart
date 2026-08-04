import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../domain/entities/wallet_transaction_entity.dart';
import '../../../core/theme/app_colors.dart';

class WalletTransactionTile extends StatelessWidget {
  final WalletTransactionEntity transaction;
  const WalletTransactionTile({super.key, required this.transaction});

  IconData get _icon {
    switch (transaction.type) {
      case WalletTransactionType.deposit:
        return Icons.add_circle_outline;
      case WalletTransactionType.withdraw:
        return Icons.remove_circle_outline;
      case WalletTransactionType.payment:
        return Icons.directions_car_outlined;
      case WalletTransactionType.refund:
        return Icons.replay_circle_filled_outlined;
      case WalletTransactionType.commission:
        return Icons.percent;
    }
  }

  String get _label {
    switch (transaction.type) {
      case WalletTransactionType.deposit:
        return 'إيداع';
      case WalletTransactionType.withdraw:
        return 'سحب';
      case WalletTransactionType.payment:
        return 'دفع ثمن رحلة';
      case WalletTransactionType.refund:
        return 'استرداد';
      case WalletTransactionType.commission:
        return 'عمولة المنصة';
    }
  }

  String get _statusLabel {
    switch (transaction.status) {
      case WalletTransactionStatus.pending:
        return 'بانتظار الموافقة';
      case WalletTransactionStatus.completed:
        return '';
      case WalletTransactionStatus.rejected:
        return 'مرفوض';
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('d MMM - hh:mm a', 'ar');
    final isCredit = transaction.isCredit;
    final sign = isCredit ? '+' : '-';
    final color = transaction.status == WalletTransactionStatus.pending
        ? AppColors.warning
        : (isCredit ? AppColors.success : AppColors.error);

    return ListTile(
      leading: CircleAvatar(
        backgroundColor: color.withValues(alpha: 0.12),
        child: Icon(_icon, color: color),
      ),
      title: Text(_label),
      subtitle: Text(
        _statusLabel.isEmpty
            ? dateFormat.format(transaction.createdAt)
            : '$_statusLabel · ${dateFormat.format(transaction.createdAt)}',
      ),
      trailing: Text(
        '$sign${transaction.amount.toStringAsFixed(0)} ج.م',
        style: TextStyle(color: color, fontWeight: FontWeight.w700),
      ),
    );
  }
}
