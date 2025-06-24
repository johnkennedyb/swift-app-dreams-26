
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  Users, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Heart,
  Plus,
  Wallet,
  Target
} from "lucide-react";
import { Profile } from "@/hooks/useProfile";
import { Wallet as WalletType } from "@/hooks/useWallet";
import { usePayment } from "@/hooks/usePayment";
import { useTransactions } from "@/hooks/useTransactions";

interface HomePageProps {
  user: Profile;
  wallet: WalletType;
}

const HomePage = ({ user, wallet }: HomePageProps) => {
  const [fundAmount, setFundAmount] = useState<string>("");
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

  // Get recent transactions (max 5)
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 pb-20">
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
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Add Funds
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  min="50"
                />
              </div>
              <Button 
                onClick={handleAddFunds} 
                disabled={paymentLoading || !fundAmount}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {paymentLoading ? "Processing..." : "Add Funds"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Balance Card */}
        <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-3xl font-bold">₦{wallet.balance.toLocaleString()}</p>
            <p className="text-blue-100 text-sm mt-1">Available for support</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col">
            <Target className="w-6 h-6 mb-2 text-purple-600" />
            <span className="text-sm">Create Project</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Heart className="w-6 h-6 mb-2 text-pink-600" />
            <span className="text-sm">Browse Projects</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Users className="w-6 h-6 mb-2 text-blue-600" />
            <span className="text-sm">Request Support</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <TrendingUp className="w-6 h-6 mb-2 text-green-600" />
            <span className="text-sm">View Analytics</span>
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        {transactionsLoading ? (
          <div className="text-center py-8 text-gray-500">Loading transactions...</div>
        ) : recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2">
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
            <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No transactions yet</p>
            <p className="text-sm">Start by adding funds to your wallet</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default HomePage;
