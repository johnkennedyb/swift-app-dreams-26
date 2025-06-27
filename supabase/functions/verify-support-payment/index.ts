
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifySupportPaymentRequest {
  reference: string;
  support_request_id: string;
  donor_name: string;
  donor_email: string;
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

    const { reference, support_request_id, donor_name, donor_email }: VerifySupportPaymentRequest = await req.json();

    console.log('Verifying support payment:', { reference, support_request_id, donor_name, donor_email });

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

    // Check if payment already exists
    const { data: existingPayment } = await supabaseClient
      .from('support_payments')
      .select('id')
      .eq('paystack_reference', reference)
      .single();

    if (existingPayment) {
      return new Response(
        JSON.stringify({ error: 'Payment already processed' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create support payment record
    const { data: paymentRecord, error: paymentError } = await supabaseClient
      .from('support_payments')
      .insert({
        support_request_id,
        donor_name,
        donor_email,
        amount: verifiedAmount,
        paystack_reference: reference,
        payment_status: 'completed',
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Support payment record error:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment record', details: paymentError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get support request details to update requester's wallet
    const { data: supportRequest, error: supportError } = await supabaseClient
      .from('support_requests')
      .select('requester_id')
      .eq('id', support_request_id)
      .single();

    if (supportError || !supportRequest) {
      console.error('Support request not found:', supportError);
      return new Response(
        JSON.stringify({ error: 'Support request not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update requester's wallet
    const { error: walletError } = await supabaseClient
      .from('wallets')
      .update({
        balance: supabaseClient.sql`balance + ${verifiedAmount}`,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', supportRequest.requester_id)
      .eq('currency', 'NGN');

    if (walletError) {
      console.error('Wallet update error:', walletError);
      // Don't fail the whole operation, just log the error
    }

    // Create transaction record for the requester
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: supportRequest.requester_id,
        type: 'credit',
        amount: verifiedAmount,
        description: `Support received: ${donor_name}`,
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
        message: 'Support payment verified and processed',
        amount: verifiedAmount,
        payment_id: paymentRecord.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Support payment verification error:', error);
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
