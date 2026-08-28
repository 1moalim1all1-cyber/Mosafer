import { useState, useCallback } from 'react';
import { AdminDashboardStats, ReportedIssue, SystemLog } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, getDoc, doc, addDoc, updateDoc, countDocuments } from 'firebase/firestore';

export function useAdmin() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [reports, setReports] = useState<ReportedIssue[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const driversSnap = await getDocs(collection(db, 'drivers'));
      const tripsSnap = await getDocs(collection(db, 'trips'));
      const bookingsSnap = await getDocs(collection(db, 'bookings'));
      const reportsSnap = await getDocs(
        query(collection(db, 'reported_issues'), where('status', '==', 'open'))
      );

      setStats({
        totalUsers: usersSnap.size,
        totalDrivers: driversSnap.size,
        totalTrips: tripsSnap.size,
        totalBookings: bookingsSnap.size,
        totalRevenue: 0,
        activeTrips: 0,
        pendingApprovals: 0,
        reportedIssues: reportsSnap.size,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReportedIssues = useCallback(async (status?: string) => {
    try {
      const q = status
        ? query(collection(db, 'reported_issues'), where('status', '==', status))
        : collection(db, 'reported_issues');
      const snapshot = await getDocs(q);
      const fetchedReports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ReportedIssue[];
      setReports(fetchedReports);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    }
  }, []);

  const updateReportStatus = useCallback(async (reportId: string, status: string, resolution?: string) => {
    try {
      const reportRef = doc(db, 'reported_issues', reportId);
      await updateDoc(reportRef, {
        status,
        resolution,
        resolvedAt: new Date().toISOString(),
      });
      await fetchReportedIssues();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update report');
    }
  }, [fetchReportedIssues]);

  const fetchSystemLogs = useCallback(async (filters?: any) => {
    try {
      const q = filters
        ? query(collection(db, 'system_logs'), where('action', '==', filters.action))
        : collection(db, 'system_logs');
      const snapshot = await getDocs(q);
      const fetchedLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SystemLog[];
      setLogs(fetchedLogs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    }
  }, []);

  return {
    stats,
    reports,
    logs,
    loading,
    error,
    fetchDashboardStats,
    fetchReportedIssues,
    updateReportStatus,
    fetchSystemLogs,
  };
}
