import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowForgotPassword(false);

    try {
      if (isRegisterMode) {
        const { error } = await signUp(email, password, firstName, lastName);
        if (error) {
          if (error.message.includes('User already registered')) {
            // Try to sign in instead
            const { error: signInError } = await signIn(email, password);
            if (signInError) {
              setError("An account with this email already exists. Please sign in or use a different email.");
            } else {
              navigate("/profile");
            }
          } else {
            setError(error.message);
          }
        } else {
          navigate("/profile");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError("Incorrect password");
            setShowForgotPassword(true);
          } else {
            setError(error.message);
          }
        } else {
          navigate("/profile");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }
    
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>
                Login / Register to Your Account
              </CardTitle>
              <CardDescription>
                {isRegisterMode 
                  ? "Join now to access affordable exhibition stand design files that save you time and money"
                  : "Access your purchased designs or buy affordable exhibition stand files"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegisterMode && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    disabled={loading}
                  />
                </div>
                
                {showForgotPassword && !isRegisterMode && (
                  <div className="text-sm">
                    <Button 
                      type="button" 
                      variant="link" 
                      className="p-0 h-auto text-primary hover:underline"
                      onClick={handleForgotPassword}
                      disabled={loading}
                    >
                      Forgot password?
                    </Button>
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Processing..." : "Login / Register"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;