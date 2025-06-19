
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  User, 
  Settings, 
  Bell, 
  Activity, 
  TrendingUp, 
  Calendar,
  Plus,
  Search
} from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  const stats = [
    { label: "Tasks", value: "12", icon: Activity, color: "bg-blue-500" },
    { label: "Progress", value: "85%", icon: TrendingUp, color: "bg-green-500" },
    { label: "Events", value: "3", icon: Calendar, color: "bg-purple-500" },
  ];

  const recentActivities = [
    { title: "Completed morning workout", time: "2 hours ago", type: "success" },
    { title: "Meeting with team", time: "4 hours ago", type: "info" },
    { title: "Updated project status", time: "6 hours ago", type: "default" },
  ];

  const renderHomeTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning!</h1>
          <p className="text-gray-600">Ready to start your day?</p>
        </div>
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 bg-gradient-to-br from-white to-gray-50 border-0 shadow-md">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <p className="text-blue-100 text-sm">What would you like to do?</p>
          </div>
          <Button variant="secondary" size="icon" className="bg-white/20 text-white border-0 hover:bg-white/30">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'success' ? 'bg-green-500' :
                activity.type === 'info' ? 'bg-blue-500' : 'bg-gray-400'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16 border-2 border-white">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b4c0?w=150&h=150&fit=crop&crop=face" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">Jane Doe</h2>
            <p className="text-indigo-100">jane.doe@example.com</p>
            <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-0">Pro Member</Badge>
          </div>
        </div>
      </Card>

      {/* Profile Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center border-0 shadow-md">
          <div className="text-2xl font-bold text-gray-900">142</div>
          <div className="text-sm text-gray-600">Tasks Completed</div>
        </Card>
        <Card className="p-4 text-center border-0 shadow-md">
          <div className="text-2xl font-bold text-gray-900">28</div>
          <div className="text-sm text-gray-600">Days Streak</div>
        </Card>
      </div>

      {/* Profile Actions */}
      <div className="space-y-3">
        <Button variant="outline" className="w-full justify-start" size="lg">
          <User className="w-5 h-5 mr-3" />
          Edit Profile
        </Button>
        <Button variant="outline" className="w-full justify-start" size="lg">
          <Bell className="w-5 h-5 mr-3" />
          Notifications
        </Button>
        <Button variant="outline" className="w-full justify-start" size="lg">
          <Settings className="w-5 h-5 mr-3" />
          Account Settings
        </Button>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Push Notifications</span>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Dark Mode</span>
            <Button variant="outline" size="sm">Off</Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Location Services</span>
            <Button variant="outline" size="sm">Allow</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="ghost" className="w-full justify-start">
            Help Center
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Contact Support
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Privacy Policy
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="pb-20 px-4 pt-6">
        {activeTab === "home" && renderHomeTab()}
        {activeTab === "profile" && renderProfileTab()}
        {activeTab === "settings" && renderSettingsTab()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {[
            { id: "home", icon: Home, label: "Home" },
            { id: "search", icon: Search, label: "Search" },
            { id: "profile", icon: User, label: "Profile" },
            { id: "settings", icon: Settings, label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <tab.icon className={`w-5 h-5 mb-1 ${
                activeTab === tab.id ? "text-blue-600" : ""
              }`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
