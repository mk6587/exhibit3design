import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, FileEdit, Users, Activity } from "lucide-react";
import { format } from "date-fns";

const ACTION_ICONS = {
  login: Activity,
  create: FileEdit,
  update: FileEdit,
  delete: Users,
  role_change: Shield,
};

const ACTION_COLORS = {
  login: "bg-blue-500",
  create: "bg-green-500",
  update: "bg-yellow-500",
  delete: "bg-red-500",
  role_change: "bg-purple-500",
};

export default function AdminActivityLogPage() {
  const { data: activityLogs, isLoading } = useQuery({
    queryKey: ['admin-activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select(`
          *,
          admin_agents(username, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Activity Log</h1>
          <p className="text-muted-foreground">
            Monitor all actions performed by admin agents
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Last 100 admin actions across the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading activity logs...
              </div>
            ) : activityLogs && activityLogs.length > 0 ? (
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {activityLogs.map((log: any) => {
                    const Icon = ACTION_ICONS[log.action_type as keyof typeof ACTION_ICONS] || Activity;
                    const color = ACTION_COLORS[log.action_type as keyof typeof ACTION_COLORS] || 'bg-gray-500';

                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${color} text-white flex-shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="font-medium">
                                {log.admin_agents?.username || 'System'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {log.admin_agents?.email || 'system@admin'}
                              </div>
                            </div>
                            <Badge variant="outline" className="flex-shrink-0">
                              {log.action_type}
                            </Badge>
                          </div>
                          
                          {log.resource_type && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Resource: </span>
                              <span className="font-medium">{log.resource_type}</span>
                              {log.resource_id && (
                                <span className="text-muted-foreground"> (ID: {log.resource_id.slice(0, 8)}...)</span>
                              )}
                            </div>
                          )}
                          
                          {log.action_details && Object.keys(log.action_details).length > 0 && (
                            <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                              {JSON.stringify(log.action_details, null, 2)}
                            </div>
                          )}
                          
                          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                            </span>
                            {log.ip_address && (
                              <span>IP: {log.ip_address}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No activity logs found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
