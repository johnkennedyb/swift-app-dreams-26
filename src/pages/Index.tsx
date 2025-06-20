
import { useState } from "react";
import Landing from "./Landing";
import Auth from "./Auth";
import Dashboard from "../components/dashboard/Dashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<"landing" | "signin" | "signup" | "dashboard">("landing");
  const [user, setUser] = useState(null);

  const handleAuthSuccess = () => {
    setUser({ name: "John Doe", email: "john@example.com" });
    setCurrentView("dashboard");
  };

  const handleSignOut = () => {
    setUser(null);
    setCurrentView("landing");
  };

  if (currentView === "landing") {
    return (
      <div>
        <Landing />
        <div className="fixed bottom-4 right-4 flex gap-2">
          <button 
            onClick={() => setCurrentView("signin")}
            className="bg-white text-purple-600 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            Sign In
          </button>
          <button 
            onClick={() => setCurrentView("signup")}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  if (currentView === "signin" || currentView === "signup") {
    return (
      <Auth 
        mode={currentView}
        onBack={() => setCurrentView("landing")}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <Dashboard 
      user={user}
      onSignOut={handleSignOut}
    />
  );
};

export default Index;
