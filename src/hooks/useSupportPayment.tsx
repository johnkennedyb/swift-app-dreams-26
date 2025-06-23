
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from './useWallet';

export const useSupportPayment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refetch: refetchWallet } = useWallet();
  const [loading, setLoading] = useState(false);

  const supportRequest = async (supportRequestId: string, amount: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to support this request",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log(`Supporting request: ${supportRequestId} with amount: ${amount}`);

    try {
      // Check if user has sufficient balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .eq('currency', 'NGN')
        .single();

      if (walletError) throw walletError;

      if (wallet.balance < amount) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough funds to support this request",
          variant: "destructive",
        });
        return false;
      }

      // Get support request details
      const { data: supportRequest, error: requestError } = await supabase
        .from('support_requests')
        .select('requester_id, title')
        .eq('id', supportRequestId)
        .single();

      if (requestError) throw requestError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'debit',
          amount: amount,
          description: `Support for: ${supportRequest.title}`,
          reference: `SUPPORT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          recipient_id: supportRequest.requester_id,
          status: 'completed',
        });

      if (transactionError) throw transactionError;

      // Update sender's wallet (debit)
      const { error: senderWalletError } = await supabase
        .from('wallets')
        .update({
          balance: supabase.sql`balance - ${amount}`,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('currency', 'NGN');

      if (senderWalletError) throw senderWalletError;

      // Update recipient's wallet (credit)
      const { error: recipientWalletError } = await supabase
        .from('wallets')
        .update({
          balance: supabase.sql`balance + ${amount}`,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', supportRequest.requester_id)
        .eq('currency', 'NGN');

      if (recipientWalletError) throw recipientWalletError;

      // Create transaction for recipient
      const { error: recipientTransactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: supportRequest.requester_id,
          type: 'credit',
          amount: amount,
          description: `Support received for: ${supportRequest.title}`,
          reference: `SUPPORT_REC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          recipient_id: user.id,
          status: 'completed',
        });

      if (recipientTransactionError) throw recipientTransactionError;

      toast({
        title: "Support Sent",
        description: `₦${amount.toLocaleString()} has been sent successfully`,
      });

      refetchWallet();
      return true;

    } catch (error: any) {
      console.error('Support payment error:', error);
      toast({
        title: "Support Error",
        description: error.message || "Failed to process support payment",
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
