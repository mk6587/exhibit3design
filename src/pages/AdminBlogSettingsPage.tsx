import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface BlogSettings {
  id: string;
  auto_generate_enabled: boolean;
  auto_approve_enabled: boolean;
  topics_source: string;
  created_at: string;
  updated_at: string;
}

export default function AdminBlogSettingsPage() {
  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data as BlogSettings);
    } catch (error) {
      console.error('Error fetching blog settings:', error);
      toast.error('Failed to load blog settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('blog_settings')
        .update({
          auto_generate_enabled: settings.auto_generate_enabled,
          auto_approve_enabled: settings.auto_approve_enabled,
          topics_source: settings.topics_source,
        })
        .eq('id', settings.id);

      if (error) throw error;
      toast.success('Blog settings saved successfully');
    } catch (error) {
      console.error('Error saving blog settings:', error);
      toast.error('Failed to save blog settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!settings) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No blog settings found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Blog Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your blog academy settings and AI generation preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AI Content Generation</CardTitle>
            <CardDescription>Configure automatic blog post generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Auto-Generation</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate blog posts on a schedule
                </p>
              </div>
              <Switch
                checked={settings.auto_generate_enabled}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, auto_generate_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Approve Generated Posts</Label>
                <p className="text-sm text-muted-foreground">
                  Publish posts automatically without manual review
                </p>
              </div>
              <Switch
                checked={settings.auto_approve_enabled}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, auto_approve_enabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topics_source">Topics Source</Label>
              <Select
                value={settings.topics_source}
                onValueChange={(value) => setSettings({ ...settings, topics_source: value })}
              >
                <SelectTrigger id="topics_source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="docs/BLOG_TOPICS.md">BLOG_TOPICS.md File</SelectItem>
                  <SelectItem value="queue">Generation Queue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  try {
                    setSaving(true);
                    const { data, error } = await supabase.functions.invoke('auto-generate-blog');
                    if (error) throw error;
                    if (data.success) {
                      toast.success('Blog post generated successfully!');
                    } else {
                      toast.info(data.message || 'Generation skipped');
                    }
                  } catch (error) {
                    console.error('Test generation error:', error);
                    toast.error('Failed to generate blog post');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Test Generate Now'
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Manually trigger blog generation to test the AI workflow
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
