import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, UserCog, FileEdit, Users, UserPlus, Edit } from "lucide-react";
import { CreateAdminAgentDialog } from "./CreateAdminAgentDialog";
import { EditAdminAgentDialog } from "./EditAdminAgentDialog";

const ROLE_DESCRIPTIONS = {
  super_admin: {
    label: "Super Admin",
    description: "Full access to all features and settings",
    icon: Shield,
    color: "bg-red-500"
  },
  content_creator: {
    label: "Content Creator",
    description: "Can manage products and design files only",
    icon: FileEdit,
    color: "bg-blue-500"
  },
  operator: {
    label: "Operator",
    description: "Can manage users, tokens, and activities",
    icon: Users,
    color: "bg-green-500"
  }
};

export function RoleManagement() {
  const { hasPermission } = useAdmin();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  // Fetch all admin agents with their roles
  const { data: adminUsers, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_agents')
        .select(`
          id,
          username,
          email,
          is_active,
          last_login
        `)
        .order('username');

      if (error) throw error;

      // Fetch roles for each agent
      const agentsWithRoles = await Promise.all(
        (data || []).map(async (agent) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('admin_agent_id', agent.id)
            .maybeSingle();

          return {
            ...agent,
            user_roles: roleData ? [roleData] : []
          };
        })
      );

      return agentsWithRoles;
    },
    enabled: hasPermission('super_admin')
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ agentId, role }: { agentId: string; role: 'super_admin' | 'content_creator' | 'operator' }) => {
      // First, delete existing role
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('admin_agent_id', agentId);

      if (deleteError) throw deleteError;

      // Then insert new role - explicitly type to handle nullable user_id
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([{ 
          admin_agent_id: agentId, 
          role,
          user_id: null as any // TypeScript workaround until types regenerate
        }]);

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Role updated successfully');
      setSelectedUser(null);
      setNewRole("");
    },
    onError: (error) => {
      toast.error(`Failed to update role: ${error.message}`);
    }
  });

  if (!hasPermission('super_admin')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>Access Denied</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Only Super Admins can manage user roles.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Role Management
              </CardTitle>
              <CardDescription>
                Manage admin roles and permissions
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Admin Agent
            </Button>
          </div>
        </CardHeader>
      </Card>

      <CreateAdminAgentDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
      />

      {selectedAgent && (
        <EditAdminAgentDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          agent={{
            id: selectedAgent.id,
            username: selectedAgent.username,
            email: selectedAgent.email,
            role: selectedAgent.user_roles?.[0]?.role || 'operator',
            is_active: selectedAgent.is_active
          }}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
        />
      )}

      {/* Role Descriptions */}
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(ROLE_DESCRIPTIONS).map(([key, role]) => {
          const Icon = role.icon;
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className={`p-2 rounded-lg ${role.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {role.label}
                </CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Admin Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>View and manage admin user roles</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading admin users...
            </div>
          ) : adminUsers && adminUsers.length > 0 ? (
            <div className="space-y-4">
              {adminUsers.map((agent: any) => {
                const role = agent.user_roles?.[0]?.role || 'user';
                const roleInfo = ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS];
                const Icon = roleInfo?.icon || UserCog;

                return (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${roleInfo?.color || 'bg-gray-500'} text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{agent.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {agent.email}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Role: {roleInfo?.label || 'No role assigned'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant={agent.is_active ? "default" : "secondary"}>
                        {agent.is_active ? "Active" : "Inactive"}
                      </Badge>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAgent(agent);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      
                      {selectedUser === agent.id ? (
                        <div className="flex items-center gap-2">
                          <Select value={newRole} onValueChange={setNewRole}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ROLE_DESCRIPTIONS).map(([key, role]) => (
                                <SelectItem key={key} value={key}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (newRole) {
                                updateRoleMutation.mutate({
                                  agentId: agent.id,
                                  role: newRole as 'super_admin' | 'content_creator' | 'operator'
                                });
                              }
                            }}
                            disabled={!newRole || updateRoleMutation.isPending}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedUser(null);
                              setNewRole("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(agent.id);
                            setNewRole(role);
                          }}
                        >
                          Change Role
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No admin users found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
