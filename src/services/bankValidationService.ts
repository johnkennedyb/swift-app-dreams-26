
import { supabase } from '@/integrations/supabase/client';

export interface BankAccount {
  account_number: string;
  bank_code: string;
  bank_name: string;
  account_name: string;
}

export interface BankListResponse {
  status: boolean;
  message: string;
  data: Array<{
    name: string;
    slug: string;
    code: string;
    longcode: string;
    gateway: string;
    pay_with_bank: boolean;
    active: boolean;
    country: string;
    currency: string;
    type: string;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface AccountVerificationResponse {
  status: boolean;
  message: string;
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
}

// Get list of Nigerian banks from Paystack
export const getBankList = async (): Promise<BankListResponse> => {
  try {
    console.log('Fetching bank list from Supabase function...');
    
    const { data, error } = await supabase.functions.invoke('get-bank-list');
    
    console.log('Bank list response from Supabase:', { data, error });
    
    if (error) {
      console.error('Error from Supabase function:', error);
      return {
        status: false,
        message: error.message || 'Failed to fetch bank list. Please ensure PAYSTACK_SECRET_KEY is set in Supabase secrets.',
        data: []
      };
    }
    
    if (!data) {
      return {
        status: false,
        message: 'No data received from bank list API',
        data: []
      };
    }
    
    console.log('Successfully fetched bank list:', data);
    return data;
  } catch (error: any) {
    console.error('Error fetching bank list:', error);
    return {
      status: false,
      message: error.message || 'Network error occurred. Please check your connection and try again.',
      data: []
    };
  }
};

// Verify bank account details using Paystack
export const verifyBankAccount = async (
  accountNumber: string, 
  bankCode: string
): Promise<AccountVerificationResponse> => {
  try {
    console.log('Verifying bank account:', { accountNumber, bankCode });
    
    const { data, error } = await supabase.functions.invoke('verify-bank-account', {
      body: {
        account_number: accountNumber,
        bank_code: bankCode
      }
    });
    
    console.log('Bank account verification response:', { data, error });
    
    if (error) {
      return {
        status: false,
        message: error.message || 'Failed to verify account. Please ensure PAYSTACK_SECRET_KEY is set in Supabase secrets.',
        data: {
          account_number: '',
          account_name: '',
          bank_id: 0
        }
      };
    }
    
    return data || {
      status: false,
      message: 'No response from verification API',
      data: {
        account_number: '',
        account_name: '',
        bank_id: 0
      }
    };
  } catch (error: any) {
    console.error('Error verifying bank account:', error);
    return {
      status: false,
      message: error.message || 'Network error occurred during verification',
      data: {
        account_number: '',
        account_name: '',
        bank_id: 0
      }
    };
  }
};

// Create transfer recipient
export const createTransferRecipient = async (
  accountNumber: string,
  bankCode: string,
  accountName: string
): Promise<any> => {
  try {
    console.log('Creating transfer recipient:', { accountNumber, bankCode, accountName });
    
    const { data, error } = await supabase.functions.invoke('create-transfer-recipient', {
      body: {
        type: 'nuban',
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN'
      }
    });
    
    if (error) {
      throw new Error(error.message || 'Failed to create recipient. Please ensure PAYSTACK_SECRET_KEY is set in Supabase secrets.');
    }
    
    console.log('Transfer recipient created:', data);
    return data;
  } catch (error: any) {
    console.error('Error creating transfer recipient:', error);
    throw error;
  }
};

// Initiate transfer to user's bank account
export const initiateTransfer = async (
  amount: number,
  recipientCode: string,
  reason: string = 'Wallet withdrawal'
): Promise<any> => {
  try {
    console.log('Initiating transfer:', { amount, recipientCode, reason });
    
    const { data, error } = await supabase.functions.invoke('initiate-transfer', {
      body: {
        amount: Math.round(amount * 100), // Convert to kobo
        recipient: recipientCode,
        reason
      }
    });
    
    if (error) {
      throw new Error(error.message || 'Failed to initiate transfer. Please ensure PAYSTACK_SECRET_KEY is set in Supabase secrets.');
    }
    
    console.log('Transfer initiated successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Error initiating transfer:', error);
    throw error;
  }
};
