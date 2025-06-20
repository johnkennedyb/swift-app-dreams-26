
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  admin_id: string;
  funding_goal: number;
  current_funding: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  project_members: Array<{
    id: string;
    user_id: string;
    joined_at: string;
  }>;
}

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_admin_id_fkey (
            first_name,
            last_name,
            avatar_url
          ),
          project_members (
            id,
            user_id,
            joined_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: {
    name: string;
    description: string;
    funding_goal: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            ...projectData,
            admin_id: user?.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Join the project as a member
      await supabase
        .from('project_members')
        .insert([
          {
            project_id: data.id,
            user_id: user?.id,
          }
        ]);

      fetchProjects();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating project:', error);
      return { data: null, error };
    }
  };

  const joinProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .insert([
          {
            project_id: projectId,
            user_id: user?.id,
          }
        ]);

      if (error) throw error;
      fetchProjects();
      return { error: null };
    } catch (error) {
      console.error('Error joining project:', error);
      return { error };
    }
  };

  return {
    projects,
    loading,
    createProject,
    joinProject,
    refetch: fetchProjects,
  };
};
