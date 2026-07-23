import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

export default function SkillsSection({ skills, onAdd, onRemove }) {
    const [newSkill, setNewSkill] = useState("");

    const handleAdd = () => {
        if (newSkill.trim()) {
            onAdd(newSkill.trim());
            setNewSkill("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Skills</Label>
            <div className="flex gap-2">
                <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyPress={handleKeyPress} placeholder="Add a skill..." className="h-9 bg-white" />
                <Button type="button" onClick={handleAdd} disabled={!newSkill.trim()} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[40px]">
                {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 pr-1 py-1">
                        {skill}
                        <button type="button" onClick={() => onRemove(skill)} className="ml-1.5 hover:bg-indigo-200 rounded-full p-0.5 transition-colors">
                            <X className="w-3 h-3" />
                        </button>
                    </Badge>
                ))}
                {skills.length === 0 && (
                    <span className="text-xs text-gray-400 italic py-1">No skills added yet.</span>
                )}
            </div>
        </div>
    );
}
