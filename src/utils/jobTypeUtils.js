export const normalizeJobType = (typeStr) => {
    if (!typeStr) return "Other";
    const lower = typeStr.toLowerCase().trim();
    if (lower.includes('intern') || lower.includes('stage') || lower.includes('trainee')) return "Stage";
    if (lower.includes('alternance') || lower.includes('apprenti') || lower.includes('apprentice')) return "Alternance";
    if (lower.includes('cdi') || lower.includes('full-time') || lower.includes('full time') || lower.includes('permanent')) return "CDI";
    if (lower.includes('cdd') || lower.includes('fixed-term') || lower.includes('temporary') || lower.includes('contract')) return "CDD";
    if (lower.includes('freelance') || lower.includes('independant') || lower.includes('contractor')) return "Freelance";
    const validTypes = ["Stage", "Alternance", "CDI", "CDD", "Freelance"];
    const cap = lower.charAt(0).toUpperCase() + lower.slice(1);
    return validTypes.includes(cap) ? cap : "Other";
};

export const JOB_TYPES = ["All Types", "CDI", "CDD", "Alternance", "Stage", "Freelance", "Other"];
