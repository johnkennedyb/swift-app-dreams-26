
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Heart, 
  User
} from "lucide-react";



interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasNotifications?: boolean;
}

const BottomNavigation = ({ activeTab, onTabChange, hasNotifications }: BottomNavigationProps) => {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "support", label: "Support", icon: Heart },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
      <div className="grid grid-cols-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          

          
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
              <span className="relative inline-block">
                <Icon className="w-5 h-5" />
                {item.id === "profile" && hasNotifications && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </span>
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
