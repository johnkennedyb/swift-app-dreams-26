
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (user) {
      fetchSupportRequests();
    } else {
      setSupportRequests([]);
      setLoading(false);
    }
  }, [user]);

  const fetchSupportRequests = async () => {
    try {
      console.log('Fetching support requests for user:', user?.id);
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
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching support requests:', error);
        throw error;
      }
      
      console.log('Fetched support requests:', data);
      setSupportRequests(data || []);
    } catch (error) {
      console.error('Error fetching support requests:', error);
      setSupportRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const createSupportRequest = async (requestData: {
    project_id: string;
    title: string;
    description: string;
    amount_needed: number;
    media_url?: string;
  }) => {
    if (!user) {
      console.error('No user found');
      return { data: null, error: new Error('User not authenticated') };
    }

    try {
      console.log('Creating support request with data:', requestData);
      console.log('Current user ID:', user.id);

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
        console.error('Error creating support request:', error);
        throw error;
      }

      console.log('Support request created successfully:', data);
      fetchSupportRequests();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating support request:', error);
      return { data: null, error };
    }
  };

  return {
    supportRequests,
    loading,
    createSupportRequest,
    refetch: fetchSupportRequests,
  };
};
