
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Heart, 
  Users, 
  Calendar,
  ArrowRight,
  Play,
  Image as ImageIcon
} from "lucide-react";

const SupportPage = () => {
  const [comment, setComment] = useState("");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const supportProjects = [
    {
      id: "alpha",
      name: "Project Alpha",
      members: 12,
      date: "Mar 22, 2025",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      description: "Educational initiative for underprivileged children",
      fundingGoal: 50000,
      currentFunding: 32500
    },
    {
      id: "beta",
      name: "Project Beta",
      members: 8,
      date: "Mar 20, 2025",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b4c0?w=150&h=150&fit=crop&crop=face",
      description: "Clean water access for rural communities",
      fundingGoal: 75000,
      currentFunding: 45000
    },
  ];

  const recentSupport = [
    {
      id: 1,
      project: "Project Alpha",
      amount: 250,
      date: "2 hours ago",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const renderProjectDetail = (project: any) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedProject(null)}>
          ← Back
        </Button>
        <h1 className="text-xl font-bold text-purple-600">{project.name}</h1>
        <div></div>
      </div>

      <Card className="p-6">
        <div className="bg-gray-100 rounded-lg p-8 mb-6 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">[Video, Audio or Image Here]</p>
          </div>
        </div>

        <p className="text-gray-700 mb-6">
          This is the reason for the contribution. Watch, read, or listen to the story behind the request.
        </p>

        <div className="flex flex-wrap gap-3 mb-6">
          <Button className="bg-purple-600 hover:bg-purple-700 flex-1">
            Support
          </Button>
          <Button variant="outline" className="flex-1">
            Decline
          </Button>
          <Button variant="outline" className="flex-1">
            Message
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Comments</h3>
          <div className="flex gap-3">
            <Input
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1"
            />
            <Button className="bg-purple-600 hover:bg-purple-700">
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  if (selectedProject) {
    const project = supportProjects.find(p => p.id === selectedProject);
    return project ? renderProjectDetail(project) : null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Support Projects</h1>
        <Button className="bg-purple-600 hover:bg-purple-700">
          Ask for Support
        </Button>
      </div>

      {/* Available Projects */}
      <div className="space-y-4">
        {supportProjects.map((project) => (
          <Card key={project.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={project.avatar} />
                  <AvatarFallback>{project.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Members: {project.members}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {project.date}
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setSelectedProject(project.id)}
              >
                Support
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Support */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Your most recent support</h2>
        {recentSupport.map((support) => (
          <Card key={support.id} className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={support.avatar} />
                <AvatarFallback>PA</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">Supported {support.project}</h3>
                <p className="text-gray-600">${support.amount} • {support.date}</p>
              </div>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SupportPage;
