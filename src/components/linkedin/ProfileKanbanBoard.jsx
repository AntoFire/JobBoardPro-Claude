import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ProfileCard from "./ProfileCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronRight } from "lucide-react";

const STATUSES = [
  { id: "To Contact", label: "To Contact", color: "bg-gray-100 text-gray-700" },
  { id: "Connected", label: "Connected", color: "bg-green-100 text-green-700" },
  { id: "Messaged", label: "Messaged", color: "bg-blue-100 text-blue-700" },
  { id: "Follow-up", label: "Follow-up", color: "bg-yellow-100 text-yellow-700" },
  { id: "Meeting Scheduled", label: "Meeting Scheduled", color: "bg-purple-100 text-purple-700" },
  { id: "Responded", label: "Responded", color: "bg-indigo-100 text-indigo-700" },
  { id: "Not Interested", label: "Not Interested", color: "bg-red-100 text-red-700" }
];

export default function ProfileKanbanBoard({ profiles, onProfileMove, onProfileDelete, onColumnDelete }) {
  const [collapsedCompanies, setCollapsedCompanies] = useState({});

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    onProfileMove(draggableId, destination.droppableId);
  };

  const getProfilesByStatus = (status) => {
    return profiles.filter(profile => profile.status === status);
  };

  const groupProfilesByCompany = (statusProfiles) => {
    const grouped = {};
    statusProfiles.forEach(profile => {
      const company = profile.company || "Unknown Company";
      if (!grouped[company]) grouped[company] = [];
      grouped[company].push(profile);
    });
    return grouped;
  };

  const handleColumnDelete = (status, profileCount) => {
    if (profileCount === 0) {
      alert(`No profiles in "${status}" to delete.`);
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${profileCount} profile(s) from "${status}"?\n\nThis action cannot be undone.`
    );
    if (confirmed) onColumnDelete(status);
  };

  const toggleCompanyCollapse = (statusId, company) => {
    const key = `${statusId}-${company}`;
    setCollapsedCompanies(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 px-1">
        {STATUSES.map((status) => {
          const statusProfiles = getProfilesByStatus(status.id);
          const groupedProfiles = groupProfilesByCompany(statusProfiles);
          const companies = Object.keys(groupedProfiles);

          return (
            <div key={status.id} className="flex-shrink-0 w-80">
              <div className="mb-3 flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{status.label}</h3>
                  <Badge className={`${status.color} border-none`}>{statusProfiles.length}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleColumnDelete(status.label, statusProfiles.length)}
                  className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <Droppable droppableId={status.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] bg-gray-50 rounded-lg p-3 space-y-3 transition-colors ${
                      snapshot.isDraggingOver ? "bg-blue-50 ring-2 ring-blue-200" : ""
                    }`}
                  >
                    {companies.length === 0 && !snapshot.isDraggingOver ? (
                      <div className="text-center py-8 text-sm text-gray-400">No profiles yet</div>
                    ) : (
                      companies.map((company) => {
                        const companyProfiles = groupedProfiles[company];
                        const isCollapsed = collapsedCompanies[`${status.id}-${company}`];

                        return (
                          <div key={company} className="space-y-2">
                            {companyProfiles.length > 1 && (
                              <button
                                onClick={() => toggleCompanyCollapse(status.id, company)}
                                className="w-full flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                              >
                                {isCollapsed ? <ChevronRight className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                <span className="font-medium text-sm text-gray-700">{company}</span>
                                <Badge variant="secondary" className="ml-auto text-xs">{companyProfiles.length}</Badge>
                              </button>
                            )}

                            {(!isCollapsed || companyProfiles.length === 1) && (
                              <div className="space-y-3">
                                {companyProfiles.map((profile) => {
                                  const globalIndex = statusProfiles.findIndex(p => p.id === profile.id);
                                  return (
                                    <Draggable key={profile.id} draggableId={profile.id} index={globalIndex}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={snapshot.isDragging ? "opacity-50" : ""}
                                        >
                                          <ProfileCard profile={profile} onDelete={onProfileDelete} />
                                        </div>
                                      )}
                                    </Draggable>
                                  );
                                })}
                              </div>
                            )}

                            {isCollapsed && companyProfiles.length > 1 && (
                              <div className="text-xs text-gray-400 text-center py-2">
                                {companyProfiles.length} profiles hidden
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
