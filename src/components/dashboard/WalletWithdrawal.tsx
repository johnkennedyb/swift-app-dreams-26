
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWalletWithdrawal } from "@/hooks/useWalletWithdrawal";
import { useWallet } from "@/hooks/useWallet";
import { Loader2, ArrowLeft } from "lucide-react";

interface WalletWithdrawalProps {
  onBack: () => void;
}

const WalletWithdrawal = ({ onBack }: WalletWithdrawalProps) => {
  const { withdrawToBank, loading } = useWalletWithdrawal();
  const { wallet } = useWallet();
  const [amount, setAmount] = useState("");
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    bankName: "",
    accountName: "",
  });

  const handleWithdraw = async () => {
    if (!amount || !bankDetails.accountNumber || !bankDetails.bankName || !bankDetails.accountName) {
      return;
    }

    const success = await withdrawToBank(parseFloat(amount), bankDetails);
    if (success) {
      setAmount("");
      setBankDetails({
        accountNumber: "",
        bankName: "",
        accountName: "",
      });
      onBack();
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle>Withdraw to Bank</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <Select value={bankDetails.bankName} onValueChange={(value) => 
            setBankDetails(prev => ({ ...prev, bankName: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Select your bank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Access Bank">Access Bank</SelectItem>
              <SelectItem value="GTBank">GTBank</SelectItem>
              <SelectItem value="First Bank">First Bank</SelectItem>
              <SelectItem value="UBA">UBA</SelectItem>
              <SelectItem value="Zenith Bank">Zenith Bank</SelectItem>
              <SelectItem value="Fidelity Bank">Fidelity Bank</SelectItem>
              <SelectItem value="Union Bank">Union Bank</SelectItem>
              <SelectItem value="Sterling Bank">Sterling Bank</SelectItem>
              <SelectItem value="Stanbic IBTC">Stanbic IBTC</SelectItem>
              <SelectItem value="Ecobank">Ecobank</SelectItem>
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
          />
        </div>

        <div>
          <Label htmlFor="accountName">Account Name</Label>
          <Input
            id="accountName"
            value={bankDetails.accountName}
            onChange={(e) => setBankDetails(prev => ({ ...prev, accountName: e.target.value }))}
            placeholder="Enter account name"
          />
        </div>

        <Button 
          onClick={handleWithdraw}
          disabled={loading || !amount || !bankDetails.accountNumber || !bankDetails.bankName || !bankDetails.accountName}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Withdraw ₦{amount || '0'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WalletWithdrawal;
