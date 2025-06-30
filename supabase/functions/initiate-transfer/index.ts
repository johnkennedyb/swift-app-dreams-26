
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, recipient, reason } = await req.json()
    
    if (!amount || !recipient) {
      throw new Error('Amount and recipient are required')
    }

    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')
    
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack secret key not configured')
    }

    // Generate unique reference
    const reference = `TXF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const response = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount,
        recipient,
        reason: reason || 'Wallet withdrawal',
        reference
      }),
    })

    const result = await response.json()

    // If transfer is successful, update wallet balance
    if (result.status) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const authHeader = req.headers.get('Authorization')!
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabaseClient.auth.getUser(token)

      if (user) {
        // Update wallet balance
        const { error: walletError } = await supabaseClient
          .from('wallets')
          .update({ 
            balance: supabaseClient.raw(`balance - ${amount / 100}`), // Convert from kobo
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (walletError) {
          console.error('Error updating wallet balance:', walletError)
        }

        // Create transaction record
        const { error: transactionError } = await supabaseClient
          .from('transactions')
          .insert([
            {
              user_id: user.id,
              type: 'debit',
              amount: amount / 100, // Convert from kobo
              description: reason || 'Wallet withdrawal',
              status: 'completed',
              reference: reference,
            }
          ])

        if (transactionError) {
          console.error('Error creating transaction record:', transactionError)
        }
      }
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.ok ? 200 : 400,
      },
    )
  } catch (error) {
    console.error('Error initiating transfer:', error)
    return new Response(
      JSON.stringify({
        status: false,
        message: error.message || 'Failed to initiate transfer',
        data: null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
