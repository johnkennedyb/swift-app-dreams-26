
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useWallet } from "@/hooks/useWallet";
import { useTransactions } from "@/hooks/useTransactions";
import { 
  User, 
  Wallet, 
  History, 
  Settings, 
  Edit3, 
  Save, 
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  CreditCard
} from "lucide-react";
import WalletWithdrawal from "./WalletWithdrawal";
import { Profile } from "@/hooks/useProfile";
import { Wallet as WalletType } from "@/hooks/useWallet";

interface ProfilePageProps {
  user: Profile;
  wallet: WalletType;
  onSignOut: () => void;
}

const ProfilePage = ({ user: userProp, wallet: walletProp, onSignOut }: ProfilePageProps) => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { wallet, loading: walletLoading } = useWallet();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const [isEditing, setIsEditing] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Use props or fallback to hooks
  const currentProfile = userProp || profile;
  const currentWallet = walletProp || wallet;

  useState(() => {
    if (currentProfile) {
      setFormData({
        first_name: currentProfile.first_name || "",
        last_name: currentProfile.last_name || "",
        phone: currentProfile.phone || "",
        address: currentProfile.address || "",
      });
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateProfile(formData);
    
    if (!error) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    if (currentProfile) {
      setFormData({
        first_name: currentProfile.first_name || "",
        last_name: currentProfile.last_name || "",
        phone: currentProfile.phone || "",
        address: currentProfile.address || "",
      });
    }
    setIsEditing(false);
  };

  if (showWithdrawal) {
    return <WalletWithdrawal onBack={() => setShowWithdrawal(false)} />;
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={currentProfile?.avatar_url || undefined} />
                <AvatarFallback className="text-xl">
                  {currentProfile?.first_name?.charAt(0)}{currentProfile?.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {currentProfile?.first_name} {currentProfile?.last_name}
                </h1>
                <p className="text-gray-600">{user?.email}</p>
                <Badge variant="outline" className="mt-1">
                  <User className="w-3 h-3 mr-1" />
                  Member since {new Date(user?.created_at || '').toLocaleDateString()}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                disabled={!isEditing}
                placeholder="Enter address"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Wallet
            </CardTitle>
            <Button 
              onClick={() => setShowWithdrawal(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {walletLoading ? (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-3xl font-bold text-green-600">
                ₦{currentWallet?.balance.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Currency: {currentWallet?.currency || 'NGN'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'credit' ? 
                        <ArrowDownLeft className="w-5 h-5 text-green-600" /> : 
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Account Email</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <Badge variant="outline">Verified</Badge>
            </div>
            <div className="pt-4 border-t">
              <Button variant="destructive" onClick={onSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
