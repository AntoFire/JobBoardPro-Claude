import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { normalizeJobType } from "@/utils/jobTypeUtils";

export default function ExtensionJobHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Extracting job details...');
    const [jobDetails, setJobDetails] = useState(null);
    const processingRef = React.useRef(false);

    useEffect(() => {
        const processJob = async () => {
            if (processingRef.current) return;
            processingRef.current = true;
            try {
                const user = await base44.auth.me().catch(() => {
                    throw new Error("You must be logged in to save jobs.");
                });
                const type = searchParams.get('type') || 'job';
                if (type === 'linkedin') {
                    const name = searchParams.get('name');
                    const headline = searchParams.get('headline');
                    const company = searchParams.get('company');
                    const profileUrl = searchParams.get('url');
                    const location = searchParams.get('location') || '';
                    if (!name || !profileUrl) throw new Error('Missing required fields: name or url');
                    const allProfiles = await base44.entities.LinkedInProfile.list();
                    const exists = allProfiles.find(p => p.profile_link === profileUrl);
                    if (exists) {
                        setStatus('error');
                        setMessage(`Profile already tracked: ${exists.name}`);
                        return;
                    }
                    await base44.entities.LinkedInProfile.create({
                        name, current_role: headline || '', company: company || 'Unknown',
                        profile_link: profileUrl, location, status: 'To Contact',
                        notes: 'Imported from extension', uid: user.uid
                    });
                    setMessage('LinkedIn Profile tracked successfully!');
                } else {
                    const title = searchParams.get('title');
                    const company = searchParams.get('company');
                    const jobLink = searchParams.get('url');
                    const location = searchParams.get('location') || '';
                    const description = searchParams.get('description') || '';
                    const jobType = searchParams.get('jobType') || '';
                    if (!title || !company || !jobLink) throw new Error('Missing required fields: title, company, or url');
                    setJobDetails({ title, company });
                    const existingJobs = await base44.entities.JobApplication.filter({ job_link: jobLink });
                    if (existingJobs.length > 0) {
                        setStatus('error');
                        setMessage(`Job already exists: ${existingJobs[0].title} at ${existingJobs[0].company}`);
                        return;
                    }
                    const createdJob = await base44.entities.JobApplication.create({
                        title, company, job_link: jobLink, location,
                        notes: description ? `Imported from extension.\n\n${description}` : 'Imported from extension',
                        status: 'To Apply', date: new Date().toISOString().split('T')[0],
                        uid: user.uid, job_type: normalizeJobType(jobType)
                    });
                    setJobDetails({ title, company, id: createdJob.id });
                    setMessage('Job successfully added to your dashboard!');
                }
                setStatus('success');
            } catch (error) {
                console.error('Error processing job from extension:', error);
                setStatus('error');
                setMessage(error.message || 'Failed to process job');
            }
        };
        processJob();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader><CardTitle className="text-xl text-center">Job Import</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {status === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                            <p className="text-gray-600">{message}</p>
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="flex flex-col items-center justify-center py-6 space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-semibold text-lg">Success!</h3>
                                <p className="text-gray-600 mt-1">{message}</p>
                                {jobDetails && <p className="text-sm text-gray-500 mt-2">{jobDetails.title} at {jobDetails.company}</p>}
                            </div>
                            <Button onClick={() => navigate('/')} className="w-full bg-indigo-600 hover:bg-indigo-700">Go to Dashboard</Button>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="space-y-4">
                            <Alert className="border-red-200 bg-red-50">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800">{message}</AlertDescription>
                            </Alert>
                            <div className="flex justify-center">
                                <Link to="/"><Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" />Return to Dashboard</Button></Link>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
