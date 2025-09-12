import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface DesignerSignupProps {
  onComplete?: () => void;
}

export const DesignerSignup = ({ onComplete }: DesignerSignupProps) => {
  const { becomeDesigner, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    portfolio_url: '',
    bio: '',
    specialties: [] as string[],
    commission_rate: 10
  });
  const [newSpecialty, setNewSpecialty] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to become a designer.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await becomeDesigner({
        business_name: formData.business_name || undefined,
        portfolio_url: formData.portfolio_url || undefined,
        bio: formData.bio || undefined,
        specialties: formData.specialties.length > 0 ? formData.specialties : undefined,
        commission_rate: formData.commission_rate
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to register as designer. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Designer Application Submitted!",
        description: "Your application has been submitted for review. You'll be notified once approved.",
      });

      if (onComplete) {
        onComplete();
      } else {
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialty();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Become a Designer</CardTitle>
        <CardDescription>
          Join our designer community and start selling your exhibition stand designs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name (Optional)</Label>
            <Input
              id="business_name"
              type="text"
              value={formData.business_name}
              onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
              placeholder="Your business or studio name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio_url">Portfolio URL (Optional)</Label>
            <Input
              id="portfolio_url"
              type="url"
              value={formData.portfolio_url}
              onChange={(e) => setFormData(prev => ({ ...prev, portfolio_url: e.target.value }))}
              placeholder="https://your-portfolio.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about your design experience and expertise..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Specialties (Optional)</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Modern Design, Trade Shows, Custom Build"
              />
              <Button type="button" onClick={addSpecialty} variant="outline">
                Add
              </Button>
            </div>
            {formData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                    {specialty}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeSpecialty(specialty)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission_rate">Commission Rate (%)</Label>
            <Input
              id="commission_rate"
              type="number"
              min="5"
              max="30"
              step="0.1"
              value={formData.commission_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: parseFloat(e.target.value) || 10 }))}
            />
            <p className="text-sm text-muted-foreground">
              Recommended: 10-15%. This is your commission from each design sale.
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting Application..." : "Apply to Become a Designer"}
          </Button>

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>What happens next?</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Your application will be reviewed by our team</li>
              <li>We'll verify your credentials and portfolio</li>
              <li>Once approved, you'll gain access to the designer portal</li>
              <li>You can then start uploading and selling your designs</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};