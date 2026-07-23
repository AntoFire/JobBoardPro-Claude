import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Briefcase, Plus, Trash2, Edit2, MapPin, Calendar, Building2, Save, X } from "lucide-react";
import { format } from "date-fns";

const ExperienceItem = ({ exp, index, onUpdate, onRemove }) => {
    const [isEditing, setIsEditing] = useState(!exp.title || exp.title === "Position Detected" || exp.title === "Role");

    const handleSave = () => setIsEditing(false);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try { return format(new Date(dateStr), "MMM yyyy"); }
        catch (e) { return dateStr; }
    };

    if (isEditing) {
        return (
            <Card className="bg-white border-indigo-100 shadow-md ring-1 ring-indigo-50 transition-all">
                <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-indigo-900 bg-indigo-50 px-2 py-1 rounded">Editing Position {index + 1}</h4>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 font-medium">JOB TITLE</Label>
                            <Input value={exp.title} onChange={(e) => onUpdate(index, "title", e.target.value)} placeholder="e.g. Senior Software Engineer" className="h-9 bg-gray-50/50" autoFocus />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 font-medium">COMPANY</Label>
                            <Input value={exp.company} onChange={(e) => onUpdate(index, "company", e.target.value)} placeholder="e.g. Tech Corp" className="h-9 bg-gray-50/50" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2 space-y-1">
                            <Label className="text-xs text-gray-500 font-medium">LOCATION</Label>
                            <Input value={exp.location} onChange={(e) => onUpdate(index, "location", e.target.value)} placeholder="City, Country" className="h-9 bg-gray-50/50" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 font-medium">START DATE</Label>
                            <Input type="month" value={exp.start_date} onChange={(e) => onUpdate(index, "start_date", e.target.value)} className="h-9 bg-gray-50/50 text-xs" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 font-medium">END DATE</Label>
                            <Input type="month" value={exp.end_date} onChange={(e) => onUpdate(index, "end_date", e.target.value)} disabled={exp.current} className="h-9 bg-gray-50/50 text-xs" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox id={`current-${index}`} checked={exp.current} onCheckedChange={(checked) => onUpdate(index, "current", checked)} className="h-3.5 w-3.5" />
                        <label htmlFor={`current-${index}`} className="text-xs text-gray-600 cursor-pointer select-none">I currently work here</label>
                    </div>

                    <div className="space-y-2 pt-2">
                        <Label className="text-sm font-semibold text-gray-700">Description</Label>
                        <Textarea
                            value={exp.description}
                            onChange={(e) => onUpdate(index, "description", e.target.value)}
                            placeholder="• Describe your key responsibilities...&#10;• Highlighting achievements..."
                            className="min-h-[200px] bg-white border-gray-200 text-sm leading-relaxed resize-y shadow-sm focus:border-indigo-300 focus:ring-indigo-100"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                            <Save className="w-4 h-4 mr-2" />Done Editing
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                        <h3 className="text-lg font-bold text-gray-900 leading-snug">{exp.title || "Untitled Position"}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5 font-medium text-indigo-700">
                                <Building2 className="w-4 h-4" />{exp.company || "Unknown Company"}
                            </span>
                            {(exp.start_date || exp.end_date) && (
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                    {formatDate(exp.start_date)} - {exp.current ? "Present" : formatDate(exp.end_date)}
                                </span>
                            )}
                            {exp.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />{exp.location}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pt-1 pl-4">
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onRemove(index)} className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                {exp.description && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default function ExperienceSection({ experience, onAdd, onRemove, onUpdate }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Professional Experience</h2>
                        <p className="text-xs text-gray-500">Manage your career history</p>
                    </div>
                </div>
                <Button type="button" onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />Add Experience
                </Button>
            </div>

            {experience.length === 0 ? (
                <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                            <Briefcase className="w-6 h-6 text-slate-300" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900">No experience added</h3>
                        <p className="text-xs text-gray-500 max-w-xs mt-1 mb-4">Adding your work history helps us match you with the right job opportunities.</p>
                        <Button variant="outline" onClick={onAdd} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">Add your first position</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {experience.map((exp, index) => (
                        <ExperienceItem key={index} exp={exp} index={index} onUpdate={onUpdate} onRemove={onRemove} />
                    ))}
                </div>
            )}
        </div>
    );
}
