import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  type: "login" | "register" | "reset" | "smart";
}

const AuthForm = ({ type }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSmartAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Smart auth attempt with email:", email);
      
      // First, try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log("Sign in attempt result:", { signInData, signInError });
      
      if (!signInError && signInData.user) {
        // Successful login
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
        navigate("/");
        return;
      }
      
      // If sign in failed, check the error type
      if (signInError) {
        console.log("Sign in error message:", signInError.message);
        
        // If it's an invalid credentials error, try to determine if user exists
        if (signInError.message.includes("Invalid login credentials") || 
            signInError.message.includes("invalid_credentials")) {
          
          // Try to sign up (this will fail if user exists with different password)
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: "https://exhibit3design.com/"
            }
          });
          
          console.log("Sign up attempt result:", { signUpData, signUpError });
          
          if (!signUpError && signUpData.user) {
            // Successful registration
            toast({
              title: "Account created!",
              description: "Please check your email to confirm your account. The confirmation email is from Exhibit3Design with information about our premium exhibition stand design services.",
            });
            return;
          }
          
          if (signUpError) {
            console.log("Sign up error message:", signUpError.message);
            
            // If user already exists, it means wrong password - suggest reset
            if (signUpError.message.includes("already registered") || 
                signUpError.message.includes("already been registered")) {
              
              toast({
                title: "Wrong password?",
                description: "This email exists but password is incorrect. Try password reset.",
                action: (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePasswordReset()}
                  >
                    Reset Password
                  </Button>
                ),
              });
              return;
            }
          }
        }
      }
      
      // If we get here, show generic error
      throw new Error("Authentication failed. Please try again.");
      
    } catch (error: any) {
      console.error("Smart auth error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address first.",
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://exhibit3design.com/",
      });
      
      if (error) throw error;
      
      toast({
        title: "Reset link sent",
        description: "Check your email for a password reset link from Exhibit3Design.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reset email.",
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === "smart") {
      return handleSmartAuth(e);
    }
    
    setLoading(true);
    
    try {
      if (type === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Success!",
          description: "You have been logged in successfully.",
        });
        navigate("/");
        
      } else if (type === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: "https://exhibit3design.com/"
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link from Exhibit3Design to complete your registration.",
        });
        
      } else if (type === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: "https://exhibit3design.com/",
        });
        
        if (error) throw error;
        
        toast({
          title: "Reset link sent",
          description: "Check your email for a password reset link from Exhibit3Design.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getTitle = () => {
    if (type === "smart") return "Sign In or Create Account";
    if (type === "login") return "Login to Your Account";
    if (type === "register") return "Create an Account";
    if (type === "reset") return "Reset Your Password";
  };
  
  const getDescription = () => {
    if (type === "smart") return "Enter your email and password. We'll automatically log you in or create a new account.";
    if (type === "login") return "Enter your credentials to access your account";
    if (type === "register") return "Enter your email and password to create a new account";
    if (type === "reset") return "Enter your email to receive a password reset link";
  };
  
  const getButtonText = () => {
    if (type === "smart") return "Continue";
    if (type === "login") return "Login";
    if (type === "register") return "Register";
    if (type === "reset") return "Send Reset Link";
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          {type !== "reset" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          )}
          
          {type === "login" && (
            <div className="text-sm text-right">
              <Link to="/reset-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : getButtonText()}
          </Button>
        </form>
      </CardContent>
      
      {type !== "smart" && (
        <CardFooter className="flex justify-center border-t pt-6">
          {type === "login" && (
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          )}
          {type === "register" && (
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          )}
          {type === "reset" && (
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default AuthForm;
