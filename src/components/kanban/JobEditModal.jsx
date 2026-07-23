import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JOB_TYPES } from "@/utils/jobTypeUtils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function JobEditModal({ job, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    job_link: "",
    deadline: "",
    notes: "",
    status: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (job && isOpen) {
      setFormData({
        title: job.title || "",
        company: job.company || "",
        location: job.location || "",
        job_link: job.job_link || "",
        deadline: job.deadline || "",
        notes: job.notes || "",
        status: job.status || "To Apply",
        job_type: job.job_type || ""
      });
    }
  }, [job, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Application</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Job Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g., Software Engineer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-company">Company *</Label>
              <Input
                id="edit-company"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                placeholder="e.g., Google"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="e.g., New York, NY"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-job-type">Job Type</Label>
              <Select
                value={formData.job_type || "Other"}
                onValueChange={(val) => handleChange("job_type", val)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.filter(t => t !== "All Types").map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-deadline">Application Deadline</Label>
              <Input
                id="edit-deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleChange("deadline", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-job-link">Job Posting URL</Label>
            <Input
              id="edit-job-link"
              type="url"
              value={formData.job_link}
              onChange={(e) => handleChange("job_link", e.target.value)}
              placeholder="https://company.com/careers/job-id"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Add any additional notes about this application..."
              className="h-24"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !formData.title || !formData.company}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
