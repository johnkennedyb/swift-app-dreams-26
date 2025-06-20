
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Transaction {
  id: string;
  user_id: string;
  type: 'credit' | 'debit' | 'transfer';
  amount: number;
  description: string | null;
  reference: string | null;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  project_id: string | null;
  recipient_id: string | null;
  paystack_reference: string | null;
  created_at: string;
  updated_at: string;
  projects?: {
    name: string;
  } | null;
  recipient_profile?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          projects (
            name
          ),
          recipient_profile:profiles!transactions_recipient_id_fkey (
            first_name,
            last_name
          )
        `)
        .or(`user_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transactionData: {
    type: 'credit' | 'debit' | 'transfer';
    amount: number;
    description?: string;
    project_id?: string;
    recipient_id?: string;
    paystack_reference?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            ...transactionData,
            user_id: user?.id,
            reference: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      fetchTransactions();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating transaction:', error);
      return { data: null, error };
    }
  };

  return {
    transactions,
    loading,
    createTransaction,
    refetch: fetchTransactions,
  };
};
