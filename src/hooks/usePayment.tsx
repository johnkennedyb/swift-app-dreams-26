
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
    console.log(`Processing payment: Amount=${amount}, Email=${email}`);

    try {
      // Test Paystack API connection first
      const reference = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Testing Paystack API with reference:', reference);
      
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

      console.log('Paystack response:', paymentResponse);

      if (!paymentResponse.status) {
        console.error('Paystack initialization failed:', paymentResponse.message);
        
        // Check if it's an API key issue
        if (paymentResponse.message?.includes('Invalid key') || paymentResponse.message?.includes('authorization')) {
          toast({
            title: "Payment Configuration Error",
            description: "Paystack API key is not properly configured. Please check your settings.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Payment Error",
            description: paymentResponse.message || "Failed to initialize payment",
            variant: "destructive",
          });
        }
        return null;
      }

      console.log('Payment initialization successful, opening payment URL...');
      
      // Open Paystack payment popup
      if (paymentResponse.data?.authorization_url) {
        openPaystackPayment(paymentResponse.data.authorization_url);
        
        toast({
          title: "Payment Initialized",
          description: "Complete your payment in the new window",
        });
      } else {
        throw new Error('No authorization URL received from Paystack');
      }

      return {
        reference,
        authorization_url: paymentResponse.data?.authorization_url,
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

    console.log(`Verifying payment: Reference=${reference}, Amount=${amount}`);

    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          reference,
          user_id: user.id,
          amount,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Payment verification result:', data);

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
