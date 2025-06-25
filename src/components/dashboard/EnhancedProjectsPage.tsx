
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Users, 
  DollarSign, 
  TrendingUp,
  Search,
  Eye,
  Loader2,
  Target,
  Calendar
} from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import ProjectDetailPage from "./ProjectDetailPage";

const EnhancedProjectsPage = () => {
  const { projects, loading: projectsLoading, createProject, joinProject } = useProjects();
  const { toast } = useToast();
  
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    funding_goal: ""
  });
  const [isCreating, setIsCreating] = useState(false);

  const filters = [
    { id: "all", label: "All Projects", count: projects.length },
    { id: "active", label: "Active", count: projects.filter(p => p.status === "active").length },
    { id: "completed", label: "Completed", count: projects.filter(p => p.status === "completed").length },
  ];

  const filteredProjects = projects.filter(project => {
    const matchesFilter = activeFilter === "all" || project.status === activeFilter;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.profiles ? `${project.profiles.first_name} ${project.profiles.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    return matchesFilter && matchesSearch;
  });

  const totalFunded = projects.reduce((sum, project) => sum + project.current_funding, 0);
  const activeProjectsCount = projects.filter(p => p.status === "active").length;
  const avgProgress = projects.length > 0 
    ? projects.reduce((sum, project) => sum + (project.current_funding / project.funding_goal * 100), 0) / projects.length 
    : 0;

  const handleCreateProject = async () => {
    if (!formData.name || !formData.funding_goal) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    const { error } = await createProject({
      name: formData.name,
      description: formData.description,
      funding_goal: parseFloat(formData.funding_goal),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      setShowCreateDialog(false);
      setFormData({ name: "", description: "", funding_goal: "" });
    }
    setIsCreating(false);
  };

  const handleJoinProject = async (projectId: string) => {
    const { error } = await joinProject(projectId);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to join project",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Successfully joined project",
      });
    }
  };

  if (selectedProjectId) {
    return (
      <ProjectDetailPage 
        projectId={selectedProjectId} 
        onBack={() => setSelectedProjectId(null)} 
      />
    );
  }

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Discover and support amazing projects</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="funding_goal">Funding Goal (NGN) *</Label>
                <Input
                  id="funding_goal"
                  type="number"
                  value={formData.funding_goal}
                  onChange={(e) => setFormData(prev => ({ ...prev, funding_goal: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <Button 
                onClick={handleCreateProject} 
                className="w-full bg-purple-600 hover:bg-purple-700 font-semibold py-3"
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Funded</p>
                <p className="text-2xl font-bold text-gray-900">₦{totalFunded.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{activeProjectsCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(avgProgress)}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`${activeFilter === filter.id ? "bg-purple-600 hover:bg-purple-700" : ""} whitespace-nowrap`}
                >
                  {filter.label} ({filter.count})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "No projects match your search criteria." : "Be the first to create a project and start your funding journey."}
                </p>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const progress = project.funding_goal > 0 ? (project.current_funding / project.funding_goal) * 100 : 0;
            const profileData = project.profiles;
            
            return (
              <Card key={project.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={profileData?.avatar_url || undefined} />
                      <AvatarFallback className="text-lg font-semibold">
                        {profileData ? 
                          `${profileData.first_name.charAt(0)}${profileData.last_name.charAt(0)}` : 
                          'UN'
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        by {profileData ? 
                          `${profileData.first_name} ${profileData.last_name}` : 
                          'Unknown User'
                        }
                      </p>
                    </div>
                    <Badge variant={project.status === "completed" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Raised</p>
                        <p className="font-semibold text-green-600">₦{project.current_funding.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Goal</p>
                        <p className="font-semibold">₦{project.funding_goal.toLocaleString()}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{project.project_members.length} members</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedProjectId(project.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleJoinProject(project.id)}
                        >
                          Support
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EnhancedProjectsPage;
