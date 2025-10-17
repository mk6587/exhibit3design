import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Shield, Plus, Trash2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WhitelistedIP {
  id: string;
  ip_address: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function IPWhitelistManagement() {
  const [ips, setIps] = useState<WhitelistedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIp, setNewIp] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadIPs();
  }, []);

  const loadIPs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_ip_whitelist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIps(data || []);
    } catch (error) {
      console.error('Error loading IPs:', error);
      toast.error('Failed to load IP whitelist');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newIp.trim()) {
      toast.error('Please enter an IP address');
      return;
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(newIp.trim())) {
      toast.error('Please enter a valid IP address');
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase
        .from('admin_ip_whitelist')
        .insert({
          ip_address: newIp.trim(),
          description: newDescription.trim() || null,
          is_active: true
        });

      if (error) throw error;

      toast.success('IP address added to whitelist');
      setNewIp('');
      setNewDescription('');
      loadIPs();
    } catch (error: any) {
      console.error('Error adding IP:', error);
      if (error.code === '23505') {
        toast.error('This IP address is already in the whitelist');
      } else {
        toast.error('Failed to add IP address');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_ip_whitelist')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast.success(`IP ${!currentStatus ? 'enabled' : 'disabled'}`);
      loadIPs();
    } catch (error) {
      console.error('Error toggling IP status:', error);
      toast.error('Failed to update IP status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('admin_ip_whitelist')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast.success('IP address removed from whitelist');
      loadIPs();
    } catch (error) {
      console.error('Error deleting IP:', error);
      toast.error('Failed to remove IP address');
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading IP whitelist...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            IP Whitelist Management
          </CardTitle>
          <CardDescription>
            Only whitelisted IP addresses can access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New IP Form */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h3 className="font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New IP Address
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">IP Address</label>
                <Input
                  placeholder="e.g., 192.168.1.1"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  disabled={adding}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (optional)</label>
                <Input
                  placeholder="e.g., Office network"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  disabled={adding}
                />
              </div>
            </div>
            <Button onClick={handleAdd} disabled={adding}>
              <Plus className="h-4 w-4 mr-2" />
              {adding ? 'Adding...' : 'Add IP Address'}
            </Button>
          </div>

          {/* IP List */}
          <div>
            <h3 className="font-semibold mb-4">Whitelisted IP Addresses</h3>
            {ips.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No IP addresses in whitelist
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ips.map((ip) => (
                    <TableRow key={ip.id}>
                      <TableCell className="font-mono font-medium">
                        {ip.ip_address}
                      </TableCell>
                      <TableCell>
                        {ip.description || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {ip.is_active ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Disabled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(ip.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(ip.id, ip.is_active)}
                          >
                            {ip.is_active ? 'Disable' : 'Enable'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteId(ip.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove IP from Whitelist?</AlertDialogTitle>
            <AlertDialogDescription>
              This IP address will no longer be able to access the admin panel.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
