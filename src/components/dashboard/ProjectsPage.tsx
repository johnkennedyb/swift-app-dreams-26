
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Users, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Filter,
  Search
} from "lucide-react";

const ProjectsPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [inputAmount, setInputAmount] = useState("");
  const [inputPin, setInputPin] = useState("");

  const projects = [
    {
      id: 1,
      name: "Project Alpha",
      adminProfile: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      currentBalance: 25000,
      totalMembers: 12,
      status: "active",
      type: "credit",
      lastActivity: "2 hours ago",
      fundingGoal: 50000,
      progress: 50
    },
    {
      id: 2,
      name: "Emergency Fund",
      adminProfile: "https://images.unsplash.com/photo-1494790108755-2616b612b4c0?w=150&h=150&fit=crop&crop=face",
      currentBalance: 15000,
      totalMembers: 8,
      status: "active",
      type: "debit",
      lastActivity: "1 day ago",
      fundingGoal: 30000,
      progress: 50
    },
    {
      id: 3,
      name: "Community Garden",
      adminProfile: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      currentBalance: 8500,
      totalMembers: 15,
      status: "completed",
      type: "credit",
      lastActivity: "3 days ago",
      fundingGoal: 10000,
      progress: 85
    }
  ];

  const transactions = [
    { id: 1, sender: "Uchenna", amount: 100, time: "12pm", balance: 25000 },
    { id: 2, sender: "Emeka", amount: 300, time: "11:30", balance: 24900 },
    { id: 3, sender: "Highchief", amount: 1500, time: "Yesterday", balance: 24600 },
    { id: 4, sender: "Brother", amount: 10000, time: "2 weeks", balance: 23100 }
  ];

  const filters = [
    { id: "all", label: "All" },
    { id: "credit", label: "Credit" },
    { id: "debit", label: "Debit" },
    { id: "yet-to-support", label: "Yet to Support" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Project Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Funded</p>
              <p className="text-xl font-bold">$48,500</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-xl font-bold">3</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-xl font-bold">85%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Send Money Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Transfer</h2>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Input Amount"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Input Pin"
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Send from personal fund
            </Button>
            <Button variant="outline" className="border-purple-600 text-purple-600">
              Send from groups fund
            </Button>
          </div>
          <Button className="w-full bg-green-600 hover:bg-green-700">
            Approve
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter.id)}
            className={activeFilter === filter.id ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects
          .filter(project => activeFilter === "all" || project.type === activeFilter || 
                 (activeFilter === "yet-to-support" && project.status === "active"))
          .map((project) => (
            <Card key={project.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={project.adminProfile} />
                    <AvatarFallback>{project.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600">Current Balance: ${project.currentBalance.toLocaleString()}</p>
                  </div>
                </div>
                <Badge variant={project.status === "completed" ? "default" : "secondary"}>
                  {project.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Members</p>
                  <p className="font-semibold">{project.totalMembers}</p>
                </div>
                <div>
                  <p className="text-gray-600">Progress</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">{project.progress}%</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-purple-600">{transaction.id}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.sender}</p>
                  <p className="text-sm text-gray-600">{transaction.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">+${transaction.amount}</p>
                <p className="text-sm text-gray-600">${transaction.balance.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ProjectsPage;
