
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Users, 
  Target, 
  TrendingUp, 
  Calendar,
  Share2,
  Heart,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Project {
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
    profiles: {
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    } | null;
  }>;
}

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
}

const ProjectDetailPage = ({ projectId, onBack }: ProjectDetailPageProps) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjectDetails();
    
    // Set up real-time subscription for project updates
    const channel = supabase
      .channel('project-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`
        },
        (payload) => {
          console.log('Project updated:', payload);
          fetchProjectDetails(); // Refresh project data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const fetchProjectDetails = async () => {
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
            joined_at,
            profiles!project_members_user_id_fkey (
              first_name,
              last_name,
              avatar_url
            )
          )
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Project not found</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const fundingProgress = (project.current_funding / project.funding_goal) * 100;
  const remainingAmount = Math.max(0, project.funding_goal - project.current_funding);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={project.profiles.avatar_url || undefined} />
                <AvatarFallback className="bg-purple-100 text-purple-600 text-lg">
                  {project.profiles.first_name.charAt(0)}{project.profiles.last_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{project.name}</CardTitle>
                <p className="text-gray-600">
                  by {project.profiles.first_name} {project.profiles.last_name}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Funding Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Funding Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{fundingProgress.toFixed(1)}%</span>
            </div>
            <Progress value={fundingProgress} className="h-3" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                ₦{project.current_funding.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Raised</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                ₦{project.funding_goal.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Goal</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                ₦{remainingAmount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle>About This Project</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Project Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Project Members ({project.project_members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.project_members.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar>
                  <AvatarImage src={member.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {member.profiles ? 
                      `${member.profiles.first_name.charAt(0)}${member.profiles.last_name.charAt(0)}` : 
                      'UN'
                    }
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {member.profiles ? 
                      `${member.profiles.first_name} ${member.profiles.last_name}` : 
                      'Unknown User'
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-xl font-bold">{fundingProgress.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Funded</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-xl font-bold">{project.project_members.length}</p>
            <p className="text-sm text-gray-600">Members</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-xl font-bold">
              {Math.ceil((new Date().getTime() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24))}
            </p>
            <p className="text-sm text-gray-600">Days Active</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
