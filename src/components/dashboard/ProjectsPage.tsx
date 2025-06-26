
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Users, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Filter,
  Search,
  Loader2
} from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useTransactions } from "@/hooks/useTransactions";
import { useAuth } from "@/hooks/useAuth";

const ProjectsPage = () => {
  const { projects, loading: projectsLoading, createProject, joinProject } = useProjects();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    funding_goal: ""
  });
  const [isCreating, setIsCreating] = useState(false);

  const filters = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "my-projects", label: "My Projects" }
  ];

  const filteredProjects = projects.filter(project => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return project.status === "active";
    if (activeFilter === "completed") return project.status === "completed";
    if (activeFilter === "my-projects") return project.admin_id === user?.id;
    return true;
  });

  const totalFunded = projects.reduce((sum, project) => sum + project.current_funding, 0);
  const activeProjectsCount = projects.filter(p => p.status === "active").length;

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

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
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
                <Label htmlFor="name">Project Name</Label>
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
                />
              </div>
              <div>
                <Label htmlFor="funding_goal">Funding Goal (NGN)</Label>
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
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Project Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Funded</p>
              <p className="text-xl font-bold">₦{totalFunded.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-xl font-bold">{activeProjectsCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Projects</p>
              <p className="text-xl font-bold">{projects.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter.id)}
            className={activeFilter === filter.id ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">
              {activeFilter === "my-projects" 
                ? "You haven't created any projects yet" 
                : "No projects found"}
            </p>
            {activeFilter === "my-projects" && (
              <p className="text-sm text-gray-400 mt-2">
                Create a new project to get started
              </p>
            )}
          </Card>
        ) : (
          filteredProjects.map((project) => {
            const progress = project.funding_goal > 0 ? (project.current_funding / project.funding_goal) * 100 : 0;
            const isProjectAdmin = project.admin_id === user?.id;
            
            return (
              <Card key={project.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={project.profiles.avatar_url || undefined} />
                      <AvatarFallback>
                        {project.profiles.first_name.charAt(0)}{project.profiles.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600">
                        By {project.profiles.first_name} {project.profiles.last_name}
                        {isProjectAdmin && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Admin
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge variant={project.status === "completed" ? "default" : "secondary"}>
                    {project.status}
                  </Badge>
                </div>
                
                {project.description && (
                  <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Current Funding</p>
                    <p className="font-semibold">₦{project.current_funding.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Goal</p>
                    <p className="font-semibold">₦{project.funding_goal.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {project.project_members.length} members
                  </span>
                  {!isProjectAdmin && (
                    <Button 
                      size="sm" 
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleJoinProject(project.id)}
                    >
                      Support
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Recent Transactions */}
      {!transactionsLoading && transactions.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">
                      {transaction.type === 'credit' ? '+' : '-'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.description || 
                       (transaction.projects?.name || 
                        (transaction.recipient_profile ? 
                         `${transaction.recipient_profile.first_name} ${transaction.recipient_profile.last_name}` : 
                         'Transaction'))}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProjectsPage;
