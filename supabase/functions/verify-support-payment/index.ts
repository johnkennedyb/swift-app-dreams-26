
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

    // Get support request details
    const { data: supportRequest, error: supportError } = await supabaseClient
      .from('support_requests')
      .select('requester_id, project_id, title')
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

    console.log('Support request found:', supportRequest);

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

    console.log('Payment record created:', paymentRecord);

    // Update requester's wallet balance
    const { data: currentWallet, error: walletFetchError } = await supabaseClient
      .from('wallets')
      .select('balance, id')
      .eq('user_id', supportRequest.requester_id)
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

    // Update project funding
    const { data: currentProject, error: projectFetchError } = await supabaseClient
      .from('projects')
      .select('current_funding, id')
      .eq('id', supportRequest.project_id)
      .single();

    if (projectFetchError) {
      console.error('Project fetch error:', projectFetchError);
    } else {
      const newProjectFunding = Number(currentProject.current_funding) + verifiedAmount;
      console.log('Updating project funding from', currentProject.current_funding, 'to', newProjectFunding);

      const { error: projectError } = await supabaseClient
        .from('projects')
        .update({ 
          current_funding: newProjectFunding,
          updated_at: new Date().toISOString(),
        })
        .eq('id', supportRequest.project_id);

      if (projectError) {
        console.error('Project update error:', projectError);
      } else {
        console.log('Project funding updated successfully');
      }
    }

    // Create transaction record for the requester
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: supportRequest.requester_id,
        type: 'credit',
        amount: verifiedAmount,
        description: `Support received from ${donor_name}: ${supportRequest.title}`,
        reference: reference,
        paystack_reference: reference,
        status: 'completed',
        project_id: supportRequest.project_id,
      });

    if (transactionError) {
      console.error('Transaction record error:', transactionError);
    } else {
      console.log('Transaction record created successfully');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Support payment verified and processed successfully',
        amount: verifiedAmount,
        payment_id: paymentRecord.id,
        wallet_updated: true,
        project_updated: true
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
