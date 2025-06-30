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
      console.log('Fetching projects for user:', user?.id);
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
        .eq('admin_id', user?.id) // Only fetch projects created by current user
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }
      
      console.log('Fetched projects:', data);
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: {
    name: string;
    description: string;
    funding_goal: number;
  }) => {
    if (!user) {
      console.error('No user found');
      return { data: null, error: new Error('User not authenticated') };
    }

    try {
      console.log('Creating project with data:', projectData);
      console.log('Current user ID:', user.id);

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            ...projectData,
            admin_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }

      console.log('Project created successfully:', data);

      // Automatically join the project as a member
      const { error: memberError } = await supabase
        .from('project_members')
        .insert([
          {
            project_id: data.id,
            user_id: user.id,
          }
        ]);

      if (memberError) {
        console.error('Error joining project as member:', memberError);
        // Don't throw here as the project was created successfully
      }

      fetchProjects();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating project:', error);
      return { data: null, error };
    }
  };

  const joinProject = async (projectId: string) => {
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    try {
      console.log('Joining project:', projectId, 'as user:', user.id);

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        console.log('User is already a member of this project');
        return { error: new Error('Already a member of this project') };
      }

      const { error } = await supabase
        .from('project_members')
        .insert([
          {
            project_id: projectId,
            user_id: user.id,
          }
        ]);

      if (error) {
        console.error('Error joining project:', error);
        throw error;
      }

      console.log('Successfully joined project');
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
