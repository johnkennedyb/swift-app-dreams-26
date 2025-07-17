
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
    bankCode: string;
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
      // First create transfer recipient via Paystack
      const { data: recipientData, error: recipientError } = await supabase.functions.invoke('create-transfer-recipient', {
        body: {
          type: 'nuban',
          name: bankDetails.accountName,
          account_number: bankDetails.accountNumber,
          bank_code: bankDetails.bankCode,
          currency: 'NGN'
        }
      });

      if (recipientError) throw recipientError;
      if (!recipientData.status) throw new Error(recipientData.message);

      // Then initiate the transfer
      const { data: transferData, error: transferError } = await supabase.functions.invoke('initiate-transfer', {
        body: {
          amount: Math.round(amount * 100), // Convert to kobo
          recipient: recipientData.data.recipient_code,
          reason: `Wallet withdrawal to ${bankDetails.bankName}`
        }
      });

      if (transferError) throw transferError;
      if (!transferData.status) throw new Error(transferData.message);

      // Update wallet balance and create transaction record
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance - amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);

      if (walletError) throw walletError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            type: 'debit',
            amount: amount,
            description: `Withdrawal to ${bankDetails.bankName} - ${bankDetails.accountNumber}`,
            status: 'completed',
            reference: transferData.data?.reference || `WD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process withdrawal",
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
