
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface AuthFormProps {
  type: "login" | "register" | "reset";
}

const AuthForm = ({ type }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle auth logic here
    console.log({ type, email, password, name, confirmPassword });
  };
  
  const handleGoogleAuth = () => {
    // Handle Google auth
    console.log("Google auth clicked");
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
          {type === "register" && "Fill in your details to create a new account"}
          {type === "reset" && "Enter your email to receive a password reset link"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
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
          
          {type === "register" && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
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
          
          <Button type="submit" className="w-full">
            {type === "login" && "Login"}
            {type === "register" && "Register"}
            {type === "reset" && "Send Reset Link"}
          </Button>
          
          {type !== "reset" && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleAuth}
              >
                Google
              </Button>
            </>
          )}
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
