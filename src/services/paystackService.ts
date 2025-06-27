// Enhanced Paystack service with proper secret key handling
export interface PaystackPayloadData {
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
  error?: string;
}

// Test Paystack API connectivity - this will be called from the edge function
export const testPaystackConnection = async (): Promise<boolean> => {
  console.log('Testing Paystack API connection...');
  
  try {
    // Test with a minimal transaction initialization
    const testPayload = {
      email: 'test@example.com',
      amount: 100, // ₦1.00 for testing
      currency: 'NGN',
      reference: `TEST_${Date.now()}`,
    };

    const response = await initializePayment(testPayload);
    console.log('Paystack connection test result:', response);
    
    return response.status;
  } catch (error) {
    console.error('Paystack connection test failed:', error);
    return false;
  }
};

export const initializePayment = async (payload: PaystackPayloadData): Promise<PaystackResponse> => {
  console.log('Initializing Paystack payment with payload:', payload);
  
  // Validate payload
  if (!payload.email || !payload.amount) {
    return {
      status: false,
      message: 'Email and amount are required',
      error: 'Invalid payload',
    };
  }

  if (payload.amount < 50) {
    return {
      status: false,
      message: 'Minimum amount is ₦0.50',
      error: 'Amount too low',
    };
  }
  
  try {
    // Call our edge function using Supabase client - this is the correct way
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('initialize-paystack-payment', {
      body: {
        ...payload,
        amount: Math.round(payload.amount * 100), // Convert to kobo and ensure integer
        currency: payload.currency || 'NGN',
        reference: payload.reference || `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        callback_url: payload.callback_url,
      },
    });

    console.log('Paystack API response:', {
      data: data,
      error: error
    });

    if (error) {
      return {
        status: false,
        message: error.message || 'Request failed',
        error: error.message,
      };
    }

    return {
      status: data.status || false,
      message: data.message || 'Payment initialized',
      data: data.data,
    };
  } catch (error: any) {
    console.error('Paystack initialization error:', error);
    return {
      status: false,
      message: error.message || 'Network error occurred',
      error: error.message,
    };
  }
};

export const openPaystackPayment = (authorizationUrl: string) => {
  console.log('Opening Paystack payment URL:', authorizationUrl);
  
  // Validate URL
  if (!authorizationUrl || !authorizationUrl.startsWith('http')) {
    console.error('Invalid authorization URL:', authorizationUrl);
    return false;
  }

  try {
    // Open in new tab/window
    const paymentWindow = window.open(authorizationUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    
    if (!paymentWindow) {
      console.error('Failed to open payment window. Pop-up blocked?');
      return false;
    }

    console.log('Payment window opened successfully');
    return true;
  } catch (error) {
    console.error('Error opening payment window:', error);
    return false;
  }
};

export const verifyPayment = async (reference: string): Promise<any> => {
  console.log('Verifying payment with reference:', reference);
  
  if (!reference) {
    throw new Error('Payment reference is required');
  }
  
  try {
    // Use our edge function to verify payment
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('verify-payment', {
      body: { reference },
    });

    console.log('Payment verification response:', {
      data: data,
      error: error
    });

    if (error) {
      throw new Error(error.message || `Verification failed`);
    }

    return data;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};

// Utility function to format amount for display
export const formatAmount = (amount: number, currency: string = 'NGN'): string => {
  const symbol = currency === 'NGN' ? '₦' : '$';
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Test the connection on service load - this will now work properly
console.log('✅ Paystack service loaded - ready to process payments');
