import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Link2, Upload, Loader2, CheckCircle, AlertCircle, Edit, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { normalizeJobType, JOB_TYPES } from "@/utils/jobTypeUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AddJobForm({ isOpen, onClose, onJobAdded }) {
  const [urlInput, setUrlInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [processingProgress, setProcessingProgress] = useState("");

  const [reviewJob, setReviewJob] = useState(null);
  const [reviewJobs, setReviewJobs] = useState([]);

  const extractJobFromUrl = async (url) => {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract job application details from this URL: ${url}\n\nPlease provide the following information:\n- Job title\n- Company name\n- Location (city/country)\n- Application deadline (if mentioned, in YYYY-MM-DD format)\n- Brief description of the role\n\nBe concise and extract only the key information. If the deadline is not clearly stated, leave it empty.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          company: { type: "string" },
          location: { type: "string" },
          deadline: { type: "string" },
          notes: { type: "string" }
        }
      }
    });

    return {
      title: result.title || "Job Position",
      company: result.company || "Company",
      location: result.location || "",
      deadline: result.deadline || "",
      notes: result.notes || "",
      job_link: url,
      date: new Date().toISOString().split('T')[0],
      status: "To Apply",
      job_type: "Other"
    };
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsProcessing(true);
    setMessage(null);

    try {
      const jobData = await extractJobFromUrl(urlInput);
      setReviewJob(jobData);
      setUrlInput("");
      setMessage({ type: "success", text: "Job extracted! Please review and edit if needed." });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to extract job details. Please try again." });
      console.error("Error processing URL:", error);
    }

    setIsProcessing(false);
  };

  const handleConfirmJob = async () => {
    if (!reviewJob) return;

    setIsProcessing(true);
    try {
      const existingJobs = await base44.entities.JobApplication.filter({
        job_link: reviewJob.job_link
      });

      if (existingJobs.length > 0) {
        const confirmUpdate = window.confirm(
          `A job with this URL already exists (${existingJobs[0].title} at ${existingJobs[0].company}). Do you want to update it instead?`
        );

        if (confirmUpdate) {
          await base44.entities.JobApplication.update(existingJobs[0].id, reviewJob);
          setMessage({ type: "success", text: "Job updated successfully!" });
        } else {
          setMessage({ type: "error", text: "Job already exists. Update cancelled." });
        }
      } else {
        await base44.entities.JobApplication.create(reviewJob);
        setMessage({ type: "success", text: "Job added successfully!" });
      }

      setReviewJob(null);
      if (onJobAdded) onJobAdded();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save job. Please try again." });
      console.error("Error saving job:", error);
    }
    setIsProcessing(false);
  };

  const handleCancelReview = () => {
    setReviewJob(null);
    setMessage(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setMessage(null);
    }
  };

  const parseCSVLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    return values.map(v => v.trim().replace(/^"|"$/g, ''));
  };

  const handleCsvSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setMessage({ type: "error", text: "Please select a CSV file first" });
      return;
    }

    setIsProcessing(true);
    setMessage(null);
    setProcessingProgress("Uploading and parsing CSV file...");

    try {
      const text = await uploadFile.text();
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length === 0) throw new Error("File is empty");

      const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/['"]*/g, '').trim());

      const hasTitle = headers.includes('title');
      const hasCompany = headers.includes('company');
      const urlIndex = headers.findIndex(h => h === 'url' || h === 'job_link' || h === 'link');
      const typeIndex = headers.findIndex(h => h === 'type' || h === 'job_type' || h === 'contract');

      const getValue = (rowValues, headerName) => {
        const index = headers.indexOf(headerName);
        return index !== -1 ? rowValues[index] : '';
      };

      const extractedJobs = [];
      const urlsToScrape = [];

      setProcessingProgress(`Processing ${lines.length - 1} rows...`);

      for (let i = 1; i < lines.length; i++) {
        const rowValues = parseCSVLine(lines[i]);
        if (rowValues.length <= 1 && !rowValues[0]) continue;

        if (hasTitle && hasCompany && urlIndex !== -1) {
          const title = getValue(rowValues, 'title');
          const company = getValue(rowValues, 'company');
          const job_link = rowValues[urlIndex];

          if (title && company) {
            extractedJobs.push({
              title,
              company,
              job_link: job_link || '',
              location: getValue(rowValues, 'location') || '',
              deadline: getValue(rowValues, 'deadline') || '',
              status: getValue(rowValues, 'status') || 'To Apply',
              notes: getValue(rowValues, 'notes') || '',
              date: getValue(rowValues, 'date') || new Date().toISOString().split('T')[0],
              job_type: normalizeJobType(typeIndex !== -1 ? rowValues[typeIndex] : '')
            });
            continue;
          }
        }

        let url = urlIndex !== -1 ? rowValues[urlIndex] : null;
        if (!url) {
          const rowString = lines[i];
          const match = rowString.match(/(https?:\/\/[^\s,;"']+)/);
          if (match) url = match[0];
        }
        if (url) urlsToScrape.push(url);
      }

      if (urlsToScrape.length > 0) {
        setProcessingProgress(`Found ${urlsToScrape.length} URLs to extract via AI...`);
        for (let i = 0; i < urlsToScrape.length; i++) {
          setProcessingProgress(`Extracting details from job ${i + 1} of ${urlsToScrape.length}...`);
          try {
            const jobData = await extractJobFromUrl(urlsToScrape[i]);
            extractedJobs.push(jobData);
          } catch (err) {
            console.error(`Failed to scrape ${urlsToScrape[i]}:`, err);
          }
        }
      }

      if (extractedJobs.length === 0) {
        throw new Error("No valid jobs found. Ensure CSV has 'title', 'company', and 'job_link' columns, or contains valid URLs.");
      }

      setReviewJobs(extractedJobs);
      setUploadFile(null);
      setProcessingProgress("");

      const fileInput = document.getElementById('csv-file');
      if (fileInput) fileInput.value = '';

      setMessage({ type: "success", text: `Ready to review ${extractedJobs.length} jobs!` });
    } catch (error) {
      console.error("CSV import error:", error);
      setMessage({ type: "error", text: `Failed to import: ${error.message}` });
    }

    setIsProcessing(false);
    setProcessingProgress("");
  };

  const handleConfirmBatchJobs = async () => {
    if (reviewJobs.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress("Checking for duplicates and saving jobs...");

    try {
      let created = 0;
      let updated = 0;
      let skipped = 0;

      for (const job of reviewJobs) {
        try {
          const existingJobs = await base44.entities.JobApplication.filter({ job_link: job.job_link });

          if (existingJobs.length > 0) {
            await base44.entities.JobApplication.update(existingJobs[0].id, job);
            updated++;
          } else {
            await base44.entities.JobApplication.create(job);
            created++;
          }
        } catch (error) {
          console.error(`Failed to save job ${job.title}:`, error);
          skipped++;
        }
      }

      setMessage({ type: "success", text: `Completed! Created: ${created}, Updated: ${updated}, Skipped: ${skipped}` });
      setReviewJobs([]);
      setProcessingProgress("");
      if (onJobAdded) onJobAdded();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save some jobs. Please try again." });
      console.error("Error in batch save:", error);
    }

    setIsProcessing(false);
  };

  const handleCancelBatchReview = () => {
    setReviewJobs([]);
    setMessage(null);
  };

  const updateReviewJob = (field, value) => {
    setReviewJob(prev => ({ ...prev, [field]: value }));
  };

  const updateBatchJob = (index, field, value) => {
    setReviewJobs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeBatchJob = (index) => {
    setReviewJobs(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Job Application</DialogTitle>
        </DialogHeader>

        {reviewJob && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Review & Edit Job
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCancelReview} className="text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="review-title" className="text-xs">Job Title *</Label>
                <Input id="review-title" value={reviewJob.title} onChange={(e) => updateReviewJob("title", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="review-company" className="text-xs">Company *</Label>
                <Input id="review-company" value={reviewJob.company} onChange={(e) => updateReviewJob("company", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="review-location" className="text-xs">Location</Label>
                <Input id="review-location" value={reviewJob.location} onChange={(e) => updateReviewJob("location", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="review-deadline" className="text-xs">Deadline</Label>
                <Input id="review-deadline" type="date" value={reviewJob.deadline} onChange={(e) => updateReviewJob("deadline", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="review-type" className="text-xs">Job Type</Label>
                <Select value={reviewJob.job_type || "Other"} onValueChange={(val) => updateReviewJob("job_type", val)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.filter(t => t !== "All Types").map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="review-notes" className="text-xs">Notes</Label>
              <Textarea id="review-notes" value={reviewJob.notes} onChange={(e) => updateReviewJob("notes", e.target.value)} className="h-20" />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={handleCancelReview} disabled={isProcessing}>Cancel</Button>
              <Button onClick={handleConfirmJob} disabled={isProcessing || !reviewJob.title || !reviewJob.company} className="bg-indigo-600 hover:bg-indigo-700">
                {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Job"}
              </Button>
            </div>
          </div>
        )}

        {reviewJobs.length > 0 && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Review {reviewJobs.length} Job(s)
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCancelBatchReview} className="text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {reviewJobs.map((job, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-500">Job {index + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeBatchJob(index)} className="h-6 w-6 p-0 text-gray-400 hover:text-red-600">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={job.title} onChange={(e) => updateBatchJob(index, "title", e.target.value)} placeholder="Job Title" className="h-8 text-sm" />
                    <Input value={job.company} onChange={(e) => updateBatchJob(index, "company", e.target.value)} placeholder="Company" className="h-8 text-sm" />
                    <Input value={job.location} onChange={(e) => updateBatchJob(index, "location", e.target.value)} placeholder="Location" className="h-8 text-sm" />
                    <Input type="date" value={job.deadline} onChange={(e) => updateBatchJob(index, "deadline", e.target.value)} className="h-8 text-sm" />
                    <Select value={job.job_type || "Other"} onValueChange={(val) => updateBatchJob(index, "job_type", val)}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        {JOB_TYPES.filter(t => t !== "All Types").map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea value={job.notes} onChange={(e) => updateBatchJob(index, "notes", e.target.value)} placeholder="Notes" className="h-16 text-sm" />
                </div>
              ))}
            </div>

            {processingProgress && (
              <div className="text-sm text-indigo-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {processingProgress}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2 border-t border-indigo-200">
              <Button variant="outline" onClick={handleCancelBatchReview} disabled={isProcessing}>Cancel</Button>
              <Button onClick={handleConfirmBatchJobs} disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-700">
                {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : `Save All ${reviewJobs.length} Job(s)`}
              </Button>
            </div>
          </div>
        )}

        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="url" className="gap-2">
              <Link2 className="w-4 h-4" />
              Single URL
            </TabsTrigger>
            <TabsTrigger value="csv" className="gap-2">
              <Upload className="w-4 h-4" />
              CSV Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url">
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-url">Job Posting URL</Label>
                <Input
                  id="job-url"
                  type="url"
                  placeholder="https://company.com/careers/job-id"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isProcessing || reviewJob !== null}
                  className="h-11"
                />
                <p className="text-xs text-gray-500">AI will extract job details. You'll review them before saving.</p>
              </div>
              <Button type="submit" disabled={isProcessing || !urlInput.trim() || reviewJob !== null} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700">
                {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Extracting Details...</> : "Extract Job"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="csv">
            <form onSubmit={handleCsvSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file">Upload CSV File</Label>
                <Input id="csv-file" type="file" accept=".csv,.txt" onChange={handleFileUpload} disabled={isProcessing || reviewJobs.length > 0} className="h-11" />
                {uploadFile && <p className="text-sm text-green-600">✓ File selected: {uploadFile.name}</p>}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-gray-700 space-y-2">
                  <p className="font-semibold text-blue-900">CSV Format:</p>
                  <p>Upload a CSV with columns: title, company, job_link, location, deadline, status, notes</p>
                  <p className="text-blue-600 italic">💡 You'll be able to review and edit all jobs before saving</p>
                </div>
              </div>

              {processingProgress && !reviewJobs.length && (
                <div className="text-sm text-indigo-600 flex items-center gap-2 bg-indigo-50 p-3 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span>{processingProgress}</span>
                </div>
              )}

              <Button type="submit" disabled={isProcessing || !uploadFile || reviewJobs.length > 0} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700">
                {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : "Extract Jobs"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {message && !reviewJob && reviewJobs.length === 0 && (
          <Alert className={`mt-4 ${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
