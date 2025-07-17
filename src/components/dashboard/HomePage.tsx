import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Profile } from "@/hooks/useProfile";
import { useProjects } from "@/hooks/useProjects";
import { useTransactions } from "@/hooks/useTransactions";
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface HomePageProps {
  user: Profile;
  onNavigate: (tab: string) => void;
}

const HomePage = ({ user, onNavigate }: HomePageProps) => {
    const { projects } = useProjects();
  const { transactions, loading: transactionsLoading } = useTransactions();

  // Filter for active projects to display
    const activeProjects = projects.filter(p => p.status === "active").slice(0, 5);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 pb-20 px-4 lg:px-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">Group financial contribution made easy.</h1>
            <Button
              onClick={() => onNavigate("support")}
              className="mt-4 bg-white text-purple-600 font-semibold px-6 hover:bg-purple-50"
            >
              Ask for Support
            </Button>
          </div>
        </div>

        {/* Ongoing Support Requests */}
        <Card className="p-4 lg:p-6">
          <h2 className="text-lg font-semibold mb-4">Ongoing Support Requests</h2>
          {activeProjects.length === 0 ? (
            <p className="text-gray-500">No active requests yet.</p>
          ) : (
            <div className="space-y-3">
              {activeProjects.map(project => (
                <div key={project.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{project.name}</p>
                    <p className="text-xs text-gray-500 truncate">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-2 sm:mt-0 sm:ml-4 shrink-0">
                    <span className="text-xs text-gray-600">{project.comments_count || 0} Comments</span>
                    <span className="text-xs text-gray-600">{project.project_members.length} Comply</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-4 lg:p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {transactionsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading transactions...</div>
          ) : recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {transaction.type === 'credit' ? 
                        <ArrowDownRight className="w-5 h-5 text-green-600" /> : 
                        <ArrowUpRight className="w-5 h-5 text-purple-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description || 'Transaction'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className={`font-semibold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-purple-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-gray-400" />
              </div>
              <p>No transactions yet</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
