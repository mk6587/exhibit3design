import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Lock, Upload, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ResumeUploadFieldProps {
  file: File | null;
  onChange: (file: File | null) => void;
  isEligible: boolean;
  isLoading: boolean;
  email?: string;
}

export const ResumeUploadField = ({
  file,
  onChange,
  isEligible,
  isLoading,
  email = ''
}: ResumeUploadFieldProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        alert('Please upload a PDF or DOC/DOCX file');
        return;
      }
      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      onChange(selectedFile);
    }
  };

  const handleClick = () => {
    if (!user) {
      navigate('/auth?next=' + encodeURIComponent('/careers/3d-designer#apply'));
    }
  };

  const getHelperText = () => {
    if (!user) {
      return (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Please sign in to upload your resume
          </p>
          <button
            onClick={() => {
              const params = new URLSearchParams();
              params.set('next', '/careers/3d-designer#apply');
              if (email) params.set('email', email);
              navigate('/auth?' + params.toString());
            }}
            className="text-sm text-primary hover:underline font-medium"
          >
            Sign in or create an account →
          </button>
        </div>
      );
    }
    if (isLoading) {
      return <span className="text-sm text-muted-foreground">Checking your eligibility...</span>;
    }
    if (!isEligible) {
      return (
        <div className="space-y-1">
          <p className="text-sm flex items-center gap-1 text-warning font-medium">
            <Lock className="h-3 w-3" />
            Resume upload locked
          </p>
          <p className="text-sm text-muted-foreground">
            You must use at least 1 AI token before applying.{' '}
            <a
              href="https://ai.exhibit3design.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Try AI Studio now →
            </a>
          </p>
        </div>
      );
    }
    if (file) {
      return (
        <span className="flex items-center gap-1 text-sm text-green-600">
          <CheckCircle2 className="h-3 w-3" />
          {file.name} ({(file.size / 1024).toFixed(1)} KB)
        </span>
      );
    }
    return <span className="text-sm text-muted-foreground">PDF or DOC/DOCX, max 10MB</span>;
  };

  const isDisabled = !user || !isEligible || isLoading;

  return (
    <div className="space-y-2">
      <Label htmlFor="resume" className="flex items-center gap-2">
        Resume <span className="text-destructive">*</span>
        {isEligible && user && <CheckCircle2 className="h-4 w-4 text-green-600" />}
      </Label>
      <div 
        className={`relative ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={isDisabled ? handleClick : undefined}
      >
        <Input
          id="resume"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          disabled={isDisabled}
          className={isDisabled ? 'cursor-not-allowed opacity-50' : ''}
        />
        {isDisabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-md">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
      <p className="text-sm">{getHelperText()}</p>
    </div>
  );
};
