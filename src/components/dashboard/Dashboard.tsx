import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Users, 
  Heart, 
  User, 
  Settings,
  Search,
  Home
} from "lucide-react";
import { Profile } from "@/hooks/useProfile";
import { Wallet } from "@/hooks/useWallet";
import HomePage from "./HomePage";

import SupportPage from "./SupportPage";
import ProfilePage from "./ProfilePage";
import CommentsPage from "./CommentsPage";

import BottomNavigation from "./BottomNavigation";

interface DashboardProps {
  user: Profile;
  wallet: Wallet;
  onSignOut: () => void;
}

const Dashboard = ({ user, wallet, onSignOut }: DashboardProps) => {
  // TODO: fetch real notifications status
  const hasNotifications = false;
  const [activeTab, setActiveTab] = useState("support");
  const [viewingCommentsForRequestId, setViewingCommentsForRequestId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const getHeaderTitle = () => {
    if (viewingCommentsForRequestId) return "Comments";
    switch (activeTab) {
      case 'home':
        return 'Appacus';
      case 'support':
        return 'Support';
      case 'profile':
        return 'Profile';
      default:
        return 'Appacus';
    }
  };

  const navigation = [
    { id: "home", name: "Home", icon: Home },
    { id: "support", name: "Support", icon: Heart },
    { id: "profile", name: "Profile", icon: User },
  ];

    const renderContent = () => {
    if (viewingCommentsForRequestId) {
      return <CommentsPage supportRequestId={viewingCommentsForRequestId} onBack={() => setViewingCommentsForRequestId(null)} />;
    }
    switch (activeTab) {
      case "home":
        return <HomePage user={user} onNavigate={setActiveTab} />;
      case "support":
        return <SupportPage user={user} wallet={wallet} onViewComments={setViewingCommentsForRequestId} />;
      
      
      case "profile":
        return <ProfilePage />;
      case "create":
        // For now, redirect to projects page where they can create
        setActiveTab("support");
        return <SupportPage user={user} wallet={wallet} onViewComments={setViewingCommentsForRequestId} />;
      default:
        return <HomePage user={user} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 hidden lg:block ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{getHeaderTitle()}</span>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="p-6 border-b">
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <p className="text-purple-100 text-sm font-medium">Wallet Balance</p>
                <p className="text-2xl font-bold">₦{wallet.balance.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Button
                      variant={activeTab === item.id ? "default" : "ghost"}
                      className={`w-full justify-start gap-3 ${
                        activeTab === item.id 
                          ? "bg-purple-600 text-white hover:bg-purple-700" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900"
              onClick={onSignOut}
            >
              <Settings className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Abacus Brand - Always visible */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center lg:hidden">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{getHeaderTitle()}</span>
              </div>
              <div className="hidden md:flex items-center gap-4 ml-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen">
          {renderContent()}
        </main>
      </div>

      {/* Bottom Navigation - Only visible on mobile */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        hasNotifications={hasNotifications}
      />
    </div>
  );
};

export default Dashboard;
