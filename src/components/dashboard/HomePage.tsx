
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Heart,
  Plus,
  Wallet,
  Target
} from "lucide-react";
import { Profile } from "@/hooks/useProfile";
import { Wallet as WalletType } from "@/hooks/useWallet";

interface HomePageProps {
  user: Profile;
  wallet: WalletType;
}

const HomePage = ({ user, wallet }: HomePageProps) => {
  // Mock data - in a real app, this would come from your hooks
  const recentTransactions = [
    { id: 1, type: 'credit', amount: 5000, description: 'Project Support Received', time: '2 hours ago' },
    { id: 2, type: 'debit', amount: 2000, description: 'Supported Tech Startup', time: '1 day ago' },
    { id: 3, type: 'credit', amount: 10000, description: 'Wallet Top-up', time: '2 days ago' },
  ];

  const quickStats = [
    { label: 'Total Supported', value: '₦125,000', change: '+12%', positive: true },
    { label: 'Projects Backed', value: '8', change: '+2', positive: true },
    { label: 'Support Received', value: '₦85,000', change: '+8%', positive: true },
  ];

  const featuredProjects = [
    { 
      id: 1, 
      name: 'GreenTech Innovation', 
      description: 'Sustainable energy solutions for rural communities',
      progress: 75,
      raised: 750000,
      goal: 1000000,
      supporters: 156,
      category: 'Environment'
    },
    { 
      id: 2, 
      name: 'EduPlatform', 
      description: 'Online learning platform for African students',
      progress: 45,
      raised: 225000,
      goal: 500000,
      supporters: 89,
      category: 'Education'
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user.first_name}!</h1>
            <p className="text-purple-100">Ready to make an impact today?</p>
          </div>
          <Avatar className="w-16 h-16 border-2 border-white/20">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className="text-lg font-bold text-purple-600">
              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Wallet Balance Card */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Available Balance</p>
                <p className="text-3xl font-bold">₦{wallet.balance.toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Funds
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Wallet className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`flex items-center text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col">
            <Target className="w-6 h-6 mb-2 text-purple-600" />
            <span className="text-sm">Create Project</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Heart className="w-6 h-6 mb-2 text-pink-600" />
            <span className="text-sm">Browse Projects</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Users className="w-6 h-6 mb-2 text-blue-600" />
            <span className="text-sm">Request Support</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <TrendingUp className="w-6 h-6 mb-2 text-green-600" />
            <span className="text-sm">View Analytics</span>
          </Button>
        </div>
      </Card>

      {/* Featured Projects */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Featured Projects</h2>
          <Button variant="ghost" size="sm" className="text-purple-600">
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {featuredProjects.map((project) => (
            <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{project.name}</h3>
                    <Badge variant="secondary" className="text-xs">{project.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{project.description}</p>
                </div>
                <Button size="sm" variant="ghost">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>₦{project.raised.toLocaleString()} raised</span>
                  <span className="text-gray-500">of ₦{project.goal.toLocaleString()}</span>
                </div>
                <Progress value={project.progress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{project.supporters} supporters</span>
                  <span>{project.progress}% funded</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'credit' ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  {transaction.type === 'credit' ? 
                    <ArrowDownRight className="w-5 h-5 text-green-600" /> : 
                    <ArrowUpRight className="w-5 h-5 text-purple-600" />
                  }
                </div>
                <div>
                  <p className="font-medium text-sm">{transaction.description}</p>
                  <p className="text-xs text-gray-500">{transaction.time}</p>
                </div>
              </div>
              <p className={`font-semibold ${
                transaction.type === 'credit' ? 'text-green-600' : 'text-purple-600'
              }`}>
                {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default HomePage;
