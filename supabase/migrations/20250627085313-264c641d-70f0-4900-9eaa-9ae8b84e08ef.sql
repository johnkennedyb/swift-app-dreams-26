
-- Create a table to track payments made through shareable support links
CREATE TABLE public.support_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  support_request_id UUID NOT NULL REFERENCES public.support_requests(id) ON DELETE CASCADE,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  paystack_reference TEXT NOT NULL UNIQUE,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.support_payments ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to view support payments (for transparency)
CREATE POLICY "Anyone can view support payments" 
  ON public.support_payments 
  FOR SELECT 
  USING (true);

-- Create policy that allows anyone to insert support payments (for public donations)
CREATE POLICY "Anyone can create support payments" 
  ON public.support_payments 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that allows system to update payment status
CREATE POLICY "System can update payment status" 
  ON public.support_payments 
  FOR UPDATE 
  USING (true);

-- Add index for better performance
CREATE INDEX idx_support_payments_support_request_id ON public.support_payments(support_request_id);
CREATE INDEX idx_support_payments_paystack_reference ON public.support_payments(paystack_reference);
