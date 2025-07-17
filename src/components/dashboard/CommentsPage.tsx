import { useState } from 'react';
import { useSupportComments } from '@/hooks/useSupportComments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CommentsPageProps {
  supportRequestId: string;
  onBack: () => void;
}

const CommentsPage = ({ supportRequestId, onBack }: CommentsPageProps) => {
  const { comments, loading: commentsLoading, addComment } = useSupportComments(supportRequestId);
  const [newComment, setNewComment] = useState('');
  const { toast } = useToast();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const { error } = await addComment(newComment);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    } else {
      setNewComment('');
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 pb-24 lg:pb-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">Comments</h1>
      </div>

      <div className="space-y-4">
        {commentsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No comments yet.</p>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {comment.profiles?.first_name?.charAt(0) || 'U'}
                    {comment.profiles?.last_name?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900">
                      {comment.profiles?.first_name || 'Unknown'} {comment.profiles?.last_name || ''}
                    </p>
                    <p className="text-sm text-gray-700">{comment.comment}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 sticky bottom-0 bg-white py-4">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1"
          onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
        />
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={handleAddComment}
          disabled={!newComment.trim() || commentsLoading}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default CommentsPage;
