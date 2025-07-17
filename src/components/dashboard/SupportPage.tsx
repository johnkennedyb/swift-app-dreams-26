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
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Heart, 
  Users, 
  Calendar,
  ArrowRight,
  Play,
  Image as ImageIcon,
  Loader2,
  ArrowLeft,
  Share2,
  ExternalLink,
  Copy
} from "lucide-react";
import { useSupportRequests } from "@/hooks/useSupportRequests";
import { useSupportComments } from '@/hooks/useSupportComments';

import { useProjects } from "@/hooks/useProjects";
import { useSupportPayment } from "@/hooks/useSupportPayment";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import { Profile } from '@/hooks/useProfile';
import { Wallet } from '@/hooks/useWallet';
import ShareableSupportLink from "@/components/ShareableSupportLink";

interface SupportPageProps {
  user: Profile;
  wallet: Wallet;
  onViewComments: (requestId: string) => void;
}

const SupportPage = ({ user, wallet, onViewComments }: SupportPageProps) => {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const { supportRequests, loading: supportLoading, createSupportRequest, refetchSupportRequests } = useSupportRequests();
  const { projects, loading: projectsLoading } = useProjects();
  const { supportRequest, loading: supportPaymentLoading } = useSupportPayment();
  const { addComment } = useSupportComments(selectedRequest);
  const { toast } = useToast();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [supportAmount, setSupportAmount] = useState("");
  const [formData, setFormData] = useState({
    project_id: "",
    title: "",
    description: "",
    amount_needed: ""
  });
  const [isCreating, setIsCreating] = useState(false);



  // Filter support requests to show only user's own requests
  const filteredSupportRequests = supportRequests.filter(request => 
    request.requester_id === user?.id
  );

  // Filter projects to show only user's own projects
  const userProjects = projects.filter(project => 
    project.admin_id === user?.id
  );

  const selectedSupportRequest = filteredSupportRequests.find(req => req.id === selectedRequest);

  const handleCopyLink = async (requestId: string, title: string) => {
    const shareableUrl = `https://appacus.hpcan.com.ng/support/${requestId}`;
    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast({
        title: "Link Copied!",
        description: `Support link for "${title}" has been copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleShareOnSocial = (platform: string, requestId: string, title: string, description: string, amountNeeded: number) => {
 const shareableUrl = `https://appacus.hpcan.com.ng/support/${requestId}`;
    const shareText = `Help support: ${title} - ${description.substring(0, 100)}... Amount needed: ₦${amountNeeded.toLocaleString()}`;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareableUrl);

    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
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

    setIsCreating(true);
    const { data, error } = await createSupportRequest({
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
        description: "Support request created successfully! Copy the link to share with supporters.",
      });
      setShowCreateDialog(false);
      setFormData({ project_id: "", title: "", description: "", amount_needed: "" });
    }
    setIsCreating(false);
  };



    const handleAddComment = async () => {
    if (!comment.trim() || !selectedRequest) return;

    const { error } = await addComment(comment);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } else {
      setComment("");
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      refetchSupportRequests();
    }
  };

  const handleSupportRequest = async () => {
    if (!selectedRequest || !supportAmount) return;

    const amount = parseFloat(supportAmount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const success = await supportRequest(selectedRequest, amount);
    if (success) {
      setSupportAmount("");
      setSelectedRequest(null);
    }
  };

  const renderProjectDetail = (request: any) => (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedRequest(null)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-purple-600">{request.title}</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleCopyLink(request.id, request.title)}
            className="text-purple-600 border-purple-600 hover:bg-purple-50"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleShareOnSocial('whatsapp', request.id, request.title, request.description, request.amount_needed)}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            Share WhatsApp
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={request.profiles?.avatar_url || undefined} />
            <AvatarFallback>
              {request.profiles?.first_name?.charAt(0) || 'U'}{request.profiles?.last_name?.charAt(0) || ''}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">
              {request.profiles?.first_name || 'Unknown'} {request.profiles?.last_name || ''}
            </h3>
            <p className="text-sm text-gray-600">{request.projects?.name || 'Unknown Project'}</p>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-8 mb-6 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Media content would appear here</p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold mb-2">Amount Needed</h4>
          <p className="text-2xl font-bold text-purple-600">₦{request.amount_needed.toLocaleString()}</p>
        </div>

        <p className="text-gray-700 mb-6">{request.description}</p>

        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Comments</h4>
          <Button variant="outline" onClick={() => onViewComments(request.id)} className="flex items-center gap-2">
            View Comments
            {request.comment_count > 0 && (
              <Badge className="bg-purple-100 text-purple-700">{request.comment_count}</Badge>
            )}
          </Button>
        </div>

        <div className="flex gap-3 mb-6">
          <Input
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
          />
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleAddComment}
            disabled={!comment.trim()}
          >
            Send
          </Button>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold mb-2">Support this request</h4>
          <p className="text-sm text-gray-600 mb-2">Your wallet balance: ₦{wallet?.balance.toLocaleString() || '0'}</p>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter amount"
              value={supportAmount}
              onChange={(e) => setSupportAmount(e.target.value)}
              className="flex-1"
            />
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleSupportRequest}
              disabled={supportPaymentLoading || !supportAmount}
            >
              {supportPaymentLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Support"}
            </Button>
          </div>
        </div>


      </Card>

      <ShareableSupportLink
        supportRequestId={request.id}
        title={request.title}
        description={request.description}
        amountNeeded={request.amount_needed}
        requesterName={`${request.profiles?.first_name || 'Unknown'} ${request.profiles?.last_name || ''}`}
      />
    </div>
  );

  if (selectedRequest && selectedSupportRequest) {
    return renderProjectDetail(selectedSupportRequest);
  }

  if (supportLoading) {
    return (
      <div className="flex justify-between items-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Support Requests</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Ask for Support
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Support Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project_id">Project</Label>
                <Select
                  value={formData.project_id}
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, project_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {userProjects.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Support request title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what you need support for"
                />
              </div>
              <div>
                <Label htmlFor="amount_needed">Amount Needed (NGN)</Label>
                <Input
                  id="amount_needed"
                  type="number"
                  value={formData.amount_needed}
                  onChange={e => setFormData(prev => ({ ...prev, amount_needed: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <Button
                onClick={handleCreateRequest}
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isCreating}
              >
                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filteredSupportRequests.length === 0 ? (
        <Card className="p-8 text-center">
          <Share2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Support Requests Yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first support request and share it with supporters!
          </p>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Create Support Request
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSupportRequests.map(request => (
            <Card key={request.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={request.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {request.profiles?.first_name?.charAt(0) || 'U'}
                      {request.profiles?.last_name?.charAt(0) || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.title}</h3>
                    <p className="text-sm text-gray-600">
                      By {request.profiles?.first_name || 'Unknown'} {request.profiles?.last_name || ''}
                    </p>
                    <p className="text-sm text-gray-500">
                      Project: {request.projects?.name || 'Unknown Project'}
                    </p>
                    <p className="text-lg font-bold text-purple-600 mt-1">
                      ₦{request.amount_needed.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Share buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(request.id, request.title)}
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareOnSocial('whatsapp', request.id, request.title, request.description, request.amount_needed)}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareOnSocial('twitter', request.id, request.title, request.description, request.amount_needed)}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  Twitter
                </Button>
              </div>
              
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => setSelectedRequest(request.id)}
              >
                View Details
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportPage;
