
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, ExternalLink, Trash2, Calendar, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import IceBreakerModal from "./IcebreakerModal";

export default function ProfileCard({ profile, onDelete }) {
  const [isIceBreakerOpen, setIsIceBreakerOpen] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${profile.name}"?`)) {
      onDelete(profile.id);
    }
  };

  const handleIceBreaker = (e) => {
    e.stopPropagation();
    setIsIceBreakerOpen(true);
  };

  return (
    <>
      <Card className="bg-white hover:shadow-md transition-shadow duration-200 cursor-grab active:cursor-grabbing group">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2">{profile.name}</h3>
              {profile.title && (
                <p className="text-sm text-gray-600 line-clamp-1">{profile.title}</p>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleIceBreaker}
                className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                title="Generate ice breaker message"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {profile.company && (
            <div className="flex items-center gap-1.5 text-sm text-blue-600 font-medium">
              <Briefcase className="w-3.5 h-3.5" />
              <span className="line-clamp-1">{profile.company}</span>
            </div>
          )}

          {profile.location && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="w-3.5 h-3.5" />
              <span className="line-clamp-1">{profile.location}</span>
            </div>
          )}

          {profile.date_added && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1 border-t border-gray-100">
              <Calendar className="w-3.5 h-3.5" />
              <span>Added: {format(new Date(profile.date_added), "MMM d, yyyy")}</span>
            </div>
          )}

          {profile.last_contact && (
            <div className="text-xs text-gray-600">
              Last contact: {format(new Date(profile.last_contact), "MMM d, yyyy")}
            </div>
          )}

          {profile.notes && (
            <p className="text-xs text-gray-600 line-clamp-2 pt-1 border-t border-gray-100">{profile.notes}</p>
          )}

          {(profile.profile_link || profile.profile_url) && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 h-8 text-xs gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
              asChild
            >
              <a
                href={profile.profile_link || profile.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View LinkedIn Profile
              </a>
            </Button>
          )}
        </CardContent>
      </Card>

      <IceBreakerModal
        profile={profile}
        isOpen={isIceBreakerOpen}
        onClose={() => setIsIceBreakerOpen(false)}
      />
    </>
  );
}
