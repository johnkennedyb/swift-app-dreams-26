
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  CreditCard,
  Bell,
  Globe,
  LogOut,
  Edit3,
  Camera,
  Settings,
  Lock,
  Smartphone,
  Loader2,
  Eye,
  EyeOff,
  TrendingUp
} from "lucide-react";

import { Profile } from "@/hooks/useProfile";
import { Wallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { useTransactions } from "@/hooks/useTransactions";
import { useProjects } from "@/hooks/useProjects";

interface ProfilePageProps {
  user: Profile;
  wallet: Wallet;
  onSignOut: () => void;
}

const ProfilePage = ({ user, wallet, onSignOut }: ProfilePageProps) => {
  const { updateProfile } = useProfile();
  const { transactions } = useTransactions();
  const { projects } = useProjects();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [profileData, setProfileData] = useState({
    firstName: user.first_name || "",
    lastName: user.last_name || "",
    phone: user.phone || "",
    address: user.address || "",
    dateOfBirth: user.date_of_birth || ""
  });

  const userBalance = wallet.balance;
  const currency = wallet.currency;
  const currencySymbol = currency === "NGN" ? "₦" : "$";

  // Calculate user statistics from real data
  const userTransactions = transactions.filter(t => t.user_id === user.id);
  const totalSupported = userTransactions
    .filter(t => t.type === 'debit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const projectsSupported = new Set(
    userTransactions
      .filter(t => t.project_id && t.type === 'debit')
      .map(t => t.project_id)
  ).size;
  
  const projectsCreated = projects.filter(p => p.admin_id === user.id).length;
  
  const completedTransactions = userTransactions.filter(t => t.status === 'completed').length;
  const totalTransactions = userTransactions.length;
  const successRate = totalTransactions > 0 ? Math.round((completedTransactions / totalTransactions) * 100) : 0;

  const userStats = {
    totalSupported,
    projectsSupported,
    projectsCreated,
    successRate,
    memberSince: new Date(user.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  };

  const securitySettings = [
    { id: "2fa", label: "Two-Factor Authentication", enabled: false },
    { id: "biometric", label: "Biometric Login", enabled: false },
    { id: "notifications", label: "Push Notifications", enabled: true },
    { id: "email-alerts", label: "Email Alerts", enabled: true }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    
    const { error } = await updateProfile({
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      phone: profileData.phone,
      address: profileData.address,
      date_of_birth: profileData.dateOfBirth
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    }
    
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <Button variant="outline" onClick={onSignOut} className="text-red-600 border-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm opacity-90">Available Balance</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold">
              {showBalance ? `${currencySymbol}${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : "••••••"}
            </p>
            <p className="text-sm opacity-90">{currency}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+2.5% this month</span>
            </div>
            <div className="flex items-center space-x-1">
              <Globe className="w-4 h-4" />
              <span className="text-sm">Global</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Button size="icon" className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700">
              <Camera className="w-4 h-4" />
            </Button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-gray-600">Account: {user.account_number || user.phone}</p>
            <Badge variant="outline" className="mt-2">
              Verified Member
            </Badge>
          </div>
        </div>
      </Card>

      {/* User Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Your Impact</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">₦{userStats.totalSupported.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Supported</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{userStats.projectsSupported}</p>
            <p className="text-sm text-gray-600">Projects Supported</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{userStats.projectsCreated}</p>
            <p className="text-sm text-gray-600">Projects Created</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{userStats.successRate}%</p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            disabled={isSaving}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <Input
                value={profileData.firstName}
                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <Input
                value={profileData.lastName}
                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <Input
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              disabled={!isEditing}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <Input
              value={profileData.address}
              onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
              disabled={!isEditing}
              placeholder="Enter address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <Input
              type="date"
              value={profileData.dateOfBirth}
              onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="flex space-x-3">
              <Button 
                onClick={handleSave} 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Security & Privacy</h3>
        <div className="space-y-4">
          {securitySettings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {setting.id === "2fa" && <Shield className="w-5 h-5 text-gray-600" />}
                  {setting.id === "biometric" && <Smartphone className="w-5 h-5 text-gray-600" />}
                  {setting.id === "notifications" && <Bell className="w-5 h-5 text-gray-600" />}
                  {setting.id === "email-alerts" && <Mail className="w-5 h-5 text-gray-600" />}
                </div>
                <span className="font-medium text-gray-900">{setting.label}</span>
              </div>
              <Badge variant={setting.enabled ? "default" : "secondary"}>
                {setting.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Member Since */}
      <Card className="p-4 text-center">
        <p className="text-sm text-gray-600">
          Member since {userStats.memberSince}
        </p>
      </Card>
    </div>
  );
};

export default ProfilePage;
