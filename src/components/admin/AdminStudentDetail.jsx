
import React from "react";
import { X, MapPin, Calendar, Briefcase, GraduationCap, Download, ExternalLink, Mail, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AdminStudentDetail = ({ student, onClose }) => {
    if (!student) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "Present";
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-5xl h-[90vh] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start justify-between p-6 border-b border-gray-100 bg-white/50">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {student.full_name ? student.full_name[0].toUpperCase() : student.email[0].toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{student.full_name || "Unknown User"}</h2>
                            <div className="flex items-center gap-4 mt-1 text-gray-500 text-sm">
                                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {student.email}</span>
                                {student.role && (
                                    <Badge variant="secondary" className="capitalize bg-indigo-50 text-indigo-700 border-indigo-100">{student.role}</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {student.cv_file_url && (
                            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-2">
                                <a href={student.cv_file_url} target="_blank" rel="noopener noreferrer">
                                    <Download className="w-4 h-4" />Download CV
                                </a>
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
                            <X className="w-6 h-6 text-gray-500" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="space-y-6 lg:col-span-1">
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4 text-indigo-500" /> Bio
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{student.bio || "No biography provided yet."}</p>
                            </div>

                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                                {student.skills && student.skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {student.skills.map((skill, index) => (
                                            <Badge key={index} variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">{skill}</Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No skills listed</p>
                                )}
                            </div>

                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-3">Target Industries</h3>
                                {student.preferred_industries && student.preferred_industries.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {student.preferred_industries.map((ind, index) => (
                                            <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">{ind}</Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No preferences set</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-8 lg:col-span-2">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-indigo-600" />Professional Experience
                                </h3>
                                {!student.professional_experience || student.professional_experience.length === 0 ? (
                                    <p className="text-gray-400 italic bg-white p-6 rounded-xl border border-dashed text-center">No experience listed.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {student.professional_experience.map((exp, i) => (
                                            <div key={i} className="group relative bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all border-l-4 border-l-indigo-500">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-lg">{exp.title}</h4>
                                                        <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm">
                                                            <Briefcase className="w-3.5 h-3.5" />{exp.company}
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs text-gray-500 bg-gray-50">
                                                        {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-purple-600" />Education
                                </h3>
                                {!student.education || student.education.length === 0 ? (
                                    <p className="text-gray-400 italic bg-white p-6 rounded-xl border border-dashed text-center">No education listed.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {student.education.map((edu, i) => (
                                            <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-purple-200 transition-colors">
                                                <h4 className="font-bold text-gray-900 line-clamp-1">{edu.institution}</h4>
                                                <p className="text-sm font-medium text-purple-700 mt-1">{edu.degree}</p>
                                                <p className="text-xs text-gray-500 mt-2 mb-3">{edu.start_year} - {edu.end_year}</p>
                                                {edu.description && <p className="text-xs text-gray-600 leading-snug line-clamp-3">{edu.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 p-6 md:p-8 bg-white">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                        Application History ({student.jobs?.length || 0})
                    </h3>

                    {!student.jobs || student.jobs.length === 0 ? (
                        <p className="text-gray-400 italic text-sm">No applications found.</p>
                    ) : (
                        <div className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x px-1">
                            {["To Apply", "Applied", "Interview", "Offer", "Rejected"].map(status => {
                                const statusJobs = student.jobs.filter(j => j.status === status);
                                if (statusJobs.length === 0) return null;

                                return (
                                    <div key={status} className="min-w-[350px] flex-1 flex flex-col gap-4 snap-start">
                                        <div className="flex items-center justify-between px-2">
                                            <h4 className="font-bold text-gray-800 text-base flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${
                                                    status === 'Offer' ? 'bg-green-500' :
                                                    status === 'Rejected' ? 'bg-red-500' :
                                                    status === 'Interview' ? 'bg-purple-500' : 'bg-blue-500'
                                                }`} />
                                                {status === "To Apply" ? "Wishlist" : status}
                                                <span className="text-gray-400 font-normal ml-1">({statusJobs.length})</span>
                                            </h4>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            {statusJobs.map(job => (
                                                <div key={job.id} className="bg-slate-50 p-5 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <h5 className="font-bold text-gray-900 text-lg leading-tight break-words">{job.title}</h5>
                                                        {job.job_link && (
                                                            <a href={job.job_link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600 flex-shrink-0">
                                                                <ExternalLink className="w-5 h-5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                    <div className="text-gray-600 font-medium mt-2 text-sm">{job.company}</div>
                                                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location || "Remote"}</span>
                                                        <span className="flex items-center gap-1.5 ml-auto"><Calendar className="w-4 h-4" /> {new Date(job.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminStudentDetail;
