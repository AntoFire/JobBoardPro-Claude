import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import JobCard from "./JobCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, ChevronDown, ChevronRight, CheckSquare, X, MoveRight, Briefcase, UserCheck, CheckCircle, XCircle } from "lucide-react";

const STATUSES = [
  { id: "To Apply", label: "Wishlist", color: "bg-gray-100 text-gray-700" },
  { id: "Applied", label: "Applied", color: "bg-blue-100 text-blue-700" },
  { id: "Interview", label: "Interview", color: "bg-purple-100 text-purple-700" },
  { id: "Offer", label: "Offer", color: "bg-green-100 text-green-700" },
  { id: "Rejected", label: "Rejected", color: "bg-red-100 text-red-700" }
];

export default function KanbanBoard({ jobs, onJobMove, onJobDelete, onJobUpdate, onColumnDelete }) {
  const [collapsedCompanies, setCollapsedCompanies] = useState({});
  const [collapsedDates, setCollapsedDates] = useState({});
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState([]);

  const toggleDateCollapse = (statusId, dateKey) => {
    const key = `${statusId}-${dateKey}`;
    setCollapsedDates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedJobs([]);
  };

  const lastSelectedJobId = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSelectionMode) {
        if (e.key === 'Escape') {
          toggleSelectionMode();
        } else if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
          e.preventDefault();
          const allJobIds = jobs.map(j => j.id);
          setSelectedJobs(allJobIds);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelectionMode, jobs]);

  const toggleSelectJob = (jobId, event) => {
    if (event && event.shiftKey && lastSelectedJobId.current && isSelectionMode) {
      const lastIndex = jobs.findIndex(j => j.id === lastSelectedJobId.current);
      const currentIndex = jobs.findIndex(j => j.id === jobId);

      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const rangeIds = jobs.slice(start, end + 1).map(j => j.id);

        setSelectedJobs(prev => [...new Set([...prev, ...rangeIds])]);
        return;
      }
    }

    lastSelectedJobId.current = jobId;

    setSelectedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleBulkMove = (newStatus) => {
    if (selectedJobs.length === 0) return;
    selectedJobs.forEach(id => onJobMove(id, newStatus));
    setTimeout(() => {
      toggleSelectionMode();
    }, 100);
  };

  const handleBulkDelete = () => {
    if (selectedJobs.length === 0) return;
    selectedJobs.forEach(id => onJobDelete(id));
    toggleSelectionMode();
  };

  const handleSelectAllInColumn = (statusId) => {
    const jobsInColumn = getJobsByStatus(statusId);
    const ids = jobsInColumn.map(j => j.id);

    setSelectedJobs(prev => {
      const allSelected = ids.every(id => prev.includes(id));
      if (allSelected) {
        return prev.filter(id => !ids.includes(id));
      } else {
        return [...new Set([...prev, ...ids])];
      }
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const jobId = draggableId;
    const newStatus = destination.droppableId;

    if (isSelectionMode && selectedJobs.includes(jobId)) {
      selectedJobs.forEach(id => onJobMove(id, newStatus));
      setTimeout(() => {
        toggleSelectionMode();
      }, 100);
    } else {
      onJobMove(jobId, newStatus);
    }
  };

  const getJobsByStatus = (status) => {
    return (jobs || []).filter(job => job.status === status);
  };

  const handleColumnDelete = (status, jobCount) => {
    if (jobCount === 0) {
      alert(`No jobs in "${status}" to delete.`);
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${jobCount} job(s) from "${status}" ?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      onColumnDelete(status);
    }
  };

  const toggleCompanyCollapse = (statusId, company) => {
    const key = `${statusId} -${company} `;
    setCollapsedCompanies(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="text-sm text-gray-500">
          {isSelectionMode ? (
            <span className="font-medium text-indigo-600">{selectedJobs.length} selected</span>
          ) : (
            "Drag and drop to move jobs"
          )}
        </div>
        <Button
          variant={isSelectionMode ? "secondary" : "outline"}
          size="sm"
          onClick={toggleSelectionMode}
          className="gap-2"
        >
          {isSelectionMode ? (
            <>
              <X className="w-4 h-4" />
              Cancel Selection
            </>
          ) : (
            <>
              <CheckSquare className="w-4 h-4" />
              Select Jobs
            </>
          )}
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-24 px-1">
          {STATUSES.map((status) => {
            const statusJobs = getJobsByStatus(status.id);

            const jobsByDate = statusJobs.reduce((acc, job) => {
              const dateKey = new Date(job.created_date).toISOString().split('T')[0];
              if (!acc[dateKey]) acc[dateKey] = [];
              acc[dateKey].push(job);
              return acc;
            }, {});

            const sortedDates = Object.keys(jobsByDate).sort((a, b) => new Date(b) - new Date(a));

            return (
              <div key={status.id} className="flex-shrink-0 w-80">
                <div className="mb-3 flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2">
                    {isSelectionMode && (
                      <Checkbox
                        checked={statusJobs.length > 0 && statusJobs.every(j => selectedJobs.includes(j.id))}
                        onCheckedChange={() => handleSelectAllInColumn(status.id)}
                      />
                    )}
                    <h3 className="font-semibold text-gray-900">{status.label}</h3>
                    <Badge className={`${status.color} border-none`}>
                      {statusJobs.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleColumnDelete(status.label, statusJobs.length)}
                    className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    title={`Delete all jobs in ${status.label} `}
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
                        snapshot.isDraggingOver ? "bg-indigo-50 ring-2 ring-indigo-200" : ""
                      } `}
                    >
                      {statusJobs.length === 0 && !snapshot.isDraggingOver ? (
                        <div className="text-center py-8 text-sm text-gray-400">
                          Drop applications here
                        </div>
                      ) : sortedDates.map((dateKey) => {
                        const dateJobs = jobsByDate[dateKey];
                        const displayDate = new Date(dateKey).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
                        const isToday = new Date(dateKey).toDateString() === new Date().toDateString();
                        const isYesterday = new Date(dateKey).toDateString() === new Date(Date.now() - 86400000).toDateString();
                        const headerLabel = isToday ? "Today" : isYesterday ? "Yesterday" : displayDate;

                        const collapseKey = `${status.id}-${dateKey}`;
                        const isCollapsed = collapsedDates[collapseKey];

                        return (
                          <div key={dateKey} className="space-y-2">
                            <div
                              className="flex items-center gap-2 px-1 pt-2 pb-1 cursor-pointer group/header"
                              onClick={() => toggleDateCollapse(status.id, dateKey)}
                            >
                              <div className="h-px bg-gray-200 flex-1 group-hover/header:bg-gray-300 transition-colors"></div>
                              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1 group-hover/header:text-gray-600 transition-colors select-none">
                                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                {headerLabel}
                                {isCollapsed && <span className="ml-1 text-gray-400">({dateJobs.length})</span>}
                              </span>
                              <div className="h-px bg-gray-200 flex-1 group-hover/header:bg-gray-300 transition-colors"></div>
                            </div>

                            {!isCollapsed && (
                              <div className="space-y-3">
                                {dateJobs.map((job, index) => {
                                  const globalIndex = statusJobs.findIndex(j => j.id === job.id);

                                  return (
                                    <Draggable key={job.id} draggableId={job.id} index={globalIndex}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={snapshot.isDragging ? "opacity-50" : ""}
                                        >
                                          <JobCard
                                            job={job}
                                            onDelete={onJobDelete}
                                            onUpdate={onJobUpdate}
                                            isSelectionMode={isSelectionMode}
                                            isSelected={selectedJobs.includes(job.id)}
                                            onToggleSelect={toggleSelectJob}
                                          />
                                        </div>
                                      )}
                                    </Draggable>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                      }

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {isSelectionMode && selectedJobs.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-[90%] max-w-2xl flex items-center justify-between z-50 animate-in slide-in-from-bottom-10 fade-in">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-900">{selectedJobs.length} selected</span>
            <div className="h-6 w-px bg-gray-200"></div>
            <Button
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleBulkDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 mr-2">Move to:</span>

            <Button size="sm" variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200" onClick={() => handleBulkMove("Applied")}>
              Applied
            </Button>

            <Button size="sm" variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200" onClick={() => handleBulkMove("Interview")}>
              Interview
            </Button>

            <Button size="sm" variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200" onClick={() => handleBulkMove("Offer")}>
              Offer
            </Button>

            <Button size="sm" variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200" onClick={() => handleBulkMove("Rejected")}>
              Rejected
            </Button>
          </div>
        </div>
      )}
    </div >
  );
}
