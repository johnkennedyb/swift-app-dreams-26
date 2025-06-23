import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Home, 
  User, 
  Settings, 
  ArrowLeft,
  CheckCircle,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Heart,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import SupportPage from "./SupportPage";
import ProjectsPage from "./ProjectsPage";
import ProfilePage from "./ProfilePage";
import { Profile } from "@/hooks/useProfile";
import { Wallet } from "@/hooks/useWallet";
import { usePayment } from "@/hooks/usePayment";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";

interface DashboardProps {
  user: Profile;
  wallet: Wallet;
  onSignOut: () => void;
}

const Dashboard = ({ user, wallet, onSignOut }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("home");
  const [currentView, setCurrentView] = useState("main");
  const [sendAmount, setSendAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  
  const { user: authUser } = useAuth();
  const { processPayment, loading: paymentLoading } = usePayment();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { toast } = useToast();

  const userBalance = wallet.balance;
  const currency = wallet.currency;
  const currencySymbol = currency === "NGN" ? "₦" : "$";

  const quickActions = [
    { id: 1, title: "Send Money", icon: ArrowUpRight, action: () => setCurrentView("send-money") },
    { id: 2, title: "Request Support", icon: ArrowDownLeft, action: () => setActiveTab("support") },
    { id: 3, title: "Add Funds", icon: Plus, action: () => setCurrentView("add-funds") },
  ];

  const renderHomeTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounting Made Easy</h1>
          <p className="text-gray-600">Manage your finances effortlessly</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Card key={action.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={action.action}>
              <CardContent className="p-4 text-center">
                <action.icon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium">{action.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Button variant="ghost" size="sm" className="text-purple-600">
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {transactionsLoading ? (
            <Card className="p-4">
              <p className="text-gray-500 text-center">Loading transactions...</p>
            </Card>
          ) : transactions.length === 0 ? (
            <Card className="p-4">
              <p className="text-gray-500 text-center">No transactions yet</p>
            </Card>
          ) : (
            transactions.slice(0, 4).map((transaction) => (
              <Card key={transaction.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'debit' || transaction.type === 'transfer' ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {transaction.type === 'debit' || transaction.type === 'transfer' ? 
                        <ArrowUpRight className="w-5 h-5 text-red-600" /> : 
                        <ArrowDownLeft className="w-5 h-5 text-green-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.description || 
                         (transaction.type === 'credit' ? 'Wallet funding' : 
                          transaction.recipient_profile ? 
                            `${transaction.recipient_profile.first_name} ${transaction.recipient_profile.last_name}` : 
                            'Transfer')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'debit' || transaction.type === 'transfer' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'debit' || transaction.type === 'transfer' ? '-' : '+'}{currencySymbol}{transaction.amount.toFixed(2)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderSendMoneyFlow = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setCurrentView("main")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">Send Money</h1>
        <div></div>
      </div>

      <Card className="p-6">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-2">Available Balance</p>
          <p className="text-2xl font-bold">{currencySymbol}{userBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Recipient ID or Email</label>
            <Input
              placeholder="Enter recipient details"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {currencySymbol}
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="pl-8 text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Purpose</label>
            <Input placeholder="What's this for?" />
          </div>
        </div>
      </Card>

      <Button 
        className="w-full bg-purple-600 hover:bg-purple-700 p-4 text-lg"
        onClick={() => setCurrentView("confirmation")}
      >
        Send {currencySymbol}{sendAmount || "0.00"}
      </Button>
    </div>
  );

  const renderConfirmation = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-8 py-20">
      <CheckCircle className="w-24 h-24 text-green-500" />
      <h1 className="text-3xl font-bold text-gray-800">Transaction Successful</h1>
      <p className="text-gray-600 text-center">Your money has been sent successfully</p>
      <Button 
        className="bg-purple-600 hover:bg-purple-700 px-8"
        onClick={() => {
          setCurrentView("main");
          setActiveTab("home");
        }}
      >
        Back to Home
      </Button>
    </div>
  );

  const renderAddFundsFlow = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setCurrentView("main")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">Add Funds</h1>
        <div></div>
      </div>

      <Card className="p-6">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-2">Current Balance</p>
          <p className="text-2xl font-bold">{currencySymbol}{userBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount to Add</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {currencySymbol}
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="pl-8 text-lg"
                min="100"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum amount: ₦100</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1000, 5000, 10000].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setFundAmount(amount.toString())}
                className="text-sm"
              >
                ₦{amount.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <Button 
        className="w-full bg-purple-600 hover:bg-purple-700 p-4 text-lg"
        onClick={async () => {
          const amount = parseFloat(fundAmount);
          if (!amount || amount < 100) {
            toast({
              title: "Invalid Amount",
              description: "Please enter an amount of at least ₦100",
              variant: "destructive",
            });
            return;
          }

          if (!authUser?.email) {
            toast({
              title: "Error",
              description: "Unable to get user email for payment",
              variant: "destructive",
            });
            return;
          }

          const result = await processPayment(amount, authUser.email);
          if (result) {
            toast({
              title: "Payment Initialized",
              description: "Complete your payment in the popup window",
            });
          }
        }}
        disabled={paymentLoading || !fundAmount || parseFloat(fundAmount) < 100}
      >
        {paymentLoading ? "Processing..." : `Add ${currencySymbol}${fundAmount || "0.00"}`}
      </Button>
    </div>
  );

  const renderMainContent = () => {
    switch (activeTab) {
      case "home":
        return renderHomeTab();
      case "support":
        return <SupportPage />;
      case "projects":
        return <ProjectsPage />;
      case "profile":
        return <ProfilePage user={user} wallet={wallet} onSignOut={onSignOut} />;
      default:
        return renderHomeTab();
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case "send-money":
        return renderSendMoneyFlow();
      case "add-funds":
        return renderAddFundsFlow();
      case "confirmation":
        return renderConfirmation();
      default:
        return renderMainContent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-gray-900 text-lg font-bold">AppBacus</span>
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActiveTab("profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("projects")}>
                Projects
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSignOut}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-28 px-4 pt-6">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      {currentView === "main" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 pb-8">
          <div className="flex justify-around">
            {[
              { id: "home", icon: Home, label: "Home" },
              { id: "support", icon: Heart, label: "Support" },
              { id: "projects", icon: Settings, label: "Projects" },
              { id: "profile", icon: User, label: "Profile" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-purple-50 text-purple-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <tab.icon className={`w-5 h-5 mb-1 ${
                  activeTab === tab.id ? "text-purple-600" : ""
                }`} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
