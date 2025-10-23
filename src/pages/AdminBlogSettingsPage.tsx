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
  site_title: string;
  tagline: string;
  posts_per_page: number;
  auto_generate_enabled: boolean;
  generation_frequency: 'daily' | 'weekly' | 'monthly';
  topics_source: string;
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
          site_title: settings.site_title,
          tagline: settings.tagline,
          posts_per_page: settings.posts_per_page,
          auto_generate_enabled: settings.auto_generate_enabled,
          generation_frequency: settings.generation_frequency,
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
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic blog configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_title">Site Title</Label>
              <Input
                id="site_title"
                value={settings.site_title}
                onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={settings.tagline || ''}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="posts_per_page">Posts Per Page</Label>
              <Input
                id="posts_per_page"
                type="number"
                min="1"
                max="50"
                value={settings.posts_per_page}
                onChange={(e) => setSettings({ ...settings, posts_per_page: parseInt(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

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

            <div className="space-y-2">
              <Label htmlFor="generation_frequency">Generation Frequency</Label>
              <Select
                value={settings.generation_frequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                  setSettings({ ...settings, generation_frequency: value })
                }
              >
                <SelectTrigger id="generation_frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="file">BLOG_TOPICS.md File</SelectItem>
                  <SelectItem value="queue">Generation Queue</SelectItem>
                </SelectContent>
              </Select>
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
