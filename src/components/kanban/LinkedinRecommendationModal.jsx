import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Briefcase, MapPin, Plus, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";

export default function LinkedInRecommendationsModal({ job, isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [addedProfiles, setAddedProfiles] = useState(new Set());

  useEffect(() => {
    if (isOpen && job) {
      fetchRecommendations();
    }
    
    return () => {
      setRecommendations([]);
      setAddedProfiles(new Set());
    };
  }, [isOpen, job]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setRecommendations([]);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this job application, recommend 5-7 specific LinkedIn profiles I should connect with:\n\n**Job Title:** ${job.title}\n**Company:** ${job.company}\n**Location:** ${job.location || 'Not specified'}\n**Job Description:** ${job.notes || 'Position at the company'}\n\nPlease provide LinkedIn profile recommendations for people who could help with:\n1. Recruiters at ${job.company}\n2. Current employees in ${job.title} roles at ${job.company}\n3. Hiring managers or team leads in relevant departments\n4. Industry professionals in ${job.location || 'the area'}\n5. Alumni or connections who work at ${job.company}\n\nFor each person, provide:\n- Full name\n- Current job title\n- Company (should be ${job.company} or related)\n- Location\n- Brief reason why I should connect (1-2 sentences)`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  title: { type: "string" },
                  company: { type: "string" },
                  location: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      setRecommendations(result.recommendations || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]);
    }

    setIsLoading(false);
  };

  const handleAddProfile = async (profile) => {
    try {
      const existingProfiles = await base44.entities.LinkedInProfile.filter({
        name: profile.name
      });

      if (existingProfiles.length > 0) {
        alert(`${profile.name} is already in your LinkedIn tracker!`);
        return;
      }

      await base44.entities.LinkedInProfile.create({
        name: profile.name,
        title: profile.title,
        company: profile.company,
        location: profile.location,
        notes: `Recommended for: ${job.title} at ${job.company}\n\nReason: ${profile.reason}`,
        status: "To Contact",
        date_added: new Date().toISOString().split('T')[0]
      });

      setAddedProfiles(prev => new Set([...prev, profile.name]));
    } catch (error) {
      console.error("Error adding profile:", error);
      alert("Failed to add profile. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5 text-blue-600" />
            LinkedIn Contact Recommendations
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            People you should connect with for <span className="font-semibold">{job.title}</span> at <span className="font-semibold">{job.company}</span>
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm text-gray-600">Finding relevant contacts...</p>
              <p className="text-xs text-gray-500 mt-1">This may take a moment</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recommendations found. Try again.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((profile, index) => {
                const isAdded = addedProfiles.has(profile.name);
                return (
                  <Card key={index} className="border border-gray-200 hover:border-blue-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{profile.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-blue-100 text-blue-700 text-xs">
                                <Briefcase className="w-3 h-3 mr-1" />
                                {profile.title}
                              </Badge>
                              <Badge className="bg-gray-100 text-gray-700 text-xs">{profile.company}</Badge>
                            </div>
                          </div>
                          {profile.location && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin className="w-3.5 h-3.5" />
                              {profile.location}
                            </div>
                          )}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                            <p className="text-xs font-semibold text-blue-900 mb-1">Why connect:</p>
                            <p className="text-sm text-gray-700">{profile.reason}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAddProfile(profile)}
                          disabled={isAdded}
                          className={`flex-shrink-0 ${isAdded ? 'bg-green-600 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                          {isAdded ? (
                            <><CheckCircle className="w-4 h-4 mr-2" />Added</>
                          ) : (
                            <><Plus className="w-4 h-4 mr-2" />Add to Tracker</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">These recommendations are AI-generated based on web search</p>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
