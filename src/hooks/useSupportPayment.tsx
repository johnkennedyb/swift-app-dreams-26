
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useWallet } from './useWallet';

export const useSupportPayment = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { wallet, refetch: refetchWallet } = useWallet();

  const supportRequest = async (requestId: string, amount: number) => {
    if (!user || !wallet) return false;

    setLoading(true);
    try {
      // Get support request details
      const { data: supportRequest, error: requestError } = await supabase
        .from('support_requests')
        .select('*, projects(*)')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Check wallet balance
      if (wallet.balance < amount) {
        throw new Error('Insufficient wallet balance');
      }

      // Create transaction with project_id for better tracking
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            type: 'debit',
            amount: amount,
            description: `Support for: ${supportRequest.title}`,
            status: 'completed',
            project_id: supportRequest.project_id,
            recipient_id: supportRequest.requester_id,
          }
        ]);

      if (transactionError) throw transactionError;

      // Update wallet balance
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: wallet.balance - amount })
        .eq('id', wallet.id);

      if (walletError) throw walletError;

      // Update project funding
      const { error: projectError } = await supabase
        .from('projects')
        .update({ 
          current_funding: (supportRequest.projects?.current_funding || 0) + amount 
        })
        .eq('id', supportRequest.project_id);

      if (projectError) throw projectError;

      // Refresh wallet data
      refetchWallet();
      
      return true;
    } catch (error) {
      console.error('Error supporting request:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    supportRequest,
    loading,
  };
};
