
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2, ExternalLink } from "lucide-react";

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

  // Generate the shareable link
  const shareableUrl = `${window.location.origin}/support/${supportRequestId}`;

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

        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Preview:</strong> Help support "{title}" by {requesterName}. 
            Amount needed: ₦{amountNeeded.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareableSupportLink;
