import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Home, 
  User, 
  Settings, 
  Bell, 
  ArrowLeft,
  MessageCircle,
  Send,
  CheckCircle,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  CreditCard,
  TrendingUp,
  Shield,
  Globe
} from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [currentView, setCurrentView] = useState("main"); // main, project-detail, support-flow, confirmation, send-money, request-support
  const [selectedProject, setSelectedProject] = useState(null);
  const [supportAmount, setSupportAmount] = useState("");
  const [pin, setPin] = useState("");
  const [fundSource, setFundSource] = useState("personal");
  const [showBalance, setShowBalance] = useState(true);
  const [sendAmount, setSendAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");

  const userBalance = 45750.80;
  const currency = "USD";
  const currencySymbol = "$";

  const recentTransactions = [
    { id: 1, type: "sent", recipient: "Project Alpha", amount: 250, time: "2 hours ago", status: "completed" },
    { id: 2, type: "received", sender: "Sarah Johnson", amount: 100, time: "5 hours ago", status: "completed" },
    { id: 3, type: "sent", recipient: "Emergency Fund", amount: 500, time: "Yesterday", status: "completed" },
    { id: 4, type: "received", sender: "Community Pool", amount: 1000, time: "2 days ago", status: "completed" },
  ];

  const quickActions = [
    { id: 1, title: "Send Money", icon: ArrowUpRight, action: () => setCurrentView("send-money") },
    { id: 2, title: "Request Support", icon: ArrowDownLeft, action: () => setCurrentView("request-support") },
    { id: 3, title: "Add Funds", icon: Plus, action: () => {} },
    { id: 4, title: "Cards", icon: CreditCard, action: () => {} },
  ];

  const renderHomeTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning</h1>
          <p className="text-gray-600">Ready to support today?</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b4c0?w=150&h=150&fit=crop&crop=face" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm opacity-90">Available Balance</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold">
              {showBalance ? `${currencySymbol}${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : "••••••"}
            </p>
            <p className="text-sm opacity-90">{currency}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+2.5% this month</span>
            </div>
            <div className="flex items-center space-x-1">
              <Globe className="w-4 h-4" />
              <span className="text-sm">Global</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Card key={action.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={action.action}>
              <CardContent className="p-4 text-center">
                <action.icon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium">{action.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Button variant="ghost" size="sm" className="text-purple-600">
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'sent' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {transaction.type === 'sent' ? 
                      <ArrowUpRight className="w-5 h-5 text-red-600" /> : 
                      <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    }
                  </div>
                  <div>
                    <p className="font-medium">
                      {transaction.type === 'sent' ? transaction.recipient : transaction.sender}
                    </p>
                    <p className="text-sm text-gray-600">{transaction.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'sent' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.type === 'sent' ? '-' : '+'}{currencySymbol}{transaction.amount}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSendMoneyFlow = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setCurrentView("main")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">Send Money</h1>
        <div></div>
      </div>

      <Card className="p-6">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-2">Available Balance</p>
          <p className="text-2xl font-bold">{currencySymbol}{userBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Recipient ID or Email</label>
            <Input
              placeholder="Enter recipient details"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {currencySymbol}
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="pl-8 text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Purpose</label>
            <Input placeholder="What's this for?" />
          </div>
        </div>
      </Card>

      <Button 
        className="w-full bg-purple-600 hover:bg-purple-700 p-4 text-lg"
        onClick={() => setCurrentView("confirmation")}
      >
        Send {currencySymbol}{sendAmount || "0.00"}
      </Button>
    </div>
  );

  const renderRequestSupportFlow = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setCurrentView("main")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">Request Support</h1>
        <div></div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Request Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {currencySymbol}
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={supportAmount}
                onChange={(e) => setSupportAmount(e.target.value)}
                className="pl-8 text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reason for Support</label>
            <Input placeholder="Briefly describe why you need support" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Supporters</label>
            <Input placeholder="Who should see this request?" />
          </div>
        </div>
      </Card>

      <Button 
        className="w-full bg-purple-600 hover:bg-purple-700 p-4 text-lg"
        onClick={() => setCurrentView("confirmation")}
      >
        Send Request
      </Button>
    </div>
  );

  const renderProjectDetail = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setCurrentView("main")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-purple-600">{selectedProject?.title}</h1>
        <div></div>
      </div>

      {/* Media Placeholder */}
      <Card className="p-8 bg-gray-100 border-2 border-dashed border-gray-300">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📹</div>
          <p>[Video, Audio or Image Here]</p>
        </div>
      </Card>

      {/* Description */}
      <p className="text-gray-700 leading-relaxed">{selectedProject?.description}</p>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          className="flex-1 bg-purple-600 hover:bg-purple-700"
          onClick={() => setCurrentView("support-flow")}
        >
          Support
        </Button>
        <Button variant="outline" className="flex-1 border-purple-600 text-purple-600">
          Decline
        </Button>
        <Button variant="outline" className="flex-1 border-purple-600 text-purple-600">
          <MessageCircle className="w-4 h-4 mr-2" />
          Message
        </Button>
      </div>

      {/* Comments Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Comments</h3>
        <div className="flex gap-3">
          <Input placeholder="Add a comment..." className="flex-1" />
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSupportFlow = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setCurrentView("project-detail")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-purple-600">Support Project</h1>
        <div></div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Input Amount:</label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={supportAmount}
            onChange={(e) => setSupportAmount(e.target.value)}
            className="text-lg p-4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Input Pin:</label>
          <Input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="text-lg p-4"
          />
        </div>

        <div className="space-y-3">
          <Button
            variant={fundSource === "personal" ? "default" : "outline"}
            className={`w-full p-4 text-left ${fundSource === "personal" ? "bg-purple-600" : "border-purple-600 text-purple-600"}`}
            onClick={() => setFundSource("personal")}
          >
            Send from personal fund
          </Button>
          <Button
            variant={fundSource === "group" ? "default" : "outline"}
            className={`w-full p-4 text-left ${fundSource === "group" ? "bg-purple-600" : "border-purple-600 text-purple-600"}`}
            onClick={() => setFundSource("group")}
          >
            Send from group's fund
          </Button>
        </div>

        <Button 
          className="w-full bg-purple-600 hover:bg-purple-700 p-4 text-lg"
          onClick={() => setCurrentView("confirmation")}
        >
          Approve
        </Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <CheckCircle className="w-24 h-24 text-green-500" />
      <h1 className="text-3xl font-bold text-gray-800">Done</h1>
      <Button 
        className="bg-purple-600 hover:bg-purple-700 px-8"
        onClick={() => {
          setCurrentView("main");
          setActiveTab("home");
        }}
      >
        Done
      </Button>
    </div>
  );

  const renderSupportTab = () => (
    <div className="space-y-6">
      {/* Project List */}
      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={project.avatar} />
                  <AvatarFallback>{project.title.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{project.title}</h3>
                  <p className="text-sm text-gray-600">Members: {project.members}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-2">{project.date}</p>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    setSelectedProject(project);
                    setCurrentView("project-detail");
                  }}
                >
                  Support
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Support Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Your most recent support</h2>
        <Card className="p-6 text-center">
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" />
            <AvatarFallback>PA</AvatarFallback>
          </Avatar>
          <p className="font-semibold mb-4">Supported Project Alpha</p>
          <div className="flex justify-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </Card>
        <Button className="w-full bg-purple-600 hover:bg-purple-700">
          Ask for Support
        </Button>
      </div>
    </div>
  );

  const renderProjectsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b4c0?w=150&h=150&fit=crop&crop=face" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">Project Alpha</h2>
            <p className="text-sm text-gray-600">Current Balance: ₦25,000</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">Total</p>
          <p className="text-sm font-semibold">members</p>
        </div>
      </div>

      {/* Transaction Filters */}
      <div className="flex space-x-2">
        <Button variant="outline" size="sm">All</Button>
        <Button variant="outline" size="sm">Credit</Button>
        <Button variant="outline" size="sm">Debit</Button>
        <Button variant="outline" size="sm">Yet to support</Button>
      </div>

      {/* Transaction Table */}
      <Card>
        <div className="p-4">
          <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-gray-600 mb-3">
            <div>A/Z</div>
            <div>Sender</div>
            <div>₦</div>
            <div>Time</div>
            <div>Balance</div>
          </div>
          {transactions.map((transaction) => (
            <div key={transaction.id} className="grid grid-cols-5 gap-2 text-sm py-2 border-t">
              <div>{transaction.id}</div>
              <div>{transaction.sender}</div>
              <div>₦{transaction.amount}</div>
              <div>{transaction.time}</div>
              <div>{transaction.balance > 0 ? `₦${transaction.balance}` : "—"}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* User Info */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b4c0?w=150&h=150&fit=crop&crop=face" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">Name</h2>
            <p className="text-gray-600">Position/Post</p>
          </div>
        </div>
      </Card>

      {/* Balances */}
      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="font-semibold text-gray-700">Personal Balance</h3>
          <p className="text-2xl font-bold">₦100,000</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-semibold text-gray-700">Group's Balance</h3>
          <p className="text-2xl font-bold">₦150,000</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-semibold text-gray-700">Total Balance</h3>
          <p className="text-2xl font-bold">₦250,000</p>
        </Card>
      </div>

      {/* Administered Groups */}
      <div>
        <h3 className="font-semibold mb-4">Administered Groups</h3>
        <div className="space-y-3">
          {administeredGroups.map((group) => (
            <Card key={group.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <span className="font-medium">{group.name}</span>
                </div>
                <span className="font-semibold">₦{group.balance.toLocaleString()}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch (activeTab) {
      case "home":
        return renderHomeTab();
      case "support":
        return renderSupportTab();
      case "projects":
        return renderProjectsTab();
      case "profile":
        return renderProfileTab();
      default:
        return renderHomeTab();
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case "send-money":
        return renderSendMoneyFlow();
      case "request-support":
        return renderRequestSupportFlow();
      case "project-detail":
        return renderProjectDetail();
      case "support-flow":
        return renderSupportFlow();
      case "confirmation":
        return renderConfirmation();
      default:
        return renderMainContent();
    }
  };

  const projects = [
    {
      id: 1,
      title: "Project Alpha",
      members: 12,
      date: "Mar 22, 2025",
      description: "This is the reason for the contribution. Watch, read, or listen to the story behind the request.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b4c0?w=150&h=150&fit=crop&crop=face",
      balance: 25000
    },
    {
      id: 2,
      title: "Project Beta",
      members: 8,
      date: "Mar 20, 2025",
      description: "Another project seeking support for important initiatives.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      balance: 18500
    }
  ];

  const transactions = [
    { id: 1, sender: "Ushericria", amount: 100, time: "12 pm", balance: 25000 },
    { id: 2, sender: "Emeka", amount: 300, time: "11:30", balance: 0 },
    { id: 3, sender: "Highchief", amount: 1050, time: "Yesterday", balance: 0 },
    { id: 4, sender: "Brother", amount: 10000, time: "2 weeks", balance: 0 }
  ];

  const administeredGroups = [
    { id: 1, name: "Project Alpha", balance: 25000 },
    { id: 2, name: "Project Beta", balance: 18500 },
    { id: 3, name: "Project Gamma", balance: 32000 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="pb-20 px-4 pt-6">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      {currentView === "main" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around">
            {[
              { id: "home", icon: Home, label: "Home" },
              { id: "support", icon: User, label: "Support" },
              { id: "projects", icon: Settings, label: "Projects" },
              { id: "profile", icon: User, label: "Profile" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-purple-50 text-purple-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <tab.icon className={`w-5 h-5 mb-1 ${
                  activeTab === tab.id ? "text-purple-600" : ""
                }`} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
