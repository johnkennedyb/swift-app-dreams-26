
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Heart, 
  Plus,
  Search,
  Filter,
  Loader2
} from "lucide-react";
import { useSupportRequests } from "@/hooks/useSupportRequests";
import { useSupportPayment } from "@/hooks/useSupportPayment";
import { useWallet } from "@/hooks/useWallet";

const EnhancedSupportPage = () => {
  const { supportRequests, loading: supportLoading, createSupportRequest } = useSupportRequests();
  const { supportRequest, loading: supportPaymentLoading } = useSupportPayment();
  const { wallet } = useWallet();
  const { toast } = useToast();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [supportAmount, setSupportAmount] = useState("");
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount_needed: ""
  });
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateRequest = async () => {
    if (!formData.title || !formData.description || !formData.amount_needed) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    const { error } = await createSupportRequest({
      title: formData.title,
      description: formData.description,
      amount_needed: parseFloat(formData.amount_needed),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create support request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Support request created successfully",
      });
      setShowCreateDialog(false);
      setFormData({ title: "", description: "", amount_needed: "" });
    }
    setIsCreating(false);
  };

  const handleSupportClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setSupportAmount("");
    setShowSupportDialog(true);
  };

  const handleSupportSubmit = async () => {
    if (!selectedRequestId || !supportAmount) return;

    const amount = parseFloat(supportAmount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (wallet && amount > wallet.balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds in your wallet",
        variant: "destructive",
      });
      return;
    }

    const success = await supportRequest(selectedRequestId, amount);
    if (success) {
      setSupportAmount("");
      setSelectedRequestId(null);
      setShowSupportDialog(false);
      toast({
        title: "Success",
        description: "Support sent successfully!",
      });
    }
  };

  const filteredRequests = supportRequests.filter(request => {
    const profileData = request.profiles;
    const profileName = profileData ? 
      `${profileData.first_name} ${profileData.last_name}` : 
      'Unknown User';
    
    return request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profileName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (supportLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Hub</h1>
          <p className="text-gray-600 mt-1">Request support from the community</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6">
              <Plus className="w-4 h-4 mr-2" />
              Request Support
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Support Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Support Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What do you need support for?"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide details about your support request"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="amount_needed">Amount Needed (NGN) *</Label>
                <Input
                  id="amount_needed"
                  type="number"
                  value={formData.amount_needed}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount_needed: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <Button 
                onClick={handleCreateRequest} 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Support Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search support requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Support Requests</h3>
                <p className="text-gray-500 mb-4">Be the first to create a support request and get help from the community.</p>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Request
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const profileData = request.profiles;
            
            return (
              <Card key={request.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={profileData?.avatar_url || undefined} />
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {profileData ? 
                          `${profileData.first_name.charAt(0)}${profileData.last_name.charAt(0)}` : 
                          'UN'
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {profileData ? 
                          `${profileData.first_name} ${profileData.last_name}` : 
                          'User Profile Loading...'
                        }
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {request.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {request.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {request.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Amount Needed</p>
                      <p className="text-xl font-bold text-purple-600">
                        ₦{request.amount_needed.toLocaleString()}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleSupportClick(request.id)}
                    >
                      Support
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-xs text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Support Dialog */}
      <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Support This Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Your wallet balance: ₦{wallet?.balance.toLocaleString() || '0'}</Label>
            </div>
            <div>
              <Label htmlFor="support_amount">Amount to Support (NGN)</Label>
              <Input
                id="support_amount"
                type="number"
                value={supportAmount}
                onChange={(e) => setSupportAmount(e.target.value)}
                placeholder="Enter amount"
                max={wallet?.balance || 0}
              />
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowSupportDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handleSupportSubmit}
                disabled={supportPaymentLoading || !supportAmount}
              >
                {supportPaymentLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Send Support
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedSupportPage;
