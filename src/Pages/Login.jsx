import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Chrome } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError("");
            const user = await base44.auth.signInWithGoogle();
            toast({ title: "Welcome back!", description: `Logged in as ${user.displayName}` });
            navigate("/");
        } catch (err) {
            console.error("Google Login Error:", err);
            setError("Failed to sign in with Google.");
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError("Email/Password login is currently disabled. Please use Google Sign In.");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                        JobBoard Pro
                    </h1>
                    <p className="mt-2 text-gray-500">Manage your career journey intelligently.</p>
                </div>

                <Card className="border-t-4 border-indigo-600 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl text-center">{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
                        <CardDescription className="text-center">
                            Sign in to access your dashboard and tracker
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full py-6 flex items-center gap-2 text-base font-medium hover:bg-slate-50 relative overflow-hidden group"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                        >
                            <Chrome className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                            Continue with Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                                {loading ? "Processing..." : (isLogin ? "Sign In" : "Sign Up")}
                            </Button>
                        </form>

                        <div className="text-center text-sm text-gray-500 mt-4">
                            <button
                                type="button"
                                className="underline hover:text-indigo-600"
                                onClick={() => setIsLogin(!isLogin)}
                            >
                                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
