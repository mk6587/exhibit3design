import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  type: "login" | "register" | "reset";
}

const AuthForm = ({ type }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration.",
        });
        
      } else if (type === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`,
        });
        
        if (error) throw error;
        
        toast({
          title: "Reset link sent",
          description: "Check your email for a password reset link.",
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
  
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {type === "login" && "Login to Your Account"}
          {type === "register" && "Create an Account"}
          {type === "reset" && "Reset Your Password"}
        </CardTitle>
        <CardDescription>
          {type === "login" && "Enter your credentials to access your account"}
          {type === "register" && "Enter your email and password to create a new account"}
          {type === "reset" && "Enter your email to receive a password reset link"}
        </CardDescription>
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
            {loading ? "Loading..." : (
              <>
                {type === "login" && "Login"}
                {type === "register" && "Register"}
                {type === "reset" && "Send Reset Link"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
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
    </Card>
  );
};

export default AuthForm;
