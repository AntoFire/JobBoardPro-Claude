export const getFollowUpCheck = (job) => {
    if (job.status !== "Applied" || !job.created_date) return null;

    const diffDays = Math.ceil(Math.abs(new Date() - new Date(job.created_date)) / (1000 * 60 * 60 * 24));

    if (diffDays >= 6) return { label: "Follow-up 2", color: "bg-red-50 text-red-700 border-red-200", urgent: true };
    if (diffDays >= 3) return { label: "Follow-up 1", color: "bg-amber-50 text-amber-700 border-amber-200", urgent: false };
    return null;
};
