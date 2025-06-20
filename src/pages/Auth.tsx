
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Shield, 
  CheckCircle, 
  Globe,
  Smartphone,
  Lock
} from "lucide-react";

interface AuthProps {
  mode: "signin" | "signup";
  onBack: () => void;
  onSuccess: () => void;
}

const Auth = ({ mode, onBack, onSuccess }: AuthProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    country: "",
    acceptTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const isSignIn = mode === "signin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 2000);
  };

  const securityFeatures = [
    { icon: Shield, text: "256-bit SSL encryption" },
    { icon: Lock, text: "Multi-factor authentication" },
    { icon: Globe, text: "Global compliance standards" },
    { icon: Smartphone, text: "Biometric authentication" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-purple-800/90 to-indigo-900/95"></div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="flex items-center mb-8">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/10 mr-4"
                onClick={onBack}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-xl">A</span>
                </div>
                <span className="text-white text-xl font-bold">AppBacus</span>
              </div>
            </div>

            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {isSignIn ? "Welcome Back" : "Create Your Account"}
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  {isSignIn 
                    ? "Sign in to access your AppBacus account" 
                    : "Join millions who trust AppBacus for their financial needs"
                  }
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isSignIn && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <Input
                            type="text"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            className="h-12"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <Input
                            type="text"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            className="h-12"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="h-12"
                      required
                    />
                  </div>

                  {!isSignIn && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="h-12"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="h-12 pr-12"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {!isSignIn && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="h-12"
                        required
                      />
                    </div>
                  )}

                  {isSignIn && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 mr-2" />
                        <span className="text-sm text-gray-600">Remember me</span>
                      </label>
                      <Button variant="ghost" className="text-sm text-purple-600 hover:text-purple-700 p-0">
                        Forgot password?
                      </Button>
                    </div>
                  )}

                  {!isSignIn && (
                    <div className="flex items-start">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 mr-3 mt-1" 
                        required 
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{" "}
                        <Button variant="ghost" className="text-purple-600 hover:text-purple-700 p-0 h-auto">
                          Terms of Service
                        </Button>
                        {" "}and{" "}
                        <Button variant="ghost" className="text-purple-600 hover:text-purple-700 p-0 h-auto">
                          Privacy Policy
                        </Button>
                      </span>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : (isSignIn ? "Sign In" : "Create Account")}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-gray-600">
                    {isSignIn ? "Don't have an account?" : "Already have an account?"}
                    <Button 
                      variant="ghost" 
                      className="text-purple-600 hover:text-purple-700 ml-1 p-0 h-auto"
                      onClick={() => {/* Toggle between signin/signup */}}
                    >
                      {isSignIn ? "Sign up" : "Sign in"}
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Security badges */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {securityFeatures.map((feature, index) => (
                <Badge key={index} variant="outline" className="bg-white/10 border-white/20 text-white">
                  <feature.icon className="w-3 h-3 mr-1" />
                  {feature.text}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Features */}
        <div className="hidden lg:flex flex-1 items-center justify-center px-12">
          <div className="max-w-md text-white">
            <h2 className="text-3xl font-bold mb-6">
              {isSignIn ? "Secure Banking" : "Join the Future"}
            </h2>
            <div className="space-y-4">
              {[
                "Bank-grade security with 256-bit encryption",
                "Send money globally in seconds",
                "Support communities and causes you care about",
                "Real-time transaction monitoring",
                "24/7 customer support in 50+ languages"
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-200">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
