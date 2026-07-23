
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { normalizeLocation } from "@/utils/locationUtils";
import { JOB_TYPES } from "@/utils/jobTypeUtils";

export default function KanbanFilters({ jobs, onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedJobType, setSelectedJobType] = useState("All Types");

  const companies = [...new Set(jobs.map(job => job.company).filter(Boolean))].sort();
  const locations = [...new Set(jobs.map(job => normalizeLocation(job.location)).filter(Boolean))].sort();

  const handleFilterChange = () => {
    onFilterChange({
      searchTerm,
      company: selectedCompany,
      location: selectedLocation,
      status: selectedStatus,
      jobType: selectedJobType
    });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCompany("all");
    setSelectedLocation("all");
    setSelectedStatus("all");
    setSelectedJobType("All Types");
    onFilterChange({
      searchTerm: "",
      company: "all",
      location: "all",
      status: "all",
      jobType: "All Types"
    });
  };

  const hasActiveFilters = searchTerm || selectedCompany !== "all" || selectedLocation !== "all" || selectedStatus !== "all" || selectedJobType !== "All Types";

  React.useEffect(() => {
    handleFilterChange();
  }, [searchTerm, selectedCompany, selectedLocation, selectedStatus, selectedJobType]);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter Applications</span>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs text-gray-500 hover:text-gray-700">
            <X className="w-3 h-3 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <Select value={selectedJobType} onValueChange={setSelectedJobType}>
          <SelectTrigger className="h-10"><SelectValue placeholder="Job Type" /></SelectTrigger>
          <SelectContent>
            {JOB_TYPES.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="h-10"><SelectValue placeholder="All Companies" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.map(company => (
              <SelectItem key={company} value={company}>{company}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="h-10"><SelectValue placeholder="All Locations" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map(location => (
              <SelectItem key={location} value={location}>{location}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="h-10"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="To Apply">Wishlist</SelectItem>
            <SelectItem value="Applied">Applied</SelectItem>
            <SelectItem value="Interview">Interview</SelectItem>
            <SelectItem value="Offer">Offer</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
