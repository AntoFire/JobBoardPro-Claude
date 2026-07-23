import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Trash2, Edit, MapPin, Building2, Calendar, GripVertical, CheckCircle2, ExternalLink } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import JobSummaryModal from "./JobSummaryModal";
import JobEditModal from "./JobEditModal";
import { getFollowUpCheck } from "@/utils/reminderUtils";

export default function JobCard({ job, onDelete, onUpdate, isSelectionMode, isSelected, onToggleSelect }) {
    const [showSummary, setShowSummary] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'To Apply': return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
            case 'Applied': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
            case 'Interview': return 'bg-purple-100 text-purple-700 hover:bg-purple-200';
            case 'Offer': return 'bg-green-100 text-green-700 hover:bg-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 hover:bg-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const reminder = getFollowUpCheck(job);

    const getJobTypeColor = (type) => {
        switch (type) {
            case 'CDI': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'CDD': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'Alternance': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Stage': return 'bg-green-50 text-green-700 border-green-200';
            case 'Freelance': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    return (
        <>
            <Card
                className={`group relative hover:shadow-md transition-all duration-200 border-l-4 cursor-pointer
          ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/10' : 'border-l-transparent hover:border-l-indigo-500'}
        `}
                onClick={(e) => {
                    if (isSelectionMode) {
                        onToggleSelect(job.id, e);
                    } else {
                        setShowSummary(true);
                    }
                }}
            >
                <CardContent className="p-3 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                            {isSelectionMode && (
                                <div onClick={(e) => e.stopPropagation()} className="pt-0.5">
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => onToggleSelect(job.id)}
                                    />
                                </div>
                            )}

                            <div className="space-y-0.5 min-w-0">
                                <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate pr-2" title={job.title}>
                                    {job.title}
                                </h4>
                                <div className="flex items-center text-xs text-gray-500 gap-1 truncate">
                                    <Building2 className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate" title={job.company}>{job.company}</span>
                                </div>
                            </div>
                        </div>

                        {!isSelectionMode && (
                            <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                                {job.job_link && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-indigo-600"
                                        onClick={() => window.open(job.job_link, '_blank')}
                                        title="Open Job Posting"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setShowEdit(true)}>
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onDelete(job.id)}
                                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center text-gray-400 gap-1">
                            {job.location && (
                                <div className="flex items-center gap-0.5" title={job.location}>
                                    <MapPin className="w-3 h-3" />
                                    <span className="max-w-[80px] truncate">{job.location}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`text-[10px] px-1.5 h-5 font-medium border-none ${getStatusColor(job.status)}`}>
                                {job.status === 'To Apply' ? 'Wishlist' : job.status}
                            </Badge>
                            <div className="flex items-center text-gray-400" title={`Created: ${new Date(job.created_date).toLocaleDateString()}`}>
                                <Calendar className="w-3 h-3 mr-1" />
                                <span>{formatDate(job.created_date)}</span>
                            </div>
                        </div>
                    </div>

                    {job.job_type && job.job_type !== "Other" && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="outline" className={`text-[10px] px-2 py-0 h-5 font-normal border ${getJobTypeColor(job.job_type)}`}>
                                {job.job_type}
                            </Badge>
                        </div>
                    )}

                    {reminder && (
                        <div className="mt-2">
                            <Badge variant="outline" className={`text-[10px] px-2 py-0 h-5 font-medium border flex items-center gap-1 w-fit ${reminder.color}`}>
                                <span>⏰</span> {reminder.label}
                            </Badge>
                        </div>
                    )}

                    {job.tags && job.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {job.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-[10px] px-1 h-5 text-gray-500">
                                    {tag}
                                </Badge>
                            ))}
                            {job.tags.length > 2 && (
                                <span className="text-[10px] text-gray-400">+{job.tags.length - 2}</span>
                            )}
                        </div>
                    )}

                </CardContent>
            </Card>

            {showSummary && (
                <JobSummaryModal
                    job={job}
                    isOpen={showSummary}
                    onClose={() => setShowSummary(false)}
                    onEdit={() => {
                        setShowSummary(false);
                        setShowEdit(true);
                    }}
                    onDelete={() => {
                        onDelete(job.id);
                        setShowSummary(false);
                    }}
                    onUpdate={onUpdate}
                />
            )}

            {showEdit && (
                <JobEditModal
                    job={job}
                    isOpen={showEdit}
                    onClose={() => setShowEdit(false)}
                    onSave={(data) => {
                        onUpdate(job.id, data);
                        setShowEdit(false);
                    }}
                />
            )}
        </>
    );
}
