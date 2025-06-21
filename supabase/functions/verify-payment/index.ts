
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyPaymentRequest {
  reference: string;
  user_id: string;
  amount: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { reference, user_id, amount }: VerifyPaymentRequest = await req.json();

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
    });

    const paymentData = await paystackResponse.json();

    if (!paymentData.status || paymentData.data.status !== 'success') {
      return new Response(
        JSON.stringify({ error: 'Payment verification failed' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const verifiedAmount = paymentData.data.amount / 100; // Convert from kobo to naira

    // Update user wallet
    const { error: walletError } = await supabaseClient
      .from('wallets')
      .update({
        balance: supabaseClient.sql`balance + ${verifiedAmount}`,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user_id)
      .eq('currency', 'NGN');

    if (walletError) {
      console.error('Wallet update error:', walletError);
      return new Response(
        JSON.stringify({ error: 'Failed to update wallet' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create transaction record
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user_id,
        type: 'credit',
        amount: verifiedAmount,
        description: 'Wallet funding via Paystack',
        reference: reference,
        paystack_reference: reference,
        status: 'completed',
      });

    if (transactionError) {
      console.error('Transaction record error:', transactionError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment verified and wallet updated',
        amount: verifiedAmount 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
