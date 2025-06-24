
import { Button } from "@/components/ui/button";
import { 
  Home, 
  LayoutDashboard, 
  Heart, 
  User,
  Plus
} from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "projects", label: "Projects", icon: LayoutDashboard },
    { id: "create", label: "Create", icon: Plus, isAction: true },
    { id: "support", label: "Support", icon: Heart },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
      <div className="grid grid-cols-5 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          if (item.isAction) {
            return (
              <div key={item.id} className="flex justify-center">
                <Button
                  size="sm"
                  className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className="w-5 h-5" />
                </Button>
              </div>
            );
          }
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex flex-col items-center justify-center h-16 gap-1 ${
                isActive 
                  ? "text-purple-600 bg-purple-50" 
                  : "text-gray-600"
              }`}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
