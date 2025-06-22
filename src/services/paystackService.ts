
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

export const initializePayment = async (payload: PaystackPayloadData): Promise<PaystackResponse> => {
  console.log('Initializing Paystack payment with payload:', payload);
  
  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_PUBLIC_KEY.replace('pk_', 'sk_')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        amount: payload.amount * 100, // Convert to kobo
      }),
    });

    const data = await response.json();
    console.log('Paystack API response:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Payment initialization failed');
    }

    return {
      status: data.status,
      message: data.message,
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
  
  // Test if the URL is valid before opening
  if (!authorizationUrl || !authorizationUrl.startsWith('http')) {
    console.error('Invalid authorization URL:', authorizationUrl);
    return;
  }

  // Open in new tab
  window.open(authorizationUrl, '_blank');
};

export const verifyPayment = async (reference: string): Promise<any> => {
  console.log('Verifying payment with reference:', reference);
  
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_PUBLIC_KEY.replace('pk_', 'sk_')}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Payment verification response:', data);

    return data;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};
