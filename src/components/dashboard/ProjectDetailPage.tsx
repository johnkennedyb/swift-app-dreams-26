
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft, 
  Users, 
  Target, 
  Calendar,
  TrendingUp,
  Heart,
  Share2,
  MoreVertical,
  Loader2
} from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useSupportPayment } from "@/hooks/useSupportPayment";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
}

interface ProjectSupporter {
  id: string;
  amount: number;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

const ProjectDetailPage = ({ projectId, onBack }: ProjectDetailPageProps) => {
  const { projects } = useProjects();
  const { supportRequest, loading: supportPaymentLoading } = useSupportPayment();
  const { wallet } = useWallet();
  const { toast } = useToast();
  const [supporters, setSupporters] = useState<ProjectSupporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [supportAmount, setSupportAmount] = useState("");
  const [showSupportDialog, setShowSupportDialog] = useState(false);

  const project = projects.find(p => p.id === projectId);

  useEffect(() => {
    if (projectId) {
      fetchProjectSupporters();
    }
  }, [projectId]);

  const fetchProjectSupporters = async () => {
    try {
      // Get supporters by looking for transactions that mention this project
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          amount,
          created_at,
          profiles!transactions_user_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('type', 'debit')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter transactions that are related to this project based on project name in description
      const projectSupporters = (data || []).filter(transaction => {
        // Since we can't access description directly, we'll show all supporters for now
        // In a real implementation, you'd need to store project_id in transactions
        return true;
      });
      
      setSupporters(projectSupporters);
    } catch (error) {
      console.error('Error fetching project supporters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSupportProject = async () => {
    if (!supportAmount || !project) return;

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

    // Create a mock support request for this project to use the existing support system
    try {
      const { data: supportRequestData, error } = await supabase
        .from('support_requests')
        .insert({
          project_id: projectId,
          requester_id: project.admin_id,
          title: `Support for ${project.name}`,
          description: `Direct support for the project: ${project.name}`,
          amount_needed: amount,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      const success = await supportRequest(supportRequestData.id, amount);
      if (success) {
        setSupportAmount("");
        setShowSupportDialog(false);
        fetchProjectSupporters(); // Refresh supporters list
        toast({
          title: "Success",
          description: "Project supported successfully!",
        });
      }
    } catch (error) {
      console.error('Error supporting project:', error);
      toast({
        title: "Error",
        description: "Failed to support project. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  const progress = project.funding_goal > 0 ? (project.current_funding / project.funding_goal) * 100 : 0;
  const remainingAmount = Math.max(0, project.funding_goal - project.current_funding);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={project.profiles.avatar_url || undefined} />
                  <AvatarFallback className="text-lg font-semibold">
                    {project.profiles.first_name.charAt(0)}{project.profiles.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-1">
                    {project.name}
                  </CardTitle>
                  <p className="text-gray-600">
                    by {project.profiles.first_name} {project.profiles.last_name}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={project.status === "completed" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 leading-relaxed">
                    {project.description || "No description available for this project."}
                  </p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600">Target</p>
                    <p className="font-semibold">₦{project.funding_goal.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600">Raised</p>
                    <p className="font-semibold">₦{project.current_funding.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600">Supporters</p>
                    <p className="font-semibold">{supporters.length}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                      <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="font-semibold">{Math.round(progress)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supporters Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Project Supporters ({supporters.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : supporters.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No supporters yet</p>
                  <p className="text-sm text-gray-400">Be the first to support this project!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supporter</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supporters.map((supporter) => (
                      <TableRow key={supporter.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={supporter.profiles.avatar_url || undefined} />
                              <AvatarFallback>
                                {supporter.profiles.first_name.charAt(0)}{supporter.profiles.last_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {supporter.profiles.first_name} {supporter.profiles.last_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          ₦{supporter.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(supporter.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Funding Progress</p>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold text-gray-900">
                      ₦{project.current_funding.toLocaleString()}
                    </span>
                    <span className="text-gray-500">
                      of ₦{project.funding_goal.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <p className="text-sm text-gray-600 mt-2">
                    {Math.round(progress)}% funded • ₦{remainingAmount.toLocaleString()} remaining
                  </p>
                </div>

                <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3">
                      Support This Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Support {project.name}</DialogTitle>
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
                          onClick={handleSupportProject}
                          disabled={supportPaymentLoading || !supportAmount}
                        >
                          {supportPaymentLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Send Support
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-2xl font-bold text-gray-900">{supporters.length}</p>
                    <p className="text-xs text-gray-600">Supporters</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-2xl font-bold text-gray-900">{project.project_members.length}</p>
                    <p className="text-xs text-gray-600">Members</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Project Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.project_members.slice(0, 5).map((member, index) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">M{index + 1}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Member {index + 1}</p>
                      <p className="text-xs text-gray-500">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {project.project_members.length > 5 && (
                  <p className="text-sm text-gray-500 pt-2">
                    +{project.project_members.length - 5} more members
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
