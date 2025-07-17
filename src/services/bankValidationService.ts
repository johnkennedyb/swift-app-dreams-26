
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
    const { data, error } = await supabase.functions.invoke('get-bank-list');
    
    if (error) {
      return {
        status: false,
        message: error.message || 'Failed to fetch bank list',
        data: []
      };
    }
    
    return data || {
      status: false,
      message: 'No data received from bank list API',
      data: []
    };
  } catch (error: any) {
    return {
      status: false,
      message: error.message || 'Network error occurred',
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
    const { data, error } = await supabase.functions.invoke('verify-bank-account', {
      body: {
        account_number: accountNumber,
        bank_code: bankCode
      }
    });
    
    if (error) {
      return {
        status: false,
        message: error.message || 'Failed to verify account',
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
