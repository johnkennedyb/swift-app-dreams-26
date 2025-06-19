
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface AuthScreenProps {
  onLogin: (user: any) => void;
}

const AuthScreen = ({ onLogin }: AuthScreenProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match");
        return;
      }
      // Simulate signup
      const newUser = {
        id: Date.now(),
        email: formData.email,
        fullName: formData.fullName,
        balance: 0
      };
      localStorage.setItem('appbacus_user', JSON.stringify(newUser));
      onLogin(newUser);
    } else {
      // Simulate login
      const savedUser = localStorage.getItem('appbacus_user');
      if (savedUser) {
        onLogin(JSON.parse(savedUser));
      } else {
        // Demo user for testing
        const demoUser = {
          id: 1,
          email: formData.email,
          fullName: "Demo User",
          balance: 45750.80
        };
        localStorage.setItem('appbacus_user', JSON.stringify(demoUser));
        onLogin(demoUser);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/1b851feb-a03e-466e-87b1-f70e5594fe1a.png" 
              alt="AppBacus Logo" 
              className="w-16 h-16"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-purple-700">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <p className="text-gray-600">
            {isSignUp ? "Join AppBacus today" : "Sign in to your AppBacus account"}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-1 text-purple-600 hover:text-purple-700 font-medium"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthScreen;
