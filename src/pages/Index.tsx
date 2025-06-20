
import { useState } from "react";
import Auth from "./Auth";
import Dashboard from "../components/dashboard/Dashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<"signin" | "signup" | "dashboard">("signin");
  const [user, setUser] = useState(null);

  const handleAuthSuccess = () => {
    setUser({ name: "John Doe", email: "john@example.com" });
    setCurrentView("dashboard");
  };

  const handleSignOut = () => {
    setUser(null);
    setCurrentView("signin");
  };

  const toggleAuthMode = () => {
    setCurrentView(currentView === "signin" ? "signup" : "signin");
  };

  if (currentView === "dashboard") {
    return (
      <Dashboard 
        user={user}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <Auth 
      mode={currentView}
      onSuccess={handleAuthSuccess}
      onToggleMode={toggleAuthMode}
    />
  );
};

export default Index;
