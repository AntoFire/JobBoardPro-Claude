import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import AddJobForm from "@/components/kanban/AddJobForm";
import KanbanFilters from "@/components/kanban/KanbanFilters";
import WatcherList from "@/components/watcher/WatcherList";
import StatsBar from "@/components/dashboard/StatsBar";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { normalizeLocation } from "@/utils/locationUtils";
import { exportJobsToCSV } from "@/utils/exportUtils";

export default function Dashboard() {
    const [currentUser, setCurrentUser] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [showAddJob, setShowAddJob] = useState(false);
    const [showWatchers, setShowWatchers] = useState(false);
    const [filters, setFilters] = useState({
        searchTerm: "",
        company: "all",
        location: "all",
        status: "all",
        jobType: "All Types"
    });

    const queryClient = useQueryClient();
    const { toast } = useToast();

    useEffect(() => {
        let mounted = true;
        const checkAuth = async () => {
            try {
                const user = await base44.auth.me();
                if (mounted) {
                    setCurrentUser(user);
                    setIsCheckingAuth(false);
                }
            } catch (error) {
                if (mounted) {
                    setCurrentUser(null);
                    setIsCheckingAuth(false);
                }
            }
        };
        checkAuth();
        return () => { mounted = false; };
    }, []);

    const { data: jobs = [], isLoading: isJobsLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: () => base44.entities.JobApplication.list("-created_date"),
        enabled: !!currentUser,
    });

    const createJobMutation = useMutation({
        mutationFn: base44.entities.JobApplication.create,
        onSuccess: () => {
            queryClient.invalidateQueries(['jobs']);
            setShowAddJob(false);
            toast({ title: "Job Added", description: "Successfully added new job application." });
        },
    });

    const updateJobMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.JobApplication.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['jobs']);
        },
    });

    const deleteJobMutation = useMutation({
        mutationFn: base44.entities.JobApplication.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['jobs']);
            toast({ title: "Job Deleted", description: "Application removed from board." });
        },
    });

    const deleteColumnMutation = useMutation({
        mutationFn: async (statusLabel) => {
            const jobsToDelete = jobs.filter(j => j.status === statusLabel);
            for (const job of jobsToDelete) {
                await base44.entities.JobApplication.delete(job.id);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['jobs']);
            toast({ title: "Column Cleared", description: "All jobs in column deleted." });
        },
    });

    if (isCheckingAuth) {
        return <div className="flex items-center justify-center h-screen">Checking session...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    const filteredJobs = jobs.filter(job => {
        const searchMatch = !filters.searchTerm ||
            job.title?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            job.company?.toLowerCase().includes(filters.searchTerm.toLowerCase());

        const typeMatch = filters.jobType === "All Types" || (() => {
            if (!job.job_type) return filters.jobType === "Other";
            return job.job_type === filters.jobType;
        })();

        const companyMatch = filters.company === "all" || job.company === filters.company;
        const locationMatch = !filters.location || filters.location === "all" || normalizeLocation(job.location) === filters.location;
        const statusMatch = !filters.status || filters.status === "all" || job.status === filters.status;

        return searchMatch && typeMatch && companyMatch && locationMatch && statusMatch;
    });

    if (isJobsLoading) {
        return <div className="flex items-center justify-center h-screen">Loading jobs...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Job Application Board</h1>
                        <p className="text-gray-500 text-sm">Track and manage your applications efficiently.</p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <KanbanFilters jobs={jobs} onFilterChange={setFilters} />
                        <Button
                            variant="outline"
                            onClick={() => setShowWatchers(true)}
                            className="gap-2 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            Watchers
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                exportJobsToCSV(jobs);
                                toast({ title: "Exported!", description: "Jobs exported to CSV." });
                            }}
                            className="gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </Button>
                        <Button onClick={() => setShowAddJob(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                            <Plus className="w-4 h-4 mr-2" />
                            New Application
                        </Button>
                    </div>
                </div>

                <StatsBar jobs={jobs} />

                {showWatchers && <WatcherList isOpen={showWatchers} onClose={() => setShowWatchers(false)} />}

                <KanbanBoard
                    jobs={filteredJobs}
                    onJobMove={(id, status) => {
                        const job = jobs.find(j => j.id === id);
                        const updates = { status };
                        if (job && job.status === "To Apply" && status === "Applied") {
                            updates.created_date = new Date().toISOString();
                        }
                        updateJobMutation.mutate({ id, data: updates });
                    }}
                    onJobDelete={(id) => deleteJobMutation.mutate(id)}
                    onJobUpdate={(id, data) => updateJobMutation.mutate({ id, data })}
                    onColumnDelete={(status) => deleteColumnMutation.mutate(status)}
                />
            </div>

            {showAddJob && (
                <AddJobForm
                    isOpen={showAddJob}
                    onClose={() => setShowAddJob(false)}
                    onJobAdded={() => {
                        queryClient.invalidateQueries(['jobs']);
                        setShowAddJob(false);
                        toast({ title: "Job Added", description: "Successfully added new job application." });
                    }}
                />
            )}
        </div>
    );
}
