import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ResumeUploadField } from './ResumeUploadField';
import { TokenGateBanner } from './TokenGateBanner';
import { useTokenEligibility } from '@/hooks/useTokenEligibility';
import { Loader2 } from 'lucide-react';

interface ApplicationFormProps {
  jobSlug: string;
}

export const ApplicationForm = ({ jobSlug }: ApplicationFormProps) => {
  const { user } = useAuth();
  const { eligibility, isLoading: checkingEligibility, refetch } = useTokenEligibility();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    linkedinUrl: '',
    portfolioUrl: '',
    coverNote: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEligible = eligibility?.eligible ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to apply');
      return;
    }

    if (!isEligible) {
      toast.error('Please use at least 1 AI token to apply');
      return;
    }

    if (!resumeFile) {
      toast.error('Please upload your resume');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(resumeFile);
      });
      const base64Data = await base64Promise;

      // Submit application
      const { data, error } = await supabase.functions.invoke('submit-career-application', {
        body: {
          jobSlug,
          fullName: formData.fullName,
          email: formData.email,
          linkedinUrl: formData.linkedinUrl || undefined,
          portfolioUrl: formData.portfolioUrl || undefined,
          coverNote: formData.coverNote || undefined,
          resumeFile: {
            name: resumeFile.name,
            type: resumeFile.type,
            size: resumeFile.size,
            data: base64Data,
          },
        },
      });

      if (error) {
        console.error('Submission error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('already applied')) {
          toast.error('You have already applied for this position');
        } else if (error.message?.includes('rate limit')) {
          toast.error('Maximum application attempts reached. Please try again later.');
        } else if (error.message?.includes('token')) {
          toast.error('Please use at least 1 AI token to apply');
          refetch(); // Refresh eligibility
        } else {
          toast.error('Failed to submit application. Please try again.');
        }
        return;
      }

      toast.success('Application submitted successfully!');
      
      // Reset form
      setFormData({
        fullName: '',
        email: user?.email || '',
        linkedinUrl: '',
        portfolioUrl: '',
        coverNote: '',
      });
      setResumeFile(null);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border p-6" id="apply">
      <h2 className="text-2xl font-bold mb-6">Apply for this Position</h2>
      
      {user && !checkingEligibility && !isEligible && <TokenGateBanner />}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="john@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn Profile (Optional)</Label>
          <Input
            id="linkedinUrl"
            type="url"
            value={formData.linkedinUrl}
            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolioUrl">Portfolio URL (Optional)</Label>
          <Input
            id="portfolioUrl"
            type="url"
            value={formData.portfolioUrl}
            onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
            placeholder="https://yourportfolio.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coverNote">Cover Note (Optional)</Label>
          <Textarea
            id="coverNote"
            value={formData.coverNote}
            onChange={(e) => setFormData({ ...formData, coverNote: e.target.value })}
            placeholder="Tell us why you're interested in this role..."
            rows={4}
          />
        </div>

        <ResumeUploadField
          file={resumeFile}
          onChange={setResumeFile}
          isEligible={isEligible}
          isLoading={checkingEligibility}
        />

        <Button
          type="submit"
          disabled={isSubmitting || !resumeFile || !isEligible}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting Application...
            </>
          ) : (
            'Submit Application'
          )}
        </Button>
      </form>
    </div>
  );
};
