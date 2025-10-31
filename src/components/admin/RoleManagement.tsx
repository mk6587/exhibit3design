import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, UserCog, FileEdit, Users } from "lucide-react";

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

  // Fetch all admin users with their roles
  const { data: adminUsers, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admins')
        .select(`
          id,
          user_id,
          username,
          email,
          is_active,
          last_login,
          user_roles!inner(role)
        `)
        .order('username');

      if (error) throw error;
      return data;
    },
    enabled: hasPermission('super_admin')
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'super_admin' | 'content_creator' | 'operator' }) => {
      // First, delete existing role
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Then insert new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role }]);

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
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Role Management
          </CardTitle>
          <CardDescription>
            Manage admin roles and permissions
          </CardDescription>
        </CardHeader>
      </Card>

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
              {adminUsers.map((admin: any) => {
                const role = admin.user_roles?.[0]?.role || 'user';
                const roleInfo = ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS];
                const Icon = roleInfo?.icon || UserCog;

                return (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${roleInfo?.color || 'bg-gray-500'} text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{admin.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {admin.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant={admin.is_active ? "default" : "secondary"}>
                        {admin.is_active ? "Active" : "Inactive"}
                      </Badge>
                      
                      {selectedUser === admin.user_id ? (
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
                                  userId: admin.user_id,
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
                            setSelectedUser(admin.user_id);
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
