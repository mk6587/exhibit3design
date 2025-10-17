import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Save, X } from "lucide-react";
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

interface AISample {
  id: string;
  name: string;
  mode_label: string;
  type: 'image' | 'video';
  before_image_url?: string;
  after_image_url?: string;
  before_video_url?: string;
  after_video_url?: string;
  sort_order: number;
  external_link?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const AISamplesManagement = () => {
  const [samples, setSamples] = useState<AISample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSample, setEditingSample] = useState<AISample | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const emptyForm: Partial<AISample> = {
    name: '',
    mode_label: '',
    type: 'image',
    before_image_url: '',
    after_image_url: '',
    before_video_url: '',
    after_video_url: '',
    sort_order: 0,
    external_link: '',
    is_active: true
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_samples')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setSamples((data || []) as AISample[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (sample: Partial<AISample>) => {
    try {
      // Validate required fields
      if (!sample.name || !sample.mode_label) {
        toast({
          title: "Error",
          description: "Name and Mode Label are required",
          variant: "destructive"
        });
        return;
      }

      if (editingSample) {
        // Update existing
        const { error } = await supabase
          .from('ai_samples')
          .update(sample as any)
          .eq('id', editingSample.id);

        if (error) throw error;
        toast({ title: "Success", description: "Sample updated successfully" });
      } else {
        // Create new
        const { error } = await supabase
          .from('ai_samples')
          .insert([sample as any]);

        if (error) throw error;
        toast({ title: "Success", description: "Sample created successfully" });
      }

      setEditingSample(null);
      setIsCreating(false);
      fetchSamples();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_samples')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Sample deleted successfully" });
      fetchSamples();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const index = samples.findIndex(s => s.id === id);
    if (index === -1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= samples.length) return;

    const newSamples = [...samples];
    const temp = newSamples[index].sort_order;
    newSamples[index].sort_order = newSamples[targetIndex].sort_order;
    newSamples[targetIndex].sort_order = temp;

    // Swap in array
    [newSamples[index], newSamples[targetIndex]] = [newSamples[targetIndex], newSamples[index]];

    try {
      // Update both items
      await Promise.all([
        supabase.from('ai_samples').update({ sort_order: newSamples[index].sort_order }).eq('id', newSamples[index].id),
        supabase.from('ai_samples').update({ sort_order: newSamples[targetIndex].sort_order }).eq('id', newSamples[targetIndex].id)
      ]);

      setSamples(newSamples);
      toast({ title: "Success", description: "Order updated" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">AI Samples Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage showcase samples displayed on the homepage
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Sample
        </Button>
      </div>

      {(isCreating || editingSample) && (
        <SampleForm
          sample={editingSample || emptyForm}
          onSave={handleSave}
          onCancel={() => {
            setEditingSample(null);
            setIsCreating(false);
          }}
        />
      )}

      <div className="grid gap-4">
        {samples.map((sample, index) => (
          <Card key={sample.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{sample.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      sample.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {sample.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                      {sample.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Mode Label:</span> {sample.mode_label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Sort Order:</span> {sample.sort_order}
                  </p>
                  {sample.external_link && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Link:</span>{" "}
                      <a href={sample.external_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {sample.external_link}
                      </a>
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleReorder(sample.id, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleReorder(sample.id, 'down')}
                    disabled={index === samples.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingSample(sample)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(sample.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the AI sample.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface SampleFormProps {
  sample: Partial<AISample>;
  onSave: (sample: Partial<AISample>) => void;
  onCancel: () => void;
}

const SampleForm = ({ sample: initialSample, onSave, onCancel }: SampleFormProps) => {
  const [sample, setSample] = useState(initialSample);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialSample.id ? 'Edit Sample' : 'Create Sample'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Sample Name</Label>
            <Input
              value={sample.name || ''}
              onChange={(e) => setSample({ ...sample, name: e.target.value })}
              placeholder="e.g., Sketch Mode Sample"
            />
          </div>
          <div className="space-y-2">
            <Label>Mode Label (Display Text)</Label>
            <Input
              value={sample.mode_label || ''}
              onChange={(e) => setSample({ ...sample, mode_label: e.target.value })}
              placeholder="e.g., Sketch Mode"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={sample.type || 'image'}
              onValueChange={(value: 'image' | 'video') => setSample({ ...sample, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Input
              type="number"
              value={sample.sort_order || 0}
              onChange={(e) => setSample({ ...sample, sort_order: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <Tabs defaultValue="before" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="before">Before Media</TabsTrigger>
            <TabsTrigger value="after">After Media</TabsTrigger>
          </TabsList>
          <TabsContent value="before" className="space-y-4">
            <div className="space-y-2">
              <Label>Before Image URL</Label>
              <Input
                value={sample.before_image_url || ''}
                onChange={(e) => setSample({ ...sample, before_image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            {sample.type === 'video' && (
              <div className="space-y-2">
                <Label>Before Video URL (optional)</Label>
                <Input
                  value={sample.before_video_url || ''}
                  onChange={(e) => setSample({ ...sample, before_video_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}
          </TabsContent>
          <TabsContent value="after" className="space-y-4">
            {sample.type === 'image' && (
              <div className="space-y-2">
                <Label>After Image URL</Label>
                <Input
                  value={sample.after_image_url || ''}
                  onChange={(e) => setSample({ ...sample, after_image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}
            {sample.type === 'video' && (
              <div className="space-y-2">
                <Label>After Video URL</Label>
                <Input
                  value={sample.after_video_url || ''}
                  onChange={(e) => setSample({ ...sample, after_video_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label>External Link (optional)</Label>
          <Input
            value={sample.external_link || ''}
            onChange={(e) => setSample({ ...sample, external_link: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={sample.is_active ?? true}
            onCheckedChange={(checked) => setSample({ ...sample, is_active: checked })}
          />
          <Label>Active (visible on homepage)</Label>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={() => onSave(sample)}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
