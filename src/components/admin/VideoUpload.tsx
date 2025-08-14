import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, Video, CheckCircle, AlertCircle } from 'lucide-react';

export const VideoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid video file (MP4, WebM, or MOV)');
        return;
      }

      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video file must be less than 100MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const uploadVideo = async () => {
    if (!selectedFile) {
      toast.error('Please select a video file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `hero-video-${timestamp}.${fileExt}`;

      // Upload the file
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      toast.success('Video uploaded successfully! Refresh the page to see it.');
      setSelectedFile(null);
      setUploadProgress(100);
      
      // Reset file input
      const fileInput = document.getElementById('video-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload video');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="text-center">
          <Video className="w-12 h-12 mx-auto text-primary mb-2" />
          <h3 className="text-lg font-semibold">Upload Hero Video</h3>
          <p className="text-sm text-muted-foreground">
            Upload a video to display on your homepage hero section
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="video-upload">Select Video File</Label>
          <Input
            id="video-upload"
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileSelect}
            disabled={uploading}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            Supported formats: MP4, WebM, MOV (max 100MB)
          </p>
        </div>

        {selectedFile && (
          <div className="bg-muted p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{selectedFile.name}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </div>
          </div>
        )}

        {uploading && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        <Button 
          onClick={uploadVideo} 
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </>
          )}
        </Button>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span>Video will automatically appear on homepage</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3 h-3 text-orange-500" />
            <span>For best performance, use MP4 format with H.264 codec</span>
          </div>
        </div>
      </div>
    </Card>
  );
};