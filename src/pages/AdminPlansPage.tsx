import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_period: string;
  initial_ai_tokens: number;
  video_seconds: number;
  max_files: number;
  file_access_tier: string;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  features: string[];
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    billing_period: "monthly",
    initial_ai_tokens: 0,
    video_seconds: 0,
    max_files: 0,
    file_access_tier: "sample",
    is_active: true,
    is_featured: false,
    display_order: 0,
    features: "",
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      const formattedData = (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) 
          ? plan.features as string[]
          : typeof plan.features === 'string'
          ? [plan.features]
          : []
      }));
      
      setPlans(formattedData);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || "",
      price: plan.price,
      billing_period: plan.billing_period,
      initial_ai_tokens: plan.initial_ai_tokens,
      video_seconds: plan.video_seconds,
      max_files: plan.max_files,
      file_access_tier: plan.file_access_tier,
      is_active: plan.is_active,
      is_featured: plan.is_featured,
      display_order: plan.display_order,
      features: Array.isArray(plan.features) ? plan.features.join('\n') : "",
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      billing_period: "monthly",
      initial_ai_tokens: 0,
      video_seconds: 0,
      max_files: 0,
      file_access_tier: "sample",
      is_active: true,
      is_featured: false,
      display_order: plans.length,
      features: "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const features = formData.features
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const planData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        billing_period: formData.billing_period,
        initial_ai_tokens: formData.initial_ai_tokens,
        video_seconds: formData.video_seconds,
        max_files: formData.max_files,
        file_access_tier: formData.file_access_tier,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        display_order: formData.display_order,
        features: features,
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('subscription_plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;
        toast.success('Plan updated successfully');
      } else {
        const { error } = await supabase
          .from('subscription_plans')
          .insert([planData]);

        if (error) throw error;
        toast.success('Plan created successfully');
      }

      setIsDialogOpen(false);
      loadPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save plan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Plan deleted successfully');
      loadPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete plan');
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>Manage your subscription plans and pricing</CardDescription>
              </div>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                New Plan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        {plan.is_featured && (
                          <Badge variant="secondary" className="mt-1">Featured</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>€{plan.price.toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{plan.file_access_tier}</TableCell>
                    <TableCell>{plan.max_files}</TableCell>
                    <TableCell>{plan.initial_ai_tokens}</TableCell>
                    <TableCell>
                      <Badge variant={plan.is_active ? "default" : "secondary"}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Edit Plan' : 'Create Plan'}
              </DialogTitle>
              <DialogDescription>
                {editingPlan ? 'Update plan details' : 'Add a new subscription plan'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="billing_period">Billing Period</Label>
                  <Select
                    value={formData.billing_period}
                    onValueChange={(value) => setFormData({ ...formData, billing_period: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ai_tokens">AI Tokens</Label>
                  <Input
                    id="ai_tokens"
                    type="number"
                    value={formData.initial_ai_tokens}
                    onChange={(e) => setFormData({ ...formData, initial_ai_tokens: parseInt(e.target.value) })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="video_seconds">Video Seconds</Label>
                  <Input
                    id="video_seconds"
                    type="number"
                    value={formData.video_seconds}
                    onChange={(e) => setFormData({ ...formData, video_seconds: parseInt(e.target.value) })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="max_files">Max Files</Label>
                  <Input
                    id="max_files"
                    type="number"
                    value={formData.max_files}
                    onChange={(e) => setFormData({ ...formData, max_files: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="file_access_tier">File Access Tier</Label>
                <Select
                  value={formData.file_access_tier}
                  onValueChange={(value) => setFormData({ ...formData, file_access_tier: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sample">Sample</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  rows={5}
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingPlan ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
