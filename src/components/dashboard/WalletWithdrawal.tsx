
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWalletWithdrawal } from "@/hooks/useWalletWithdrawal";
import { useWallet } from "@/hooks/useWallet";
import { Loader2, Banknote } from "lucide-react";

const NIGERIAN_BANKS = [
  "Access Bank", "Fidelity Bank", "First Bank of Nigeria", "First City Monument Bank",
  "Guaranty Trust Bank", "Heritage Bank", "Keystone Bank", "Polaris Bank",
  "Stanbic IBTC Bank", "Standard Chartered Bank", "Sterling Bank", "Union Bank",
  "United Bank for Africa", "Unity Bank", "Wema Bank", "Zenith Bank"
];

const WalletWithdrawal = () => {
  const { wallet } = useWallet();
  const { withdrawToBank, loading } = useWalletWithdrawal();
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState({
    amount: "",
    accountNumber: "",
    bankName: "",
    accountName: ""
  });

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawalData.amount);
    
    if (!amount || amount <= 0) {
      return;
    }

    if (!withdrawalData.accountNumber || !withdrawalData.bankName || !withdrawalData.accountName) {
      return;
    }

    const success = await withdrawToBank(amount, {
      accountNumber: withdrawalData.accountNumber,
      bankName: withdrawalData.bankName,
      accountName: withdrawalData.accountName
    });

    if (success) {
      setWithdrawalData({
        amount: "",
        accountNumber: "",
        bankName: "",
        accountName: ""
      });
      setShowWithdrawalDialog(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="w-5 h-5" />
          Wallet Withdrawal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Available Balance</p>
            <p className="text-2xl font-bold text-purple-600">
              ₦{wallet?.balance.toLocaleString() || '0.00'}
            </p>
          </div>
          
          <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
            <DialogTrigger asChild>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={!wallet || wallet.balance < 100}
              >
                Withdraw to Bank
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Withdraw to Bank Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (NGN)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={withdrawalData.amount}
                    onChange={(e) => setWithdrawalData(prev => ({ 
                      ...prev, 
                      amount: e.target.value 
                    }))}
                    placeholder="Minimum ₦100"
                    min="100"
                    max={wallet?.balance || 0}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bankName">Bank</Label>
                  <Select
                    value={withdrawalData.bankName}
                    onValueChange={(value) => setWithdrawalData(prev => ({ 
                      ...prev, 
                      bankName: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_BANKS.map(bank => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={withdrawalData.accountNumber}
                    onChange={(e) => setWithdrawalData(prev => ({ 
                      ...prev, 
                      accountNumber: e.target.value 
                    }))}
                    placeholder="Enter 10-digit account number"
                    maxLength={10}
                  />
                </div>
                
                <div>
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={withdrawalData.accountName}
                    onChange={(e) => setWithdrawalData(prev => ({ 
                      ...prev, 
                      accountName: e.target.value 
                    }))}
                    placeholder="Enter account name"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowWithdrawalDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={handleWithdrawal}
                    disabled={loading || !withdrawalData.amount || !withdrawalData.accountNumber || !withdrawalData.bankName || !withdrawalData.accountName}
                  >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Withdraw
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <p className="text-xs text-gray-500">
            Minimum withdrawal: ₦100. Funds are processed within 24 hours.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletWithdrawal;
