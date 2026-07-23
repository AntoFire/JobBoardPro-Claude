import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink, Play, Pause, AlertCircle } from "lucide-react";
import AddWatcherModal from "./AddWatcherModal";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

export default function WatcherList({ isOpen, onClose }) {
    const [showAdd, setShowAdd] = useState(false);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: watchers = [], isLoading } = useQuery({
        queryKey: ["watchers"],
        queryFn: base44.entities.JobWatcher.list,
    });

    const createMutation = useMutation({
        mutationFn: base44.entities.JobWatcher.create,
        onSuccess: () => {
            queryClient.invalidateQueries(["watchers"]);
            toast({
                title: "Watcher Added",
                description: "Now monitoring for new jobs",
                className: "bg-slate-900 text-white border-slate-800 opacity-100 shadow-xl"
            });
            setShowAdd(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.JobWatcher.update(id, data),
        onSuccess: () => queryClient.invalidateQueries(["watchers"])
    });

    const deleteMutation = useMutation({
        mutationFn: base44.entities.JobWatcher.delete,
        onSuccess: () => queryClient.invalidateQueries(["watchers"])
    });

    const handleAddWatcher = (newWatcher) => {
        createMutation.mutate(newWatcher);
    };

    const removeWatcher = (id) => {
        if (confirm("Stop monitoring this page?")) {
            deleteMutation.mutate(id);
        }
    };

    const toggleStatus = (id) => {
        const watcher = watchers.find(w => w.id === id);
        if (watcher) {
            updateMutation.mutate({ id, data: { status: watcher.status === 'active' ? 'paused' : 'active' } });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white text-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col m-4 overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            Website Watchers
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">Beta</Badge>
                        </h2>
                        <p className="text-sm text-gray-500">Monitor career pages and get alerted for new jobs.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => setShowAdd(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">+ Add New</Button>
                        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                    {watchers.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                            <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <AlertCircle className="w-6 h-6 text-indigo-500" />
                            </div>
                            <h3 className="font-medium text-gray-900">No active watchers</h3>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1 mb-4">Add a career page URL to start tracking opportunities automatically.</p>
                            <Button variant="outline" onClick={() => setShowAdd(true)}>Create First Watcher</Button>
                        </div>
                    ) : (
                        watchers.map(watcher => (
                            <div key={watcher.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:border-gray-300 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-gray-900 truncate">{watcher.name}</h4>
                                        <span className={`w-2 h-2 rounded-full ${watcher.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                                        <span className="text-xs text-gray-400 capitalize">{watcher.status}</span>
                                    </div>
                                    <a href={watcher.target_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mb-2 truncate">
                                        {watcher.target_url} <ExternalLink className="w-3 h-3" />
                                    </a>
                                    <div className="flex flex-wrap gap-1">
                                        {watcher.keywords.map(kw => (
                                            <span key={kw} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200">{kw}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-end md:self-center">
                                    <Button
                                        variant="ghost" size="icon"
                                        className={watcher.status === 'active' ? "text-orange-500 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}
                                        onClick={() => toggleStatus(watcher.id)}
                                    >
                                        {watcher.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeWatcher(watcher.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <AddWatcherModal isOpen={showAdd} onClose={() => setShowAdd(false)} onAddWatcher={handleAddWatcher} />
        </div>
    );
}
