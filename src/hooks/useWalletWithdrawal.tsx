
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useWallet } from './useWallet';
import { useToast } from '@/hooks/use-toast';

export const useWalletWithdrawal = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { wallet, refetch: refetchWallet } = useWallet();
  const { toast } = useToast();

  const withdrawToBank = async (amount: number, bankDetails: {
    accountNumber: string;
    bankName: string;
    accountName: string;
  }) => {
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

    if (amount < 100) {
      toast({
        title: "Minimum Withdrawal",
        description: "Minimum withdrawal amount is ₦100",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // Update wallet balance
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance - amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);

      if (walletError) throw walletError;

      // Create withdrawal transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            type: 'debit',
            amount: amount,
            description: `Withdrawal to ${bankDetails.bankName} - ${bankDetails.accountNumber}`,
            status: 'completed',
            reference: `WD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          }
        ]);

      if (transactionError) throw transactionError;

      // Refresh wallet data
      refetchWallet();
      
      toast({
        title: "Success",
        description: `Successfully withdrew ₦${amount.toLocaleString()} to your bank account`,
      });
      
      return true;
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: "Error",
        description: "Failed to process withdrawal",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    withdrawToBank,
    loading,
  };
};
