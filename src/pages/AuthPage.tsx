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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowForgotPassword(false);

    try {
      // First try to sign in
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          // Could be either email doesn't exist OR wrong password
          // Try to register - if user exists, it will fail with specific message
          const { error: signUpError } = await signUp(email, password);
          
          if (signUpError) {
            if (signUpError.message.includes('User already registered') || 
                signUpError.message.includes('already been registered')) {
              // User exists, so the original sign in failure was due to wrong password
              setError("Incorrect password");
              setShowForgotPassword(true);
            } else if (signUpError.message.includes('weak_password') || 
                       signUpError.message.includes('Password should be at least')) {
              setError("For new accounts, password must be at least 6 characters long");
            } else {
              setError(signUpError.message);
            }
          } else {
            // Registration successful - new user
            setRegistrationSuccess(true);
          }
        } else {
          setError(signInError.message);
        }
      } else {
        // Sign in successful
        navigate("/profile");
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
                Access your purchased designs or buy affordable exhibition stand files
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registrationSuccess ? (
                <div className="text-center space-y-4">
                  <div className="mb-6">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Registration Successful!</h3>
                    <p className="text-muted-foreground">
                      We've sent a confirmation email to <strong>{email}</strong>
                    </p>
                  </div>
                  
                  <Alert>
                    <AlertDescription>
                      Please check your email and click the confirmation link to activate your account. 
                      Don't forget to check your spam folder if you don't see the email.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setRegistrationSuccess(false);
                      setEmail("");
                      setPassword("");
                      setError(null);
                    }}
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </div>
              ) : (
                <>
                  {error && (
                    <Alert className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
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
                    
                    {showForgotPassword && (
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
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;