import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/hooks/useProjects";

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
}

const ProjectDetailPage = ({ projectId, onBack }: ProjectDetailPageProps) => {
  const [project, setProject] = useState<Project | null>(null);
  const [supporters, setSupporters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchProject = async () => {
    setLoading(true);
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
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error: any) {
      console.error('Error fetching project:', error);
      setError(error.message || 'Failed to load project details.');
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSupporters = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles!transactions_user_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('project_id', projectId)
        .eq('type', 'debit')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSupporters(data || []);
    } catch (error) {
      console.error('Error fetching supporters:', error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchSupporters();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-lg font-semibold text-red-500 mb-2">Error</h2>
        <p className="text-gray-600">{error || 'Project not found.'}</p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const progress = project.funding_goal > 0 ? (project.current_funding / project.funding_goal) * 100 : 0;
  const remainingAmount = Math.max(0, project.funding_goal - project.current_funding);
  const totalSupported = supporters.reduce((sum, supporter) => sum + supporter.amount, 0);

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <Button onClick={onBack} variant="ghost">
        ← Back to Projects
      </Button>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-2xl font-bold">{project.name}</CardTitle>
          <Badge variant={project.status === "completed" ? "default" : "secondary"}>
            {project.status}
          </Badge>
        </CardHeader>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={project.profiles.avatar_url || undefined} />
                  <AvatarFallback className="text-lg font-semibold">
                    {project.profiles.first_name.charAt(0)}{project.profiles.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {project.profiles.first_name} {project.profiles.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">Project Admin</p>
                </div>
              </div>

              <p className="text-gray-700">{project.description || 'No description provided.'}</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500">Funding Progress</p>
                  <p className="font-medium">{Math.round(progress)}%</p>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Raised</p>
                    <p className="font-semibold text-green-600">₦{project.current_funding.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Goal</p>
                    <p className="font-semibold">₦{project.funding_goal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Remaining</p>
                    <p className="font-semibold text-orange-600">₦{remainingAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Members</p>
                    <p className="font-semibold">{project.project_members.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Supporters Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Top Supporters</h4>
              {supporters.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No supporters yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {supporters.map((supporter) => (
                    <div key={supporter.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={supporter.profiles?.avatar_url || undefined} />
                          <AvatarFallback>
                            {supporter.profiles?.first_name?.charAt(0)}
                            {supporter.profiles?.last_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {supporter.profiles?.first_name} {supporter.profiles?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            <Calendar className="w-3 h-3 inline-block mr-1" />
                            {new Date(supporter.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="font-semibold text-green-600">
                        ₦{supporter.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Supported: ₦{totalSupported.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetailPage;
