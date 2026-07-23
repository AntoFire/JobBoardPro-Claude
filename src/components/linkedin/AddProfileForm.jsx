import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader2, Link2, MapPin, Building2, Briefcase } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AddProfileForm({ onProfileAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    company: "",
    location: "",
    profile_url: "",
    status: "To Contact"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);
    try {
      const newProfile = {
        ...formData,
        date_added: new Date().toISOString().split('T')[0]
      };

      await base44.entities.LinkedInProfile.create(newProfile);

      setFormData({
        name: "",
        title: "",
        company: "",
        location: "",
        profile_url: "",
        status: "To Contact"
      });
      setIsOpen(false);
      if (onProfileAdded) onProfileAdded();
    } catch (error) {
      console.error("Failed to add profile:", error);
      alert("Failed to add profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full h-12 border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:bg-white hover:text-blue-600 hover:border-blue-300 transition-all"
        variant="ghost"
      >
        <UserPlus className="w-5 h-5 mr-2" />
        Add New LinkedIn Profile
      </Button>
    );
  }

  return (
    <Card className="border border-blue-100 shadow-sm bg-white overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600" />
              Add New Contact
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} type="button">Cancel</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="e.g. Sarah Smith" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <div className="relative">
                <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input id="title" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="e.g. Senior Recruiter" className="pl-9" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <div className="relative">
                <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input id="company" value={formData.company} onChange={(e) => handleChange("company", e.target.value)} placeholder="e.g. Tech Corp" className="pl-9" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input id="location" value={formData.location} onChange={(e) => handleChange("location", e.target.value)} placeholder="e.g. New York, NY" className="pl-9" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile_url">LinkedIn URL</Label>
              <div className="relative">
                <Link2 className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input id="profile_url" value={formData.profile_url} onChange={(e) => handleChange("profile_url", e.target.value)} placeholder="https://linkedin.com/in/..." className="pl-9" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Contact">To Contact</SelectItem>
                  <SelectItem value="Connected">Connected</SelectItem>
                  <SelectItem value="Messaged">Messaged</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting || !formData.name}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : "Add Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
