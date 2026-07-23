import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export default function ProfileFilters({ profiles, onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const companies = [...new Set(profiles.map(profile => profile.company).filter(Boolean))].sort();
  const locations = [...new Set(profiles.map(profile => profile.location).filter(Boolean))].sort();

  const handleFilterChange = () => {
    onFilterChange({ searchTerm, company: selectedCompany, location: selectedLocation, status: selectedStatus });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCompany("all");
    setSelectedLocation("all");
    setSelectedStatus("all");
    onFilterChange({ searchTerm: "", company: "all", location: "all", status: "all" });
  };

  const hasActiveFilters = searchTerm || selectedCompany !== "all" || selectedLocation !== "all" || selectedStatus !== "all";

  React.useEffect(() => {
    handleFilterChange();
  }, [searchTerm, selectedCompany, selectedLocation, selectedStatus]);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter Profiles</span>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs text-gray-500 hover:text-gray-700">
            <X className="w-3 h-3 mr-1" />Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-10" />
        </div>

        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="h-10"><SelectValue placeholder="All Companies" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.map(company => <SelectItem key={company} value={company}>{company}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="h-10"><SelectValue placeholder="All Locations" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map(location => <SelectItem key={location} value={location}>{location}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="h-10"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="To Contact">To Contact</SelectItem>
            <SelectItem value="Connected">Connected</SelectItem>
            <SelectItem value="Messaged">Messaged</SelectItem>
            <SelectItem value="Follow-up">Follow-up</SelectItem>
            <SelectItem value="Meeting Scheduled">Meeting Scheduled</SelectItem>
            <SelectItem value="Responded">Responded</SelectItem>
            <SelectItem value="Not Interested">Not Interested</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
