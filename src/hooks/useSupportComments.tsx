
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { SupportComment } from './useSupportRequests';

export const useSupportComments = (supportRequestId: string | null) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<SupportComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supportRequestId && user) {
      fetchComments();
    } else {
      setComments([]);
      setLoading(false);
    }
  }, [supportRequestId, user]);

  const fetchComments = async () => {
    if (!supportRequestId) return;

    try {
      const { data, error } = await supabase
        .from('support_comments')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('support_request_id', supportRequestId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (comment: string) => {
    if (!supportRequestId) return { error: 'No support request ID' };

    try {
      const { error } = await supabase
        .from('support_comments')
        .insert([
          {
            support_request_id: supportRequestId,
            user_id: user?.id,
            comment,
          }
        ]);

      if (error) throw error;
      fetchComments();
      return { error: null };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { error };
    }
  };

  return {
    comments,
    loading,
    addComment,
    refetch: fetchComments,
  };
};
