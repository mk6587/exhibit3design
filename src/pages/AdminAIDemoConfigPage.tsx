import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, Image as ImageIcon, Film } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface DemoConfig {
  id: string;
  service_key: string;
  service_name: string;
  service_type: 'image' | 'video';
  mock_input_url: string;
  mock_output_url: string;
  is_active: boolean;
  display_order: number;
}

export default function AdminAIDemoConfigPage() {
  const [configs, setConfigs] = useState<DemoConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_demo_configs')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setConfigs((data || []) as DemoConfig[]);
    } catch (error) {
      console.error('Error fetching demo configs:', error);
      toast.error('Failed to load demo configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<DemoConfig>) => {
    setSaving(id);
    try {
      const { error } = await supabase
        .from('ai_demo_configs')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setConfigs(configs.map(c => c.id === id ? { ...c, ...updates } : c));
      toast.success('Configuration updated successfully');
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Failed to update configuration');
    } finally {
      setSaving(null);
    }
  };

  const handleInputChange = (id: string, field: keyof DemoConfig, value: string) => {
    setConfigs(configs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const imageConfigs = configs.filter(c => c.service_type === 'image');
  const videoConfigs = configs.filter(c => c.service_type === 'video');

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Demo Configuration</h1>
          <p className="text-muted-foreground">
            Configure the input and output URLs for the "Try Before Use" feature on the AI Samples page
          </p>
        </div>

        {/* Image Services */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Image Services</h2>
          </div>
          <div className="grid gap-6">
            {imageConfigs.map((config) => (
              <Card key={config.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{config.service_name}</CardTitle>
                      <CardDescription>Service Key: {config.service_key}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${config.id}`}>Active</Label>
                      <Switch
                        id={`active-${config.id}`}
                        checked={config.is_active}
                        onCheckedChange={(checked) => handleUpdate(config.id, { is_active: checked })}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`input-${config.id}`}>Input Image URL</Label>
                      <Input
                        id={`input-${config.id}`}
                        value={config.mock_input_url}
                        onChange={(e) => handleInputChange(config.id, 'mock_input_url', e.target.value)}
                        placeholder="/lovable-uploads/example.png"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`output-${config.id}`}>Output Image URL</Label>
                      <Input
                        id={`output-${config.id}`}
                        value={config.mock_output_url}
                        onChange={(e) => handleInputChange(config.id, 'mock_output_url', e.target.value)}
                        placeholder="/lovable-uploads/example-result.png"
                      />
                    </div>
                    <Button
                      onClick={() => handleUpdate(config.id, {
                        mock_input_url: config.mock_input_url,
                        mock_output_url: config.mock_output_url
                      })}
                      disabled={saving === config.id}
                    >
                      {saving === config.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Video Services */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Film className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Video Services</h2>
          </div>
          <div className="grid gap-6">
            {videoConfigs.map((config) => (
              <Card key={config.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{config.service_name}</CardTitle>
                      <CardDescription>Service Key: {config.service_key}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${config.id}`}>Active</Label>
                      <Switch
                        id={`active-${config.id}`}
                        checked={config.is_active}
                        onCheckedChange={(checked) => handleUpdate(config.id, { is_active: checked })}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`input-${config.id}`}>Input Image URL</Label>
                      <Input
                        id={`input-${config.id}`}
                        value={config.mock_input_url}
                        onChange={(e) => handleInputChange(config.id, 'mock_input_url', e.target.value)}
                        placeholder="/lovable-uploads/example.png"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`output-${config.id}`}>Output Image/Video URL</Label>
                      <Input
                        id={`output-${config.id}`}
                        value={config.mock_output_url}
                        onChange={(e) => handleInputChange(config.id, 'mock_output_url', e.target.value)}
                        placeholder="/lovable-uploads/example-result.png"
                      />
                    </div>
                    <Button
                      onClick={() => handleUpdate(config.id, {
                        mock_input_url: config.mock_input_url,
                        mock_output_url: config.mock_output_url
                      })}
                      disabled={saving === config.id}
                    >
                      {saving === config.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
