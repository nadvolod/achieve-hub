
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormValues = z.infer<typeof authSchema>;

const Auth = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const { signInWithEmail, signUpWithEmail, user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    // If user is already logged in, redirect to home page
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onSubmit = async (data: AuthFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    setAuthSuccess(null);
    
    try {
      if (isLogin) {
        await signInWithEmail(data.email, data.password);
      } else {
        // Handle signup with improved return values
        const result = await signUpWithEmail(data.email, data.password);
        if (!result.success) {
          setAuthError(result.message);
        } else {
          setAuthSuccess(result.message);
          form.reset();
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      setAuthError(error.message || "An error occurred during authentication");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-navy-500">Daily Dreamer</CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Sign in to access your reflections" : "Create an account to start your journey"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your.email@example.com" 
                        type="email" 
                        disabled={isSubmitting} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••••" 
                        type="password" 
                        disabled={isSubmitting} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {authError && (
                <div className="p-3 text-sm font-medium text-white bg-red-500 rounded-md">
                  {authError}
                </div>
              )}
              {authSuccess && (
                <div className="p-3 text-sm font-medium text-white bg-green-500 rounded-md">
                  {authSuccess}
                </div>
              )}
              <Button 
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  isLogin ? "Sign in" : "Create account"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col space-y-2">
          <Button 
            variant="link" 
            className="w-full" 
            onClick={() => {
              setIsLogin(!isLogin);
              setAuthError(null);
              setAuthSuccess(null);
              form.reset();
            }} 
            disabled={isSubmitting}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Button>
          <p className="text-center text-xs text-gray-500">
            By {isLogin ? "signing in" : "signing up"}, you agree to our Terms and Privacy Policy
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
