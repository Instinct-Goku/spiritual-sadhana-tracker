
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen } from "lucide-react";
import { toast } from "@/lib/toast";

const Register = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName || !email || !password || !confirmPassword || !mobileNumber) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Basic mobile number validation
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobileNumber)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    try {
      setLoading(true);
      await register(email, password, displayName, mobileNumber);
      navigate("/");
    } catch (error) {
      // Error is handled in the register function
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background decoration */}
      <div className="mandala-decoration w-96 h-96 -top-48 -left-48 opacity-5"></div>
      <div className="mandala-decoration w-96 h-96 -bottom-48 -right-48 opacity-5"></div>
      
      <Card className="w-full max-w-md spiritual-card">
        <CardHeader className="space-y-1 items-center text-center">
          <div className="h-16 w-16 bg-spiritual-purple/10 rounded-full flex items-center justify-center mb-2">
            <BookOpen className="h-8 w-8 text-spiritual-purple" />
          </div>
          <CardTitle className="text-2xl font-semibold text-spiritual-purple">Create an Account</CardTitle>
          <CardDescription>
            Enter your details to create your devotee account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                placeholder="Your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="spiritual-input"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="spiritual-input"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="mobileNumber" className="text-sm font-medium">
                Mobile Number
              </label>
              <Input
                id="mobileNumber"
                type="tel"
                placeholder="10-digit mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="spiritual-input"
                required
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="spiritual-input"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="spiritual-input"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-spiritual-purple hover:bg-spiritual-purple/90 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-spiritual-purple hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
