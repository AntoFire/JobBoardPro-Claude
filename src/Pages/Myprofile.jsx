import React, { useState, useEffect } from "react";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ExperienceSection from "@/components/profile/ExperienceSection";
import EducationSection from "@/components/profile/EducationSection";
import { parseCVWithGemini } from "@/utils/aiCVParser";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

const MyProfile = () => {
    const { toast } = useToast();
    const [isUploadingCV, setIsUploadingCV] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");
    const [user, setUser] = useState({ full_name: "", email: "", role: "user" });
    const [formData, setFormData] = useState({
        bio: "", skills: [], preferred_industries: [], language: "en",
        certifications: [], professional_experience: [], education: [], cv_file_url: ""
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
                if (currentUser) {
                    setFormData(prev => ({
                        ...prev,
                        bio: currentUser.bio || "",
                        skills: currentUser.skills || [],
                        preferred_industries: currentUser.preferred_industries || [],
                        language: currentUser.language || "en",
                        certifications: currentUser.certifications || [],
                        professional_experience: currentUser.professional_experience || [],
                        education: currentUser.education || [],
                        cv_file_url: currentUser.cv_file_url || ""
                    }));
                }
            } catch (error) {
                toast({ title: "Error", description: "Could not fetch user data.", variant: "destructive" });
            }
        };
        loadProfile();
    }, []);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await base44.auth.updateMe(formData);
            toast({ title: "Profile Saved", description: "Your changes have been updated.", className: "bg-green-50 border-green-200 text-green-900" });
        } catch (error) {
            toast({ title: "Save Failed", description: "Could not save changes.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCVUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingCV(true);
        setUploadProgress("Starting...");
        try {
            const result = await parseCVWithGemini(file, (msg) => setUploadProgress(msg));
            if (!result.success) throw new Error(result.error);
            const { data } = result;
            setFormData(prev => ({
                ...prev,
                skills: [...new Set([...prev.skills, ...data.skills])],
                preferred_industries: [...new Set([...prev.preferred_industries, ...data.preferred_industries])],
                bio: (!prev.bio || prev.bio.length < 20) ? (data.bio || prev.bio) : prev.bio,
                education: [...prev.education, ...data.education],
                professional_experience: [...prev.professional_experience, ...data.professional_experience],
                certifications: [...new Set([...prev.certifications, ...data.certifications])],
                cv_file_url: data.cv_file_url
            }));
            toast({ title: "CV Analyzed", description: `Extracted ${data.professional_experience.length} jobs, ${data.education.length} schools, ${data.skills.length} skills.`, className: "bg-green-50 border-green-200 text-green-900" });
        } catch (error) {
            toast({ title: "Analysis Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsUploadingCV(false);
            setUploadProgress("");
            e.target.value = '';
        }
    };

    const handleAddExperience = () => setFormData(prev => ({ ...prev, professional_experience: [{ title: "", company: "", description: "", id: Date.now() }, ...prev.professional_experience] }));
    const handleRemoveExperience = (index) => setFormData(prev => ({ ...prev, professional_experience: prev.professional_experience.filter((_, i) => i !== index) }));
    const handleUpdateExperience = (index, field, value) => setFormData(prev => ({ ...prev, professional_experience: prev.professional_experience.map((exp, i) => i === index ? { ...exp, [field]: value } : exp) }));
    const handleAddEducation = () => setFormData(prev => ({ ...prev, education: [{ degree: "", institution: "", description: "", id: Date.now() }, ...prev.education] }));
    const handleRemoveEducation = (index) => setFormData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
    const handleUpdateEducation = (index, field, value) => setFormData(prev => ({ ...prev, education: prev.education.map((edu, i) => i === index ? { ...edu, [field]: value } : edu) }));
    const onAddSkill = (skill) => setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    const onRemoveSkill = (skill) => setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    const onAddCertification = (cert) => setFormData(prev => ({ ...prev, certifications: [...prev.certifications, cert] }));
    const onRemoveCertification = (cert) => setFormData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c !== cert) }));

    return (
        <div className="flex flex-col md:flex-row gap-6 p-6 max-w-7xl mx-auto relative">
            <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
                <ProfileSidebar
                    user={user}
                    formData={formData}
                    setFormData={setFormData}
                    handleCVUpload={handleCVUpload}
                    isUploadingCV={isUploadingCV}
                    uploadProgress={uploadProgress}
                    industryOptions={["Technology", "Finance", "Healthcare", "Education", "Consulting", "Retail"]}
                    onAddSkill={onAddSkill}
                    onRemoveSkill={onRemoveSkill}
                    onAddCertification={onAddCertification}
                    onRemoveCertification={onRemoveCertification}
                />
            </div>
            <div className="flex-1 space-y-8">
                <div className="flex justify-between items-center border-b border-gray-100 pb-6">
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </Button>
                </div>
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">Professional Experience</h2>
                    <ExperienceSection experience={formData.professional_experience} onAdd={handleAddExperience} onUpdate={handleUpdateExperience} onRemove={handleRemoveExperience} />
                </div>
                <div className="space-y-6 pt-6 border-t border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800">Education</h2>
                    <EducationSection education={formData.education} onAdd={handleAddEducation} onUpdate={handleUpdateEducation} onRemove={handleRemoveEducation} />
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
