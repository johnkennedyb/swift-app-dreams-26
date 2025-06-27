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
import { useSupportComments } from "@/hooks/useSupportComments";
import { useProjects } from "@/hooks/useProjects";
import { useSupportPayment } from "@/hooks/useSupportPayment";
import { useWallet } from "@/hooks/useWallet";
import ShareableSupportLink from "../ShareableSupportLink";

const SupportPage = () => {
  const { supportRequests, loading: supportLoading, createSupportRequest } = useSupportRequests();
  const { projects, loading: projectsLoading } = useProjects();
  const { supportRequest, loading: supportPaymentLoading } = useSupportPayment();
  const { wallet } = useWallet();
  const { toast } = useToast();
  
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [supportAmount, setSupportAmount] = useState("");
  const [formData, setFormData] = useState({
    project_id: "",
    title: "",
    description: "",
    amount_needed: ""
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedShareRequest, setSelectedShareRequest] = useState<any>(null);

  const { comments, loading: commentsLoading, addComment } = useSupportComments(selectedRequest);

  const selectedSupportRequest = supportRequests.find(req => req.id === selectedRequest);

  // Function to copy link directly to clipboard
  const handleCopyLink = async (requestId: string, title: string) => {
    const shareableUrl = `${window.location.origin}/support/${requestId}`;
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
        description: "Support request created successfully! Share your link to get support.",
      });
      setShowCreateDialog(false);
      
      // Show sharing dialog with the created request data
      if (data) {
        const requestData = {
          id: data.id,
          title: formData.title,
          description: formData.description,
          amount_needed: parseFloat(formData.amount_needed),
          profiles: {
            first_name: "You",
            last_name: ""
          }
        };
        setSelectedShareRequest(requestData);
        setShowShareDialog(true);
      }
      
      setFormData({ project_id: "", title: "", description: "", amount_needed: "" });
    }
    setIsCreating(false);
  };

  const handleShareRequest = (request: any) => {
    setSelectedShareRequest(request);
    setShowShareDialog(true);
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedRequest(null)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-purple-600">{request.title}</h1>
        <Button 
          variant="outline" 
          onClick={() => handleShareRequest(request)}
          className="text-purple-600 border-purple-600 hover:bg-purple-50"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={request.profiles.avatar_url || undefined} />
            <AvatarFallback>
              {request.profiles.first_name.charAt(0)}{request.profiles.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">
              {request.profiles.first_name} {request.profiles.last_name}
            </h3>
            <p className="text-sm text-gray-600">{request.projects.name}</p>
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
              {supportPaymentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Support"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Comments</h3>
          
          {commentsLoading ? (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.profiles.avatar_url || undefined} />
                    <AvatarFallback>
                      {comment.profiles.first_name.charAt(0)}{comment.profiles.last_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm font-medium">
                        {comment.profiles.first_name} {comment.profiles.last_name}
                      </p>
                      <p className="text-sm">{comment.comment}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-3">
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
        </div>
      </Card>
    </div>
  );

  if (selectedRequest && selectedSupportRequest) {
    return renderProjectDetail(selectedSupportRequest);
  }

  if (supportLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
    {/* Header + Create Button */}
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <h1 className="text-2xl font-bold text-gray-900">Support Requests</h1>
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
                id="project_id"
                value={formData.project_id}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, project_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
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
              Create Request & Get Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  
    {/* Share Dialog */}
    <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-purple-600 flex items-center gap-2">
            <Share2 className="w-6 h-6" />
            Share Your Support Request
          </DialogTitle>
        </DialogHeader>
        {selectedShareRequest && (
          <ShareableSupportLink
            supportRequestId={selectedShareRequest.id}
            title={selectedShareRequest.title}
            description={selectedShareRequest.description}
            amountNeeded={selectedShareRequest.amount_needed}
            requesterName={
              `${selectedShareRequest.profiles.first_name} ${selectedShareRequest.profiles.last_name}`.trim() ||
              "You"
            }
          />
        )}
      </DialogContent>
    </Dialog>
  
    {/* Support Requests List */}
    {supportRequests.length === 0 ? (
      <Card className="p-8 text-center">
        <Share2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Support Requests Yet</h3>
        <p className="text-gray-500 mb-4">
          Create your first support request and get a shareable Paystack link!
        </p>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Create Support Request
        </Button>
      </Card>
    ) : (
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {supportRequests.map(request => (
          <Card key={request.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={request.profiles.avatar_url || undefined} />
                  <AvatarFallback>
                    {request.profiles.first_name.charAt(0)}
                    {request.profiles.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{request.title}</h3>
                  <p className="text-sm text-gray-600">
                    By {request.profiles.first_name} {request.profiles.last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Project: {request.projects.name}
                  </p>
                  <p className="text-lg font-bold text-purple-600 mt-1">
                    ₦{request.amount_needed.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  onClick={() => handleCopyLink(request.id, request.title)}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShareRequest(request)}
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setSelectedRequest(request.id)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )}
  </div>
  
  );
};

export default SupportPage;
