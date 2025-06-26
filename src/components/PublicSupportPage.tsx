
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { initializePayment, openPaystackPayment } from "@/services/paystackService";

interface SupportRequestDetails {
  id: string;
  title: string;
  description: string;
  amount_needed: number;
  status: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  projects: {
    name: string;
  };
}

const PublicSupportPage = () => {
  const { supportId } = useParams<{ supportId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [supportRequest, setSupportRequest] = useState<SupportRequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [supportAmount, setSupportAmount] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorName, setDonorName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (supportId) {
      fetchSupportRequest();
    }
  }, [supportId]);

  const fetchSupportRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('support_requests')
        .select(`
          *,
          profiles!support_requests_requester_id_fkey (
            first_name,
            last_name,
            avatar_url
          ),
          projects (
            name
          )
        `)
        .eq('id', supportId)
        .single();

      if (error) throw error;
      setSupportRequest(data);
    } catch (error) {
      console.error('Error fetching support request:', error);
      toast({
        title: "Error",
        description: "Could not load support request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSupportPayment = async () => {
    if (!supportRequest || !supportAmount || !donorEmail || !donorName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(supportAmount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const reference = `SUPPORT_${supportRequest.id}_${Date.now()}`;
      
      const paymentResponse = await initializePayment({
        email: donorEmail,
        amount,
        currency: 'NGN',
        reference,
        metadata: {
          support_request_id: supportRequest.id,
          donor_name: donorName,
          donor_email: donorEmail,
          purpose: 'support_donation',
        },
      });

      if (!paymentResponse.status) {
        throw new Error(paymentResponse.message || "Payment initialization failed");
      }

      if (paymentResponse.data?.authorization_url) {
        openPaystackPayment(paymentResponse.data.authorization_url);
        
        toast({
          title: "Payment Initialized",
          description: "Complete your payment in the new window",
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!supportRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Support Request Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The support request you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={supportRequest.profiles.avatar_url || undefined} />
                <AvatarFallback className="bg-purple-100 text-purple-600 text-lg">
                  {supportRequest.profiles.first_name.charAt(0)}
                  {supportRequest.profiles.last_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {supportRequest.title}
                </h1>
                <p className="text-gray-600">
                  by {supportRequest.profiles.first_name} {supportRequest.profiles.last_name}
                </p>
                <p className="text-sm text-gray-500">
                  Project: {supportRequest.projects.name}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="w-fit">
              {supportRequest.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Amount Needed</h3>
              <p className="text-3xl font-bold text-purple-600">
                ₦{supportRequest.amount_needed.toLocaleString()}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {supportRequest.description}
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Support This Request
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <Input
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email *
                    </label>
                    <Input
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Support Amount (NGN) *
                  </label>
                  <Input
                    type="number"
                    value={supportAmount}
                    onChange={(e) => setSupportAmount(e.target.value)}
                    placeholder="Enter amount to support"
                  />
                </div>

                <Button 
                  onClick={handleSupportPayment}
                  disabled={isProcessing || !supportAmount || !donorEmail || !donorName}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Heart className="w-5 h-5 mr-2" />
                  )}
                  Send Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicSupportPage;
