
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useSupportPayments } from "@/hooks/useSupportPayments";
import { 
  Heart, 
  Users, 
  Target, 
  Share2, 
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SupportRequest {
  id: string;
  project_id: string;
  requester_id: string;
  title: string;
  description: string;
  amount_needed: number;
  media_url: string | null;
  status: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  projects: {
    name: string;
    current_funding: number;
    funding_goal: number;
  };
}

const PublicSupportPage = () => {
  const { supportId } = useParams<{ supportId: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [supportRequest, setSupportRequest] = useState<SupportRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [donorInfo, setDonorInfo] = useState({
    name: "",
    email: "",
    amount: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { payments, totalAmount, verifyPayment } = useSupportPayments(supportId);

  useEffect(() => {
    if (supportId) {
      fetchSupportRequest();
    }
    
    // Check if this is a payment callback
    const reference = searchParams.get('reference');
    const donorName = searchParams.get('donor_name');
    const donorEmail = searchParams.get('donor_email');
    
    if (reference && donorName && donorEmail && supportId) {
      handlePaymentCallback(reference, donorName, donorEmail);
    }
  }, [supportId, searchParams]);

  const fetchSupportRequest = async () => {
    if (!supportId) return;
    
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
            name,
            current_funding,
            funding_goal
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
        description: "Support request not found",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCallback = async (reference: string, donorName: string, donorEmail: string) => {
    if (!supportId) return;
    
    setIsProcessing(true);
    try {
      await verifyPayment(reference, supportId, donorName, donorEmail);
      setPaymentSuccess(true);
      toast({
        title: "Payment Successful!",
        description: "Thank you for your support. The project has been updated.",
      });
      
      // Refresh the support request to show updated funding
      await fetchSupportRequest();
    } catch (error) {
      console.error('Payment verification failed:', error);
      toast({
        title: "Payment Verification Failed",
        description: "Please contact support if you were charged.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSupportPayment = async () => {
    if (!supportRequest || !donorInfo.name || !donorInfo.email || !donorInfo.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(donorInfo.amount);
    if (amount < 50) {
      toast({
        title: "Minimum Amount",
        description: "Minimum support amount is ₦50",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Initialize payment with Paystack via edge function
      const { data, error } = await supabase.functions.invoke('initialize-paystack-payment', {
        body: {
          email: donorInfo.email,
          amount: amount * 100, // Convert to kobo
          currency: 'NGN',
          reference: `SUPPORT_${supportRequest.id}_${Date.now()}`,
          callback_url: `${window.location.origin}/support/${supportRequest.id}?reference=SUPPORT_${supportRequest.id}_${Date.now()}&donor_name=${encodeURIComponent(donorInfo.name)}&donor_email=${encodeURIComponent(donorInfo.email)}`,
          metadata: {
            support_request_id: supportRequest.id,
            donor_name: donorInfo.name,
            donor_email: donorInfo.email,
            type: 'support_payment'
          }
        }
      });

      if (error) throw error;

      if (data?.data?.authorization_url) {
        // Redirect to Paystack checkout
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!supportRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Support Request Not Found</h2>
            <p className="text-gray-600">This support request may have been removed or the link is invalid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-4">Your support has been successfully processed.</p>
            <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
              View Updated Project
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fundingProgress = (totalAmount / supportRequest.amount_needed) * 100;
  const remainingAmount = Math.max(0, supportRequest.amount_needed - totalAmount);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support This Request</h1>
          <p className="text-gray-600">Help make a difference in this project</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={supportRequest.profiles.avatar_url || undefined} />
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      {supportRequest.profiles.first_name.charAt(0)}{supportRequest.profiles.last_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{supportRequest.title}</CardTitle>
                    <p className="text-gray-600">
                      by {supportRequest.profiles.first_name} {supportRequest.profiles.last_name}
                    </p>
                    <p className="text-sm text-gray-500">Project: {supportRequest.projects.name}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">{supportRequest.description}</p>
                
                {/* Funding Progress */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">{fundingProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={fundingProgress} className="h-3" />
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-green-600">₦{totalAmount.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Raised</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600">₦{supportRequest.amount_needed.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Goal</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-orange-600">₦{remainingAmount.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Remaining</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Supporters */}
            {payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Recent Supporters ({payments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Heart className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{payment.donor_name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(payment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-green-600">₦{payment.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Support Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Make a Donation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="donor_name">Your Name *</Label>
                  <Input
                    id="donor_name"
                    value={donorInfo.name}
                    onChange={(e) => setDonorInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="donor_email">Email Address *</Label>
                  <Input
                    id="donor_email"
                    type="email"
                    value={donorInfo.email}
                    onChange={(e) => setDonorInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="amount">Amount (NGN) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={donorInfo.amount}
                    onChange={(e) => setDonorInfo(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Minimum ₦50"
                    min="50"
                  />
                </div>
                
                <Button 
                  onClick={handleSupportPayment}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
                  disabled={isProcessing || !donorInfo.name || !donorInfo.email || !donorInfo.amount}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Support Now
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Your payment is processed securely through Paystack
                </p>
                
                <div className="flex items-center justify-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicSupportPage;
