
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { initializePayment, openPaystackPayment } from '@/services/paystackService';

export const usePayment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const processPayment = async (amount: number, email: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to make a payment",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Initialize payment with Paystack
      const reference = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const paymentResponse = await initializePayment({
        email,
        amount,
        currency: 'NGN',
        reference,
        metadata: {
          user_id: user.id,
          purpose: 'wallet_funding',
        },
      });

      if (!paymentResponse.status) {
        throw new Error(paymentResponse.message);
      }

      // Open Paystack payment popup
      openPaystackPayment(paymentResponse.data!.authorization_url);

      // Listen for payment completion (in a real app, you'd use Paystack's callback)
      // For now, we'll provide a manual verification method
      return {
        reference,
        authorization_url: paymentResponse.data!.authorization_url,
        verifyPayment: () => verifyPayment(reference, amount),
      };

    } catch (error: any) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string, amount: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          reference,
          user_id: user.id,
          amount,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Payment Successful",
          description: `₦${data.amount.toLocaleString()} has been added to your wallet`,
        });
        return true;
      } else {
        throw new Error(data.error || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify payment",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    processPayment,
    loading,
  };
};
