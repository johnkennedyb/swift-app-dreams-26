
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Shield, 
  Globe, 
  Smartphone, 
  TrendingUp,
  Users,
  Lock,
  Zap
} from "lucide-react";

const Landing = () => {
  const [currentView, setCurrentView] = useState("landing");

  const features = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your money is protected with enterprise-grade encryption and multi-factor authentication."
    },
    {
      icon: Globe,
      title: "Global Transfers",
      description: "Send money worldwide with competitive exchange rates and low fees."
    },
    {
      icon: Smartphone,
      title: "Mobile First",
      description: "Manage your finances on-the-go with our intuitive mobile experience."
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "Track your spending patterns and financial goals with advanced insights."
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with others and participate in support networks and projects."
    },
    {
      icon: Zap,
      title: "Instant Transactions",
      description: "Send and receive money instantly with real-time transaction processing."
    }
  ];

  if (currentView !== "landing") {
    return null; // Will be handled by routing
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-800/85 to-indigo-900/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-bold text-xl">A</span>
            </div>
            <span className="text-white text-xl font-bold">AppBacus</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10"
              onClick={() => setCurrentView("signin")}
            >
              Sign In
            </Button>
            <Button 
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => setCurrentView("signup")}
            >
              Get Started
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="px-6 py-16 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            The Future of
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Digital Finance
            </span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl mx-auto">
            Send money globally, support communities, and manage your finances with the most trusted fintech platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 px-8 py-4 text-lg font-semibold"
              onClick={() => setCurrentView("signup")}
            >
              Start Banking Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-12">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">$2.5B+</div>
                <div className="text-gray-200">Transactions Processed</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">150+</div>
                <div className="text-gray-200">Countries Supported</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">2M+</div>
                <div className="text-gray-200">Happy Customers</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Why Choose AppBacus?</h2>
              <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                Experience banking reimagined with cutting-edge technology and user-centric design.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <feature.icon className="w-12 h-12 text-yellow-400 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-200 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-6 py-16">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold text-black mb-4">Ready to Transform Your Financial Life?</h2>
              <p className="text-lg text-gray-800 mb-8">Join millions who trust AppBacus for their financial needs.</p>
              <Button 
                size="lg" 
                className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg font-semibold"
                onClick={() => setCurrentView("signup")}
              >
                Open Your Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-white/10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold">A</span>
              </div>
              <span className="text-white text-lg font-bold">AppBacus</span>
            </div>
            <p className="text-gray-300 text-sm">
              © 2024 AppBacus. All rights reserved. Licensed and regulated financial institution.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
