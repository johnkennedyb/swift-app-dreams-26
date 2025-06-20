
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Smartphone
} from "lucide-react";

interface ProfilePageProps {
  user: any;
  onSignOut: () => void;
}

const ProfilePage = ({ user, onSignOut }: ProfilePageProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: user?.email || "john@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001",
    dateOfBirth: "1990-01-15"
  });

  const userStats = {
    totalSupported: 15420,
    projectsSupported: 8,
    projectsCreated: 3,
    successRate: 95,
    memberSince: "January 2023"
  };

  const securitySettings = [
    { id: "2fa", label: "Two-Factor Authentication", enabled: true },
    { id: "biometric", label: "Biometric Login", enabled: false },
    { id: "notifications", label: "Push Notifications", enabled: true },
    { id: "email-alerts", label: "Email Alerts", enabled: true }
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
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

      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b4c0?w=150&h=150&fit=crop&crop=face" />
              <AvatarFallback className="text-2xl">JD</AvatarFallback>
            </Avatar>
            <Button size="icon" className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700">
              <Camera className="w-4 h-4" />
            </Button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profileData.firstName} {profileData.lastName}</h2>
            <p className="text-gray-600">{profileData.email}</p>
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
            <p className="text-2xl font-bold text-purple-600">${userStats.totalSupported.toLocaleString()}</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <Input
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <Input
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <Input
              value={profileData.address}
              onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="flex space-x-3">
              <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
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

      {/* Account Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Lock className="w-4 h-4 mr-3" />
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <CreditCard className="w-4 h-4 mr-3" />
            Payment Methods
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-3" />
            App Preferences
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-600 border-red-600">
            <LogOut className="w-4 h-4 mr-3" />
            Delete Account
          </Button>
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
