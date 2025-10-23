import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, Eye, Upload, Trash2, ArrowLeft } from "lucide-react";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  keywords: string[];
  featured_image_url: string | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  quality_score: number;
  readability_score: number;
  word_count: number;
  view_count: number;
  ctas: any[];
  internal_links: any[];
}

interface Category {
  id: string;
  name: string;
}

export default function AdminBlogPostEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchPost();
    } else {
      setPost({
        id: '',
        title: '',
        slug: '',
        content: '',
        meta_description: '',
        keywords: [],
        featured_image_url: null,
        status: 'draft',
        published_at: null,
        quality_score: 0,
        readability_score: 0,
        word_count: 0,
        view_count: 0,
        ctas: [],
        internal_links: []
      });
      setLoading(false);
    }
    fetchCategories();
  }, [id, isNew]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPost(data as BlogPost);

      // Fetch assigned categories
      const { data: catData } = await supabase
        .from('blog_post_categories')
        .select('category_id')
        .eq('post_id', id);

      if (catData) {
        setSelectedCategories(catData.map(c => c.category_id));
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load post');
      navigate('/admin/blog-posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('blog_categories')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (data) {
      setCategories(data);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    if (!post) return;
    setPost({
      ...post,
      title,
      slug: isNew || !post.slug ? generateSlug(title) : post.slug
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !post) return;

    setUploading(true);
    try {
      const fileName = `blog/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      setPost({ ...post, featured_image_url: publicUrl });
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (publishNow = false) => {
    if (!post) return;

    if (!post.title || !post.content || !post.meta_description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title: post.title,
        slug: post.slug,
        content: post.content,
        meta_description: post.meta_description,
        keywords: post.keywords,
        featured_image_url: post.featured_image_url,
        status: publishNow ? 'published' : post.status,
        published_at: publishNow && !post.published_at ? new Date().toISOString() : post.published_at,
        word_count: post.content.split(/\s+/).length,
      };

      let postId = post.id;

      if (isNew) {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([postData])
          .select()
          .single();

        if (error) throw error;
        postId = data.id;
        toast.success('Post created successfully');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id);

        if (error) throw error;
        toast.success('Post updated successfully');
      }

      // Update categories
      await supabase
        .from('blog_post_categories')
        .delete()
        .eq('post_id', postId);

      if (selectedCategories.length > 0) {
        await supabase
          .from('blog_post_categories')
          .insert(selectedCategories.map(catId => ({
            post_id: postId,
            category_id: catId
          })));
      }

      if (isNew) {
        navigate(`/admin/blog-posts/${postId}`);
      } else {
        fetchPost();
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post || isNew) return;
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;
      toast.success('Post deleted successfully');
      navigate('/admin/blog-posts');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete post');
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

  if (!post) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/blog-posts')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {isNew ? 'New Blog Post' : 'Edit Blog Post'}
              </h1>
              {!isNew && post.published_at && (
                <p className="text-sm text-muted-foreground mt-1">
                  Published {format(new Date(post.published_at), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!isNew && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="ghost" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Draft
            </Button>
            <Button onClick={() => handleSave(true)} disabled={saving}>
              Publish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={post.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter post title..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={post.slug}
                    onChange={(e) => setPost({ ...post, slug: e.target.value })}
                    placeholder="post-url-slug"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <RichTextEditor
                    value={post.content}
                    onChange={(value) => setPost({ ...post, content: value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description *</Label>
                  <Textarea
                    id="meta_description"
                    value={post.meta_description}
                    onChange={(e) => setPost({ ...post, meta_description: e.target.value })}
                    placeholder="Brief description for search engines (150-160 chars)"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {post.meta_description.length}/160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    value={post.keywords.join(', ')}
                    onChange={(e) => setPost({ 
                      ...post, 
                      keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                    })}
                    placeholder="exhibition design, AI tools, trade show"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Status</Label>
                  <div>
                    <Badge className={
                      post.status === 'published' ? 'bg-green-100 text-green-800' :
                      post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {post.status}
                    </Badge>
                  </div>
                </div>

                {!isNew && (
                  <div className="space-y-2">
                    <Label htmlFor="status">Change Status</Label>
                    <Select
                      value={post.status}
                      onValueChange={(value: 'draft' | 'published' | 'archived') => 
                        setPost({ ...post, status: value })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quality Score</span>
                    <span className="font-medium">{post.quality_score}/100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Readability</span>
                    <span className="font-medium">{post.readability_score}/100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Word Count</span>
                    <span className="font-medium">{post.word_count}</span>
                  </div>
                  {!isNew && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Views</span>
                      <span className="font-medium">{post.view_count}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {post.featured_image_url && (
                  <img
                    src={post.featured_image_url}
                    alt="Featured"
                    className="w-full rounded-lg"
                  />
                )}
                <div>
                  <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {post.featured_image_url ? 'Change Image' : 'Upload Image'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category.id]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
