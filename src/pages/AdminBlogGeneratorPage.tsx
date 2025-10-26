import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, ExternalLink, FileText, Link as LinkIcon, MessageSquare, Eye, Settings, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Map of category codes to their custom instructions from docs
const CATEGORY_INSTRUCTIONS: Record<string, string> = {
  "A": "Explain the impact of AI on exhibition stand design. Compare traditional and AI workflows. Use data or realistic scenarios. End with a benefit summary showing how Exhibit3Design simplifies the process.",
  "B": "Describe the techniques behind realistic 3D booth visualization. Include technical details (lighting, materials, perspective). Show how AI tools like Exhibit3Design can automate or improve those steps.",
  "C": "Write a tutorial that explains how to use [specific AI tool]. Include step-by-step instructions, expected results, and creative use cases. Keep it simple and visual.",
  "D": "Explain how ready-made design files save time and cost. Highlight formats (SKP, 3DS) and how users can customize them. Connect it to Exhibit3Design's AI enhancement options.",
  "E": "Write practical tips for trade show design strategy. Emphasize visual flow, product placement, and lighting. Add one section about how AI visualization helps validate booth concepts before fabrication.",
  "F": "Show inspiring examples of how AI can create unique exhibition designs. Describe creative transformations. Use Exhibit3Design's tools as real-world examples.",
  "G": "Explain how AI integrates into the designer's workflow. Compare manual rendering vs. AI automation in time and output quality. Give actionable tips for combining Exhibit3Design with 3D tools like SketchUp or 3ds Max.",
  "H": "Show how AI visuals improve communication with clients. Give presentation tips using rotating videos, sketch visuals, and visitors. Add a call to action like 'Try it free with your 2 AI tokens.'",
  "I": "Focus on exhibition design trends in [region]. Include major events or exhibitions in that country. Show how AI tools fit into the cultural or stylistic preferences of local designs.",
  "J": "Write directly to [target group]. Describe their daily challenges and how Exhibit3Design solves them.",
  "K": "Turn the topic into a short educational guide. Include key takeaways, definitions, and design basics. End with how AI can accelerate learning and prototyping in exhibition design.",
  "L": "Write a story-style post showing how someone used Exhibit3Design AI tools to save time or win a client. Include before/after descriptions and measurable improvements.",
  "M": "Write an opinion-style article about the future of AI in exhibition design. Include insights, challenges, and predictions. Keep the tone professional but forward-thinking.",
  "N": "Write an announcement for a new AI feature. Start with the problem it solves, explain how it works, and end with how to try it (link to /ai-samples).",
  "O": "Focus on search intent. Use the exact keyword [insert keyword phrase]. Keep it informational and clear, with Exhibit3Design as the recommended solution.",
  "P": "Write a short, engaging caption for a video or image post. Highlight visual appeal, simplicity, and speed. End with a one-line CTA like 'Try your 2 free AI tokens today.'",
  "Q": "Compare two tools, workflows, or approaches objectively. Use a table or bullet list of pros/cons. Position Exhibit3Design as the specialized solution for exhibitions.",
  "R": "Explain how to integrate AI visuals into other software. Provide steps, examples, and common file formats. Mention how Exhibit3Design supports SKP and 3DS files.",
  "S": "Create an idea-driven piece (like design psychology or creative trends). Include visuals, examples, and how AI helps push creativity further.",
  "T": "Explain how to start using Exhibit3Design AI tools. Include a 3-step guide and highlight the 2 free token offer. End with a strong CTA."
};

import { ALL_BLOG_TOPICS as ALL_TOPICS } from '@/data/blogTopics';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminBlogGeneratorPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [usedTopics, setUsedTopics] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<Category[]>([]);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch categories
    const { data: catData } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');
    if (catData) setCategories(catData);

    // Fetch used topics
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('generated_keyword');
    if (posts) {
      setUsedTopics(new Set(posts.map(p => p.generated_keyword).filter(Boolean)));
    }

    // Fetch settings
    const { data: settings } = await supabase
      .from('blog_settings')
      .select('*')
      .single();
    if (settings) {
      setAutoGenerate(settings.auto_generate_enabled);
      setAutoApprove(settings.auto_approve_enabled);
    }
  };

  const filteredTopics = ALL_TOPICS.filter(topic =>
    topic.keyword.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTopic = (keyword: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    setSelectedTopics(newSelected);
  };

  const generateSelected = async () => {
    if (selectedTopics.size === 0) {
      toast({ title: "No topics selected", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const keyword of Array.from(selectedTopics)) {
      try {
        const topic = ALL_TOPICS.find(t => t.keyword === keyword);
        if (!topic) continue;

        const { data, error } = await supabase.functions.invoke('generate-blog-post', {
          body: {
            keyword,
            customInstructions: CATEGORY_INSTRUCTIONS[topic.category],
            autoApprove
          }
        });

        if (error) throw error;
        successCount++;
        
        // Add to used topics
        setUsedTopics(prev => new Set([...prev, keyword]));
      } catch (error) {
        console.error(`Failed to generate: ${keyword}`, error);
        failCount++;
      }
    }

    setIsLoading(false);
    setSelectedTopics(new Set());
    
    toast({
      title: "Generation Complete",
      description: `${successCount} posts generated, ${failCount} failed`
    });
  };

  const updateSettings = async () => {
    try {
      // First, get the settings id
      const { data: settingsData, error: fetchError } = await supabase
        .from('blog_settings')
        .select('id')
        .single();

      if (fetchError) throw fetchError;

      // Then update the settings
      const { error: updateError } = await supabase
        .from('blog_settings')
        .update({
          auto_generate_enabled: autoGenerate,
          auto_approve_enabled: autoApprove
        })
        .eq('id', settingsData.id);

      if (updateError) throw updateError;

      toast({ title: "Settings updated successfully" });
    } catch (error) {
      console.error('Settings update error:', error);
      toast({ title: "Failed to update settings", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Blog Generator</h1>
            <p className="text-muted-foreground mt-2">
              Manage 200+ blog topics with AI-powered content generation
            </p>
          </div>
          <Button onClick={() => navigate('/admin/blog-posts')}>
            <Eye className="mr-2 h-4 w-4" />
            View Posts
          </Button>
        </div>

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Generation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Generate Daily</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate one post per day from unused topics
                </p>
              </div>
              <Switch checked={autoGenerate} onCheckedChange={setAutoGenerate} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Approve Posts</Label>
                <p className="text-sm text-muted-foreground">
                  Publish posts automatically without manual review
                </p>
              </div>
              <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
            </div>
            <Button onClick={updateSettings}>Save Settings</Button>
          </CardContent>
        </Card>

        {/* Topic Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Topic Checklist ({ALL_TOPICS.length} topics)</CardTitle>
            <CardDescription>
              {usedTopics.size} generated | {selectedTopics.size} selected | {ALL_TOPICS.length - usedTopics.size} remaining
            </CardDescription>
            <Input
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {Object.entries(
                  filteredTopics.reduce((acc, topic) => {
                    if (!acc[topic.category]) acc[topic.category] = [];
                    acc[topic.category].push(topic);
                    return acc;
                  }, {} as Record<string, typeof filteredTopics>)
                ).map(([category, topics]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="font-semibold text-lg">Category {category}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {CATEGORY_INSTRUCTIONS[category]}
                    </p>
                    <div className="space-y-2">
                      {topics.map((topic) => {
                        const isUsed = usedTopics.has(topic.keyword);
                        const isSelected = selectedTopics.has(topic.keyword);
                        
                        return (
                          <div
                            key={topic.keyword}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              isUsed ? 'bg-muted opacity-60' : 'hover:bg-accent'
                            }`}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleTopic(topic.keyword)}
                              disabled={isUsed || isLoading}
                            />
                            <span className={`flex-1 ${isUsed ? 'line-through' : ''}`}>
                              {topic.keyword}
                            </span>
                            {isUsed && (
                              <Badge variant="secondary">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Used
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Generate Button */}
        {selectedTopics.size > 0 && (
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={generateSelected}
                disabled={isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating {selectedTopics.size} posts...
                  </>
                ) : (
                  `Generate ${selectedTopics.size} Selected Post${selectedTopics.size > 1 ? 's' : ''}`
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
