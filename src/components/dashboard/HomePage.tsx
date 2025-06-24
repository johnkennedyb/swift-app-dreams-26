
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Target,
  Heart,
  Users,
  TrendingUp
} from "lucide-react";
import { Profile } from "@/hooks/useProfile";
import { Wallet as WalletType } from "@/hooks/useWallet";
import { usePayment } from "@/hooks/usePayment";
import { useTransactions } from "@/hooks/useTransactions";

interface HomePageProps {
  user: Profile;
  wallet: WalletType;
  onNavigate: (tab: string) => void;
}

const HomePage = ({ user, wallet, onNavigate }: HomePageProps) => {
  const [fundAmount, setFundAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const { processPayment, loading: paymentLoading } = usePayment();
  const { transactions, loading: transactionsLoading } = useTransactions();

  const handleAddFunds = async () => {
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    const email = user.first_name ? `${user.first_name.toLowerCase()}@example.com` : "user@example.com";
    await processPayment(amount, email);
    setFundAmount("");
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0 || amount > wallet.balance) {
      return;
    }
    
    // TODO: Implement withdrawal to bank account logic
    console.log(`Withdrawing ₦${amount} to bank account`);
    setWithdrawAmount("");
  };

  // Get recent transactions (max 5)
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 pb-20 px-4 lg:px-0">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Welcome to Abacus!</h1>
          <p className="text-purple-100">Your financial support platform</p>
        </div>
      </div>

      {/* Wallet Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Add Funds Card */}
        <Card className="p-4 lg:p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="w-5 h-5 text-green-600" />
              Add Funds
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-sm">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  min="50"
                  className="h-12"
                />
              </div>
              <Button 
                onClick={handleAddFunds} 
                disabled={paymentLoading || !fundAmount}
                className="w-full bg-green-600 hover:bg-green-700 h-12"
              >
                {paymentLoading ? "Processing..." : "Add Funds"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Withdraw Funds Card */}
        <Card className="p-4 lg:p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Minus className="w-5 h-5 text-red-600" />
              Withdraw Funds
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4">
              <div>
                <Label htmlFor="withdraw-amount" className="text-sm">Amount (₦)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={wallet.balance}
                  className="h-12"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: ₦{wallet.balance.toLocaleString()}
                </p>
              </div>
              <Button 
                onClick={handleWithdraw} 
                disabled={!withdrawAmount || parseFloat(withdrawAmount) > wallet.balance}
                className="w-full bg-red-600 hover:bg-red-700 h-12"
              >
                Withdraw to Bank
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-4 lg:p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            className="h-20 flex-col touch-feedback"
            onClick={() => onNavigate("projects")}
          >
            <Target className="w-6 h-6 mb-2 text-purple-600" />
            <span className="text-sm">Create Project</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col touch-feedback"
            onClick={() => onNavigate("projects")}
          >
            <Heart className="w-6 h-6 mb-2 text-pink-600" />
            <span className="text-sm">Browse Projects</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col touch-feedback"
            onClick={() => onNavigate("support")}
          >
            <Users className="w-6 h-6 mb-2 text-blue-600" />
            <span className="text-sm">Support Hub</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col touch-feedback"
            onClick={() => onNavigate("profile")}
          >
            <TrendingUp className="w-6 h-6 mb-2 text-green-600" />
            <span className="text-sm">View Profile</span>
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-4 lg:p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        {transactionsLoading ? (
          <div className="text-center py-8 text-gray-500">Loading transactions...</div>
        ) : recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'credit' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    {transaction.type === 'credit' ? 
                      <ArrowDownRight className="w-5 h-5 text-green-600" /> : 
                      <ArrowUpRight className="w-5 h-5 text-purple-600" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transaction.description || 'Transaction'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold ${
                  transaction.type === 'credit' ? 'text-green-600' : 'text-purple-600'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-gray-400" />
            </div>
            <p>No transactions yet</p>
            <p className="text-sm">Start by adding funds to your wallet</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default HomePage;
