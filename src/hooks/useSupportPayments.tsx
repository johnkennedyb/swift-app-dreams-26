
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SupportPayment {
  id: string;
  support_request_id: string;
  donor_name: string;
  donor_email: string;
  amount: number;
  paystack_reference: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

export const useSupportPayments = (supportRequestId?: string) => {
  const [payments, setPayments] = useState<SupportPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (supportRequestId) {
      fetchPayments();
    } else {
      setPayments([]);
      setTotalAmount(0);
      setLoading(false);
    }
  }, [supportRequestId]);

  const fetchPayments = async () => {
    try {
      console.log('Fetching support payments for request:', supportRequestId);
      const { data, error } = await supabase
        .from('support_payments')
        .select('*')
        .eq('support_request_id', supportRequestId)
        .eq('payment_status', 'completed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching support payments:', error);
        throw error;
      }
      
      console.log('Fetched support payments:', data);
      setPayments(data || []);
      
      // Calculate total amount
      const total = (data || []).reduce((sum, payment) => sum + Number(payment.amount), 0);
      setTotalAmount(total);
    } catch (error) {
      console.error('Error fetching support payments:', error);
      setPayments([]);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (
    reference: string,
    supportRequestId: string,
    donorName: string,
    donorEmail: string
  ) => {
    try {
      console.log('Verifying support payment:', { reference, supportRequestId, donorName, donorEmail });
      
      const { data, error } = await supabase.functions.invoke('verify-support-payment', {
        body: {
          reference,
          support_request_id: supportRequestId,
          donor_name: donorName,
          donor_email: donorEmail,
        },
      });

      console.log('Support payment verification response:', { data, error });

      if (error) {
        throw new Error(error.message || 'Payment verification failed');
      }

      // Refresh payments list
      await fetchPayments();
      
      return { success: true, data };
    } catch (error) {
      console.error('Support payment verification error:', error);
      throw error;
    }
  };

  return {
    payments,
    loading,
    totalAmount,
    verifyPayment,
    refetch: fetchPayments,
  };
};
