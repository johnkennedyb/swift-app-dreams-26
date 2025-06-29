
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useWallet } from './useWallet';
import { useToast } from '@/hooks/use-toast';

export const useSupportPayment = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { wallet, refetch: refetchWallet } = useWallet();
  const { toast } = useToast();

  const supportRequest = async (requestId: string, amount: number) => {
    if (!user || !wallet) {
      toast({
        title: "Error",
        description: "Please log in and ensure wallet is loaded",
        variant: "destructive",
      });
      return false;
    }

    if (wallet.balance < amount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds in your wallet",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // Get support request details with project info
      const { data: supportRequestData, error: requestError } = await supabase
        .from('support_requests')
        .select(`
          *,
          projects (
            id,
            name,
            current_funding,
            funding_goal
          )
        `)
        .eq('id', requestId)
        .single();

      if (requestError || !supportRequestData) {
        throw new Error('Support request not found');
      }

      // Start transaction by updating wallet balance
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance - amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);

      if (walletError) throw walletError;

      // Update project funding
      const newProjectFunding = (supportRequestData.projects?.current_funding || 0) + amount;
      const { error: projectError } = await supabase
        .from('projects')
        .update({ 
          current_funding: newProjectFunding,
          updated_at: new Date().toISOString()
        })
        .eq('id', supportRequestData.project_id);

      if (projectError) throw projectError;

      // Update requester's wallet (credit the recipient)
      const { data: requesterWallet, error: requesterWalletFetchError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', supportRequestData.requester_id)
        .eq('currency', 'NGN')
        .single();

      if (requesterWalletFetchError) {
        console.error('Error fetching requester wallet:', requesterWalletFetchError);
      } else {
        const { error: requesterWalletUpdateError } = await supabase
          .from('wallets')
          .update({ 
            balance: requesterWallet.balance + amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', requesterWallet.id);

        if (requesterWalletUpdateError) {
          console.error('Error updating requester wallet:', requesterWalletUpdateError);
        }
      }

      // Create transaction record for supporter (debit)
      const { error: supporterTransactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            type: 'debit',
            amount: amount,
            description: `Support for: ${supportRequestData.title}`,
            status: 'completed',
            project_id: supportRequestData.project_id,
            recipient_id: supportRequestData.requester_id,
          }
        ]);

      if (supporterTransactionError) {
        console.error('Error creating supporter transaction:', supporterTransactionError);
      }

      // Create transaction record for requester (credit)
      const { error: requesterTransactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: supportRequestData.requester_id,
            type: 'credit',
            amount: amount,
            description: `Support received from user for: ${supportRequestData.title}`,
            status: 'completed',
            project_id: supportRequestData.project_id,
          }
        ]);

      if (requesterTransactionError) {
        console.error('Error creating requester transaction:', requesterTransactionError);
      }

      // Refresh wallet data
      refetchWallet();
      
      toast({
        title: "Success",
        description: `Successfully supported with ₦${amount.toLocaleString()}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error supporting request:', error);
      toast({
        title: "Error",
        description: "Failed to process support payment",
        variant: "destructive",
      });
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
