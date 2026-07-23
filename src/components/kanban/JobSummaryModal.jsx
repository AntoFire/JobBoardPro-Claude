import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Trash2, Edit, MapPin, Calendar, Clock, Save, X } from "lucide-react";
import { getFollowUpCheck } from "@/utils/reminderUtils";

const STATUS_COLORS = {
  "To Apply": "bg-gray-100 text-gray-700",
  "Applied": "bg-blue-100 text-blue-700",
  "Interview": "bg-purple-100 text-purple-700",
  "Offer": "bg-green-100 text-green-700",
  "Rejected": "bg-red-100 text-red-700",
};

const JOB_TYPE_COLORS = {
  CDI: "bg-blue-50 text-blue-700 border-blue-200",
  CDD: "bg-orange-50 text-orange-700 border-orange-200",
  Alternance: "bg-purple-50 text-purple-700 border-purple-200",
  Stage: "bg-green-50 text-green-700 border-green-200",
  Freelance: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export default function JobSummaryModal({ job, isOpen, onClose, onEdit, onDelete, onUpdate }) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(job?.notes || "");

  const handleSaveNotes = () => {
    onUpdate(job.id, { notes });
    setEditingNotes(false);
  };

  const handleCancelNotes = () => {
    setNotes(job?.notes || "");
    setEditingNotes(false);
  };

  if (!job) return null;

  const reminder = getFollowUpCheck(job);
  const statusColor = STATUS_COLORS[job.status] || "bg-gray-100 text-gray-700";
  const jobTypeColor = JOB_TYPE_COLORS[job.job_type] || "bg-gray-50 text-gray-600 border-gray-200";

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">
                {job.title}
              </DialogTitle>
              <p className="text-sm font-medium text-indigo-600 mt-1">{job.company}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0 pt-1">
              {job.job_link && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(job.job_link, "_blank")}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Post
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Badges row */}
          <div className="flex flex-wrap gap-2">
            <Badge className={`${statusColor} border-none`}>
              {job.status === "To Apply" ? "Wishlist" : job.status}
            </Badge>
            {job.job_type && job.job_type !== "Other" && (
              <Badge variant="outline" className={`border ${jobTypeColor}`}>
                {job.job_type}
              </Badge>
            )}
            {reminder && (
              <Badge variant="outline" className={`border ${reminder.color} flex items-center gap-1`}>
                <span>⏰</span> {reminder.label}
              </Badge>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {job.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{job.location}</span>
              </div>
            )}
            {job.created_date && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Added {formatDate(job.created_date)}</span>
              </div>
            )}
            {job.deadline && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Deadline {formatDate(job.deadline)}</span>
              </div>
            )}
          </div>

          {/* Notes section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Notes</span>
              {!editingNotes && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setNotes(job.notes || ""); setEditingNotes(true); }}
                  className="h-7 text-xs text-gray-500 hover:text-gray-700"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            {editingNotes ? (
              <div className="space-y-2">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  className="h-28 text-sm"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={handleCancelNotes}>
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveNotes} className="bg-indigo-600 hover:bg-indigo-700">
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => { setNotes(job.notes || ""); setEditingNotes(true); }}
                className={`min-h-[60px] p-3 rounded-lg border text-sm cursor-pointer transition-colors ${
                  job.notes
                    ? "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                    : "border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500"
                }`}
              >
                {job.notes || "Click to add notes..."}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button
              size="sm"
              onClick={onEdit}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
