
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, LogOut } from "lucide-react";

interface AppHeaderProps {
  user: any;
  onLogout: () => void;
}

const AppHeader = ({ user, onLogout }: AppHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <img 
          src="/lovable-uploads/1b851feb-a03e-466e-87b1-f70e5594fe1a.png" 
          alt="AppBacus" 
          className="w-8 h-8"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning</h1>
          <p className="text-gray-600">Ready to support today?</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </Button>
        <Avatar className="w-10 h-10">
          <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b4c0?w=150&h=150&fit=crop&crop=face" />
          <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon" onClick={onLogout}>
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default AppHeader;
