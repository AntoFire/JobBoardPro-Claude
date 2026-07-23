import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Key, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export default function MyApiKey() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleCopyKey = () => {
    if (user?.api_key) {
      navigator.clipboard.writeText(user.api_key);
      setCopied(true);
      toast({ title: "API key copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateApiKey = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'sk_';
    for (let i = 0; i < 48; i++) {
      key += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return key;
  };

  const handleGenerateKey = async () => {
    setGenerating(true);
    try {
      const newKey = generateApiKey();
      await base44.auth.updateMe({ api_key: newKey });
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      toast({ title: "API key generated!", description: "Your new API key is ready." });
    } catch (error) {
      console.error("Failed to generate API key:", error);
      toast({ title: "Error", description: "Failed to generate API key.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My API Key</h1>
              <p className="text-gray-600">Manage your API access key</p>
            </div>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Your API Key</CardTitle>
            <CardDescription>
              Use this key to access the API securely
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <code className="text-sm font-mono text-slate-700 break-all flex-1">
                  {user?.api_key || "No API key available"}
                </code>
                <div className="flex gap-2 flex-shrink-0">
                  {!user?.api_key && (
                    <Button onClick={handleGenerateKey} disabled={generating} size="sm">
                      {generating ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Generating...</>
                      ) : (
                        <><Key className="w-4 h-4 mr-2" />Generate</>
                      )}
                    </Button>
                  )}
                  {user?.api_key && (
                    <Button onClick={handleCopyKey} variant="outline" size="sm">
                      {copied ? (
                        <><CheckCircle className="w-4 h-4 mr-2" />Copied!</>
                      ) : (
                        <><Copy className="w-4 h-4 mr-2" />Copy</>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Keep this key confidential. Never share it publicly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
