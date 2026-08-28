import { useState, useCallback, useEffect } from 'react';
import { Wallet, WalletTransaction } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export function useWallet(userId: string) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    try {
      const walletRef = doc(db, 'wallets', userId);
      const snapshot = await getDoc(walletRef);
      if (snapshot.exists()) {
        setWallet({ id: snapshot.id, ...snapshot.data() } as Wallet);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchTransactions = useCallback(async () => {
    try {
      const q = query(
        collection(db, 'wallet_transactions'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const fetchedTransactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as WalletTransaction[];
      setTransactions(fetchedTransactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    }
  }, [userId]);

  const addBalance = useCallback(async (amount: number, method: string) => {
    try {
      const walletRef = doc(db, 'wallets', userId);
      const currentWallet = wallet || { balance: 0, totalAddedBalance: 0 };
      await updateDoc(walletRef, {
        balance: (currentWallet.balance || 0) + amount,
        totalAddedBalance: (currentWallet.totalAddedBalance || 0) + amount,
        updatedAt: new Date().toISOString(),
      });
      await addDoc(collection(db, 'wallet_transactions'), {
        walletId: userId,
        userId,
        type: 'credit',
        amount,
        description: 'Balance added',
        method,
        status: 'completed',
        createdAt: new Date().toISOString(),
      });
      await fetchWallet();
      await fetchTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add balance');
    }
  }, [userId, wallet, fetchWallet, fetchTransactions]);

  const deductBalance = useCallback(async (amount: number, description: string) => {
    try {
      const walletRef = doc(db, 'wallets', userId);
      const currentWallet = wallet || { balance: 0, totalSpentBalance: 0 };
      if ((currentWallet.balance || 0) < amount) {
        setError('Insufficient balance');
        return false;
      }
      await updateDoc(walletRef, {
        balance: (currentWallet.balance || 0) - amount,
        totalSpentBalance: (currentWallet.totalSpentBalance || 0) + amount,
        updatedAt: new Date().toISOString(),
      });
      await addDoc(collection(db, 'wallet_transactions'), {
        walletId: userId,
        userId,
        type: 'debit',
        amount,
        description,
        method: 'booking',
        status: 'completed',
        createdAt: new Date().toISOString(),
      });
      await fetchWallet();
      await fetchTransactions();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deduct balance');
      return false;
    }
  }, [userId, wallet, fetchWallet, fetchTransactions]);

  useEffect(() => {
    if (userId) {
      fetchWallet();
      fetchTransactions();
    }
  }, [userId, fetchWallet, fetchTransactions]);

  return {
    wallet,
    transactions,
    loading,
    error,
    fetchWallet,
    fetchTransactions,
    addBalance,
    deductBalance,
  };
}
