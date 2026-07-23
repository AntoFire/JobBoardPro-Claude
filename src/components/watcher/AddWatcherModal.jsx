import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Globe } from "lucide-react";

export default function AddWatcherModal({ isOpen, onClose, onAddWatcher }) {
    const [url, setUrl] = useState("");
    const [keywordInput, setKeywordInput] = useState("");
    const [keywords, setKeywords] = useState([]);
    const [name, setName] = useState("");

    const handleAddKeyword = (e) => {
        e.preventDefault();
        if (keywordInput.trim()) {
            if (!keywords.includes(keywordInput.trim())) {
                setKeywords([...keywords, keywordInput.trim()]);
            }
            setKeywordInput("");
        }
    };

    const removeKeyword = (kwToRemove) => {
        setKeywords(keywords.filter(kw => kw !== kwToRemove));
    };

    const handleSubmit = () => {
        if (!url) return;
        try {
            new URL(url);
        } catch (_) {
            alert("Please enter a valid URL (e.g. https://jobs.apple.com)");
            return;
        }

        onAddWatcher({
            name: name || new URL(url).hostname,
            target_url: url,
            keywords: keywords,
            status: "active",
            last_checked: null
        });

        setUrl("");
        setKeywords([]);
        setName("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Monitor a Career Page</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Website URL</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input placeholder="https://jobs.apple.com/fr..." className="pl-9" value={url} onChange={(e) => setUrl(e.target.value)} />
                        </div>
                        <p className="text-xs text-gray-500">The specific search page you want to watch.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Watcher Name (Optional)</label>
                        <Input placeholder="e.g. Apple Frontend Jobs" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Keywords</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add keyword (e.g. React)..."
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword(e)}
                            />
                            <Button type="button" onClick={handleAddKeyword} variant="secondary">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {keywords.map(kw => (
                                <Badge key={kw} variant="secondary" className="px-2 py-1 gap-1">
                                    {kw}
                                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeKeyword(kw)} />
                                </Badge>
                            ))}
                            {keywords.length === 0 && (
                                <span className="text-xs text-gray-400 italic">No keywords added yet (will track all jobs)</span>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!url} className="bg-indigo-600 hover:bg-indigo-700 text-white">Start Watching</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
