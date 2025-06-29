
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { reference, user_id, amount }: VerifyPaymentRequest = await req.json();

    console.log('Verifying payment:', { reference, user_id, amount });

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
    });

    const paymentData = await paystackResponse.json();
    console.log('Paystack verification response:', paymentData);

    if (!paymentData.status || paymentData.data.status !== 'success') {
      return new Response(
        JSON.stringify({ error: 'Payment verification failed', details: paymentData }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const verifiedAmount = paymentData.data.amount / 100; // Convert from kobo to naira

    // Get current wallet balance
    const { data: currentWallet, error: walletFetchError } = await supabaseClient
      .from('wallets')
      .select('balance, id')
      .eq('user_id', user_id)
      .eq('currency', 'NGN')
      .single();

    if (walletFetchError) {
      console.error('Wallet fetch error:', walletFetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch wallet', details: walletFetchError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const newBalance = Number(currentWallet.balance) + verifiedAmount;
    console.log('Updating wallet balance from', currentWallet.balance, 'to', newBalance);

    // Update user wallet
    const { error: walletError } = await supabaseClient
      .from('wallets')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentWallet.id);

    if (walletError) {
      console.error('Wallet update error:', walletError);
      return new Response(
        JSON.stringify({ error: 'Failed to update wallet', details: walletError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Wallet updated successfully');

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
    } else {
      console.log('Transaction record created successfully');
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
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
