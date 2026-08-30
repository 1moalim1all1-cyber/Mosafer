export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  name: string;
  avatar?: string;
  permissions: AdminPermission[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type AdminPermission = 
  | 'manage_users'
  | 'manage_drivers'
  | 'manage_trips'
  | 'manage_bookings'
  | 'manage_payments'
  | 'manage_coupons'
  | 'manage_reports'
  | 'manage_support'
  | 'view_analytics'
  | 'manage_admins';

export interface AdminDashboardStats {
  totalUsers: number;
  totalDrivers: number;
  totalTrips: number;
  totalBookings: number;
  totalRevenue: number;
  activeTrips: number;
  pendingApprovals: number;
  reportedIssues: number;
}

export interface ReportedIssue {
  id: string;
  reportedBy: string;
  reportedUser: string;
  type: 'inappropriate_behavior' | 'safety_concern' | 'fraud' | 'other';
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tripId?: string;
  bookingId?: string;
  evidence?: string[];
  resolution?: string;
  actionTaken?: string;
  reportedAt: string;
  resolvedAt?: string;
}

export interface SystemLog {
  id: string;
  action: string;
  adminId: string;
  targetType: 'user' | 'driver' | 'trip' | 'booking' | 'admin';
  targetId: string;
  changes?: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
}

export interface Governorate {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  region?: string;
  isActive: boolean;
  createdAt: string;
}
