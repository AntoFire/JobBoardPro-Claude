import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GraduationCap, Plus, Trash2, Edit2, Save, X, BookOpen, Calendar } from "lucide-react";

const EducationItem = ({ edu, index, onUpdate, onRemove }) => {
    const [isEditing, setIsEditing] = useState(!edu.degree || !edu.institution);

    const handleSave = () => setIsEditing(false);

    if (isEditing) {
        return (
            <Card className="bg-white border-indigo-100 shadow-md ring-1 ring-indigo-50 transition-all">
                <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-indigo-900 bg-indigo-50 px-2 py-1 rounded">Editing Education {index + 1}</h4>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 font-medium">DEGREE</Label>
                            <Input value={edu.degree} onChange={(e) => onUpdate(index, "degree", e.target.value)} placeholder="e.g. Bachelor of Science" className="h-9 bg-gray-50/50" autoFocus />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 font-medium">INSTITUTION</Label>
                            <Input value={edu.institution} onChange={(e) => onUpdate(index, "institution", e.target.value)} placeholder="e.g. University of Technology" className="h-9 bg-gray-50/50" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500 font-medium">FIELD OF STUDY</Label>
                            <Input value={edu.field_of_study} onChange={(e) => onUpdate(index, "field_of_study", e.target.value)} placeholder="e.g. Computer Science" className="h-9 bg-gray-50/50" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500 font-medium">START YEAR</Label>
                                <Input type="number" value={edu.start_year} onChange={(e) => onUpdate(index, "start_year", e.target.value)} placeholder="2018" className="h-9 bg-gray-50/50" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500 font-medium">END YEAR</Label>
                                <Input type="number" value={edu.end_year} onChange={(e) => onUpdate(index, "end_year", e.target.value)} placeholder="2022" className="h-9 bg-gray-50/50" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <Label className="text-sm font-semibold text-gray-700">Description</Label>
                        <Textarea
                            value={edu.description}
                            onChange={(e) => onUpdate(index, "description", e.target.value)}
                            placeholder="Notable achievements, activities, or societies..."
                            className="min-h-[120px] bg-white border-gray-200 text-sm leading-relaxed resize-y shadow-sm"
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
                        <h3 className="text-lg font-bold text-gray-900 leading-snug">{edu.degree || "Untitled Degree"}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5 font-medium text-indigo-700">
                                <GraduationCap className="w-4 h-4" />{edu.institution || "Unknown Institution"}
                            </span>
                            {edu.field_of_study && (
                                <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-gray-400" />{edu.field_of_study}</span>
                            )}
                            {(edu.start_year || edu.end_year) && (
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" />{edu.start_year || "?"} - {edu.end_year || "Present"}</span>
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
                {edu.description && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{edu.description}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default function EducationSection({ education, onAdd, onRemove, onUpdate }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Education</h2>
                        <p className="text-xs text-gray-500">Manage your academic background</p>
                    </div>
                </div>
                <Button type="button" onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />Add Education
                </Button>
            </div>

            {education.length === 0 ? (
                <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                            <GraduationCap className="w-6 h-6 text-slate-300" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900">No education added</h3>
                        <p className="text-xs text-gray-500 max-w-xs mt-1 mb-4">Adding your education background helps recruiters understand your qualifications.</p>
                        <Button variant="outline" onClick={onAdd} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">Add your first degree</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {education.map((edu, index) => (
                        <EducationItem key={index} edu={edu} index={index} onUpdate={onUpdate} onRemove={onRemove} />
                    ))}
                </div>
            )}
        </div>
    );
}
