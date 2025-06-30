
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { 
  getBankList, 
  verifyBankAccount, 
  createTransferRecipient, 
  initiateTransfer,
  BankAccount 
} from "@/services/bankValidationService";

interface WalletWithdrawalProps {
  onBack: () => void;
}

const WalletWithdrawal = ({ onBack }: WalletWithdrawalProps) => {
  const { wallet, refetch: refetchWallet } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [banks, setBanks] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [amount, setAmount] = useState("");
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    bankCode: "",
    bankName: "",
    accountName: "",
  });
  const [verifiedAccount, setVerifiedAccount] = useState<BankAccount | null>(null);
  const [step, setStep] = useState<'details' | 'confirm'>('details');

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      const response = await getBankList();
      if (response.status) {
        setBanks(response.data.filter(bank => bank.active && bank.country === 'Nigeria'));
      } else {
        toast({
          title: "Error",
          description: "Failed to load bank list",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading banks:', error);
      toast({
        title: "Error",
        description: "Failed to load bank list",
        variant: "destructive",
      });
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleBankSelect = (bankCode: string) => {
    const selectedBank = banks.find(bank => bank.code === bankCode);
    setBankDetails(prev => ({
      ...prev,
      bankCode,
      bankName: selectedBank?.name || "",
    }));
    setVerifiedAccount(null);
  };

  const verifyAccount = async () => {
    if (!bankDetails.accountNumber || !bankDetails.bankCode) {
      toast({
        title: "Error",
        description: "Please enter account number and select bank",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    try {
      const response = await verifyBankAccount(bankDetails.accountNumber, bankDetails.bankCode);
      
      if (response.status) {
        const accountName = response.data.account_name;
        setBankDetails(prev => ({ ...prev, accountName }));
        setVerifiedAccount({
          account_number: bankDetails.accountNumber,
          bank_code: bankDetails.bankCode,
          bank_name: bankDetails.bankName,
          account_name: accountName,
        });
        
        toast({
          title: "Success",
          description: `Account verified: ${accountName}`,
        });
      } else {
        toast({
          title: "Verification Failed",
          description: response.message || "Could not verify account details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying account:', error);
      toast({
        title: "Error",
        description: "Failed to verify account",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleWithdraw = async () => {
    if (!verifiedAccount || !amount || !wallet) {
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    
    if (wallet.balance < withdrawalAmount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds in your wallet",
        variant: "destructive",
      });
      return;
    }

    if (withdrawalAmount < 100) {
      toast({
        title: "Minimum Withdrawal",
        description: "Minimum withdrawal amount is ₦100",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create transfer recipient
      const recipientResponse = await createTransferRecipient(
        verifiedAccount.account_number,
        verifiedAccount.bank_code,
        verifiedAccount.account_name
      );

      if (!recipientResponse.status) {
        throw new Error(recipientResponse.message || 'Failed to create recipient');
      }

      // Initiate transfer
      const transferResponse = await initiateTransfer(
        withdrawalAmount,
        recipientResponse.data.recipient_code,
        `Wallet withdrawal to ${verifiedAccount.bank_name}`
      );

      if (!transferResponse.status) {
        throw new Error(transferResponse.message || 'Failed to initiate transfer');
      }

      // Refresh wallet data
      refetchWallet();
      
      toast({
        title: "Success",
        description: `Successfully withdrew ₦${withdrawalAmount.toLocaleString()} to your bank account`,
      });
      
      // Reset form and go back
      setAmount("");
      setBankDetails({
        accountNumber: "",
        bankCode: "",
        bankName: "",
        accountName: "",
      });
      setVerifiedAccount(null);
      setStep('details');
      onBack();
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = verifiedAccount && amount && parseFloat(amount) >= 100;

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle>Withdraw to Bank</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'details' && (
            <>
              <div>
                <Label>Current Balance</Label>
                <p className="text-2xl font-bold text-green-600">
                  ₦{wallet?.balance.toLocaleString() || '0'}
                </p>
              </div>

              <div>
                <Label htmlFor="amount">Amount to Withdraw</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="100"
                />
                <p className="text-sm text-gray-500 mt-1">Minimum withdrawal: ₦100</p>
              </div>

              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Select value={bankDetails.bankCode} onValueChange={handleBankSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingBanks ? "Loading banks..." : "Select your bank"} />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="Enter account number"
                  maxLength={10}
                />
              </div>

              {bankDetails.accountNumber && bankDetails.bankCode && !verifiedAccount && (
                <Button 
                  onClick={verifyAccount}
                  disabled={verifying}
                  className="w-full"
                  variant="outline"
                >
                  {verifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Verify Account
                </Button>
              )}

              {verifiedAccount && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Account Verified</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    {verifiedAccount.account_name}
                  </p>
                  <p className="text-sm text-green-600">
                    {verifiedAccount.bank_name} - {verifiedAccount.account_number}
                  </p>
                </div>
              )}

              <Button 
                onClick={() => setStep('confirm')}
                disabled={!canProceed}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Continue to Confirmation
              </Button>
            </>
          )}

          {step === 'confirm' && verifiedAccount && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Confirm Withdrawal</h3>
                
                <div className="p-4 bg-gray-50 border rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-bold">₦{parseFloat(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bank:</span>
                    <span>{verifiedAccount.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account:</span>
                    <span>{verifiedAccount.account_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span>{verifiedAccount.account_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    This action cannot be undone. Please verify all details before proceeding.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setStep('details')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Confirm Withdrawal
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletWithdrawal;
