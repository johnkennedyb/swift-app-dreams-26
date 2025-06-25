import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Heart, 
  Plus,
  Search,
  Filter,
  Loader2,
  UserPlus,
  ArrowLeft
} from "lucide-react";
import { useSupportRequests } from "@/hooks/useSupportRequests";
import { useProjects } from "@/hooks/useProjects";
import { useSupportPayment } from "@/hooks/useSupportPayment";
import { useWallet } from "@/hooks/useWallet";
import { supabase } from "@/integrations/supabase/client";
import ProjectDetailPage from "./ProjectDetailPage";

interface ProjectMember {
  id: string;
  user_id: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
}

const EnhancedSupportPage = () => {
  const { supportRequests, loading: supportLoading, createSupportRequest } = useSupportRequests();
  const { projects, loading: projectsLoading } = useProjects();
  const { supportRequest, loading: supportPaymentLoading } = useSupportPayment();
  const { wallet } = useWallet();
  const { toast } = useToast();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [supportAmount, setSupportAmount] = useState("");
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    project_id: "",
    title: "",
    description: "",
    amount_needed: ""
  });
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // If a project is selected for detail view, show ProjectDetailPage
  if (selectedProjectId) {
    return (
      <ProjectDetailPage 
        projectId={selectedProjectId} 
        onBack={() => setSelectedProjectId(null)} 
      />
    );
  }

  const handleProjectChange = async (projectId: string) => {
    setFormData(prev => ({ ...prev, project_id: projectId }));
    setSelectedMembers([]);
    
    if (projectId) {
      try {
        const { data, error } = await supabase
          .from('project_members')
          .select(`
            id,
            user_id,
            profiles!project_members_user_id_fkey (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('project_id', projectId);

        if (error) throw error;
        
        // Filter out members with null profiles and log any issues
        const validMembers = (data || []).filter(member => {
          if (!member.profiles) {
            console.warn(`Member ${member.user_id} has no profile data`);
            return false;
          }
          return true;
        });
        
        setProjectMembers(validMembers);
        
        if (validMembers.length < (data || []).length) {
          toast({
            title: "Note",
            description: "Some project members don't have complete profile information",
            variant: "default",
          });
        }
      } catch (error) {
        console.error('Error fetching project members:', error);
        toast({
          title: "Error",
          description: "Failed to load project members",
          variant: "destructive",
        });
      }
    } else {
      setProjectMembers([]);
    }
  };

  const handleMemberToggle = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateRequest = async () => {
    if (!formData.project_id || !formData.title || !formData.description || !formData.amount_needed) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (selectedMembers.length === 0) {
      toast({
        title: "Error", 
        description: "Please select at least one member to support you",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    const { error } = await createSupportRequest({
      project_id: formData.project_id,
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
      setFormData({ project_id: "", title: "", description: "", amount_needed: "" });
      setSelectedMembers([]);
      setProjectMembers([]);
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

  const filteredMembers = projectMembers.filter(member => {
    if (!member.profiles) return false;
    const memberName = `${member.profiles.first_name} ${member.profiles.last_name}`;
    return memberName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (supportLoading || projectsLoading) {
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
          <p className="text-gray-600 mt-1">Request support from your project community</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project_id">Project *</Label>
                  <Select value={formData.project_id} onValueChange={handleProjectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              </div>
              
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

              {formData.project_id && (
                <div>
                  <Label className="text-base font-semibold">Select Members to Support You *</Label>
                  <p className="text-sm text-gray-600 mb-3">Choose project members you'd like to request support from</p>
                  
                  {projectMembers.length > 0 && (
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  )}

                  <div className="max-h-64 overflow-y-auto border rounded-lg p-3 space-y-2">
                    {projectMembers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No members found in this project</p>
                        <p className="text-xs mt-1">Members may need to complete their profiles</p>
                      </div>
                    ) : filteredMembers.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        <p>No members match your search</p>
                      </div>
                    ) : (
                      filteredMembers.map((member) => (
                        <div key={member.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                          <Checkbox
                            checked={selectedMembers.includes(member.user_id)}
                            onCheckedChange={() => handleMemberToggle(member.user_id)}
                          />
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={member.profiles?.avatar_url || undefined} />
                            <AvatarFallback className="bg-purple-100 text-purple-600">
                              {member.profiles ? 
                                `${member.profiles.first_name.charAt(0)}${member.profiles.last_name.charAt(0)}` : 
                                'UN'
                              }
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {member.profiles ? 
                              `${member.profiles.first_name} ${member.profiles.last_name}` : 
                              'Unknown User'
                            }
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {selectedMembers.length > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}

              <Button 
                onClick={handleCreateRequest} 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
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
                <p className="text-gray-500 mb-4">Be the first to create a support request and get help from your community.</p>
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
                      <p className="text-sm text-gray-500">{request.projects?.name || 'Unknown Project'}</p>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-purple-600 hover:text-purple-700"
                      onClick={() => {
                        const project = projects.find(p => p.id === request.project_id);
                        if (project) {
                          setSelectedProjectId(project.id);
                        }
                      }}
                    >
                      View Project
                    </Button>
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
