import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Upload, Loader2, Sparkles, X, Plus } from "lucide-react";
import SkillsSection from "./SkillsSection";

export default function ProfileSidebar({
    user,
    formData,
    setFormData,
    handleCVUpload,
    isUploadingCV,
    uploadProgress,
    industryOptions,
    onAddSkill,
    onRemoveSkill,
    onAddCertification,
    onRemoveCertification
}) {
    const [newCertification, setNewCertification] = React.useState("");

    const handleAddCert = () => {
        if (newCertification.trim()) {
            onAddCertification(newCertification.trim());
            setNewCertification("");
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-md bg-white overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <CardContent className="px-6 pb-6 -mt-12 relative">
                    <div className="flex justify-between items-end mb-4">
                        <div className="w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center p-1">
                            <div className="w-full h-full bg-indigo-50 rounded-lg flex items-center justify-center">
                                <User className="w-10 h-10 text-indigo-400" />
                            </div>
                        </div>
                        <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                            {user?.role === 'admin' ? 'Administrator' : 'Student'}
                        </Badge>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{user?.full_name}</h2>
                    <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
                </CardContent>
            </Card>

            <Card className="border border-indigo-100 shadow-sm bg-indigo-50/50">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <h3 className="font-semibold text-sm text-indigo-900">Auto-fill with AI</h3>
                    </div>
                    <p className="text-xs text-indigo-700/80">Upload your resume to automatically populate your profile.</p>
                    <div className="flex gap-2">
                        <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleCVUpload}
                            disabled={isUploadingCV}
                            className="text-xs h-9 bg-white ml-0"
                            id="cv-upload-sidebar"
                        />
                    </div>
                    {uploadProgress && (
                        <div className="flex items-center gap-2 text-xs text-indigo-600 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {uploadProgress}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
                <CardHeader><CardTitle className="text-lg">About You</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Professional Bio</Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Brief summary..."
                            className="h-32 bg-gray-50/50 resize-y text-sm"
                        />
                    </div>

                    <SkillsSection skills={formData.skills} onAdd={onAddSkill} onRemove={onRemoveSkill} />

                    <div className="space-y-2">
                        <Label htmlFor="language" className="text-sm font-medium text-gray-700">Communication Language</Label>
                        <Select
                            value={formData.language}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                        >
                            <SelectTrigger id="language" className="bg-white">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="zh">Chinese</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Certifications</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newCertification}
                                onChange={(e) => setNewCertification(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCert())}
                                placeholder="Add certification..."
                                className="h-8 text-xs bg-white"
                            />
                            <Button type="button" size="sm" onClick={handleAddCert} disabled={!newCertification.trim()} className="h-8 w-8 p-0">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.certifications.map((cert, i) => (
                                <Badge key={i} variant="outline" className="text-xs py-0.5 pl-2 pr-1 gap-1 border-green-200 bg-green-50 text-green-700">
                                    {cert}
                                    <X className="w-3 h-3 cursor-pointer hover:text-green-900" onClick={() => onRemoveCertification(cert)} />
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Preferred Industries</Label>
                        <div className="h-40 overflow-y-auto p-2 bg-gray-50 rounded-md border border-gray-100 space-y-2">
                            {industryOptions.map((ind) => (
                                <div key={ind} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`ind-${ind}`}
                                        checked={formData.preferred_industries.includes(ind)}
                                        onCheckedChange={(checked) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                preferred_industries: checked
                                                    ? [...prev.preferred_industries, ind]
                                                    : prev.preferred_industries.filter(i => i !== ind)
                                            }));
                                        }}
                                        className="h-4 w-4"
                                    />
                                    <label htmlFor={`ind-${ind}`} className="text-xs text-gray-600 cursor-pointer select-none">{ind}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
