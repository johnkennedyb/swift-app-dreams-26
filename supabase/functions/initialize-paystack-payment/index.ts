
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InitializePaymentRequest {
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, amount, currency, reference, callback_url, metadata }: InitializePaymentRequest = await req.json();

    console.log('Initializing Paystack payment:', { email, amount, currency, reference, callback_url });

    // Get Paystack secret key from environment
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    
    if (!paystackSecretKey) {
      return new Response(
        JSON.stringify({ 
          status: false,
          message: 'Paystack secret key not configured',
          error: 'Missing API key' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize payment with Paystack
    const paymentPayload: any = {
      email,
      amount,
      currency: currency || 'NGN',
      reference,
      metadata,
    };

    // Add callback URL if provided
    if (callback_url) {
      paymentPayload.callback_url = callback_url;
    }

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload),
    });

    const paymentData = await paystackResponse.json();
    console.log('Paystack response:', paymentData);

    if (!paystackResponse.ok || !paymentData.status) {
      return new Response(
        JSON.stringify({
          status: false,
          message: paymentData.message || 'Payment initialization failed',
          error: paymentData.message || 'Paystack error',
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: true,
        message: 'Payment initialized successfully',
        data: paymentData.data,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Payment initialization error:', error);
    return new Response(
      JSON.stringify({ 
        status: false,
        message: 'Internal server error',
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
