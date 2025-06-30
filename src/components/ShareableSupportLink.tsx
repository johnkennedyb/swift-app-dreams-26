
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2, ExternalLink, Users, Eye, TrendingUp } from "lucide-react";
import { useSupportPayments } from "@/hooks/useSupportPayments";

interface ShareableSupportLinkProps {
  supportRequestId: string;
  title: string;
  description: string;
  amountNeeded: number;
  requesterName: string;
}

const ShareableSupportLink = ({ 
  supportRequestId, 
  title, 
  description, 
  amountNeeded, 
  requesterName 
}: ShareableSupportLinkProps) => {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  const { payments, loading: paymentsLoading, totalAmount } = useSupportPayments(supportRequestId);

  // Generate the shareable link
const shareableUrl = `https://appacus3.onrender.com/support/${supportRequestId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast({
        title: "Link Copied!",
        description: "Support request link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleShareOnSocial = (platform: string) => {
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

  const handleNativeShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Support Request: ${title}`,
          text: `Help support: ${description}`,
          url: shareableUrl,
        });
      } else {
        handleCopyLink();
      }
    } catch (error) {
      console.log('Share cancelled or failed');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share Your Support Request
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics */}
        {totalAmount > 0 && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Total Raised</span>
              </div>
              <p className="text-lg font-bold text-green-800">₦{totalAmount.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Supporters</span>
              </div>
              <p className="text-lg font-bold text-green-800">{payments.length}</p>
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Shareable Link
          </label>
          <div className="flex gap-2">
            <Input 
              value={shareableUrl} 
              readOnly 
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopyLink}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(shareableUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Share on Social Media
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShareOnSocial('whatsapp')}
              className="bg-green-50 hover:bg-green-100 text-green-700"
            >
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShareOnSocial('twitter')}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700"
            >
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShareOnSocial('facebook')}
              className="bg-blue-50 hover:bg-blue-100 text-blue-800"
            >
              Facebook
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShareOnSocial('telegram')}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600"
            >
              Telegram
            </Button>
            {navigator.share && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNativeShare}
                disabled={isSharing}
              >
                More Options
              </Button>
            )}
          </div>
        </div>

        {/* Payments Table */}
        {payments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Recent Supporters
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPayments(!showPayments)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPayments ? 'Hide' : 'View All'}
              </Button>
            </div>
            
            {showPayments && (
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium">Supporter</th>
                        <th className="text-left p-3 font-medium">Amount</th>
                        <th className="text-left p-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-t">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{payment.donor_name}</p>
                              <p className="text-xs text-gray-500">{payment.donor_email}</p>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-green-600">
                            ₦{Number(payment.amount).toLocaleString()}
                          </td>
                          <td className="p-3 text-gray-600">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Preview:</strong> Help support "{title}" by {requesterName}. 
            Amount needed: ₦{amountNeeded.toLocaleString()}
            {totalAmount > 0 && (
              <span className="text-green-600 font-medium">
                {' '}• ₦{totalAmount.toLocaleString()} raised so far
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareableSupportLink;
