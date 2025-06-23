
// Enhanced Paystack service with better testing and error handling
const PAYSTACK_PUBLIC_KEY = 'pk_test_d8c8f95c10d9b25cdbe0b2f8ba4b9a4c0b4c3c0e';

export interface PaystackPayloadData {
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
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

// Test Paystack API connectivity
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
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_PUBLIC_KEY.replace('pk_', 'sk_')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        amount: Math.round(payload.amount * 100), // Convert to kobo and ensure integer
        currency: payload.currency || 'NGN',
        reference: payload.reference || `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }),
    });

    const data = await response.json();
    console.log('Paystack API response:', {
      status: response.status,
      ok: response.ok,
      data: data
    });

    if (!response.ok) {
      return {
        status: false,
        message: data.message || `HTTP ${response.status}: ${response.statusText}`,
        error: data.message || 'Request failed',
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
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_PUBLIC_KEY.replace('pk_', 'sk_')}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Payment verification response:', {
      status: response.status,
      ok: response.ok,
      data: data
    });

    if (!response.ok) {
      throw new Error(data.message || `Verification failed: ${response.status}`);
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

// Test the API key on service initialization
testPaystackConnection().then(isConnected => {
  if (isConnected) {
    console.log('✅ Paystack API connection successful');
  } else {
    console.warn('⚠️ Paystack API connection failed - check your API key');
  }
});
