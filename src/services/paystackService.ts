
const PAYSTACK_PUBLIC_KEY = "pk_test_e67dd0d84865c2587565a359daecf0a2514e2ab6";

export interface PaystackPaymentData {
  email: string;
  amount: number; // in kobo (smallest currency unit)
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
}

export const initializePayment = async (paymentData: PaystackPaymentData): Promise<PaystackResponse> => {
  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...paymentData,
        amount: Math.round(paymentData.amount * 100), // Convert to kobo
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Paystack initialization error:', error);
    return {
      status: false,
      message: 'Failed to initialize payment',
    };
  }
};

export const openPaystackPayment = (authorizationUrl: string) => {
  window.open(authorizationUrl, '_blank', 'width=500,height=600');
};
