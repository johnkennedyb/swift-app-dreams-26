import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SupportRequest {
  id: string;
  project_id: string;
  requester_id: string;
  title: string;
  description: string;
  amount_needed: number;
  media_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  projects: {
    name: string;
  };
  comment_count: number;
}

export interface SupportComment {
  id: string;
  support_request_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

export const useSupportRequests = () => {
  const { user } = useAuth();
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSupportRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
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
          support_comments(count),
          projects (
            name
          )
        `)
        .eq('requester_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const processedData = data.map(request => ({
          ...request,
          comment_count: (request.support_comments as unknown as { count: number }[])[0]?.count || 0,
        }));
        setSupportRequests(processedData as SupportRequest[]);
      } else {
        setSupportRequests([]);
      }
    } catch (error) {
      console.error('Error fetching support requests:', error);
      setSupportRequests([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSupportRequests();
  }, [fetchSupportRequests]);

  const createSupportRequest = async (requestData: {
    project_id: string;
    title: string;
    description: string;
    amount_needed: number;
    media_url?: string;
  }) => {
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    try {
      const { data, error } = await supabase
        .from('support_requests')
        .insert([
          {
            ...requestData,
            requester_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      fetchSupportRequests();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    supportRequests,
    loading,
    createSupportRequest,
    refetchSupportRequests: fetchSupportRequests,
  };
};
