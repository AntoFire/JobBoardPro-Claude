export const MAJORS_CITIES = [
    "Paris", "Lyon", "Marseille", "Bordeaux", "Lille",
    "Toulouse", "Nantes", "Strasbourg", "Montpellier", "Nice",
    "Rennes", "Remote", "Teletravail", "Télétravail"
];

export const normalizeLocation = (location) => {
    if (!location) return "Unknown";
    const lower = String(location).toLowerCase().trim();
    for (const city of MAJORS_CITIES) {
        if (lower.includes(city.toLowerCase())) {
            if (city === "Télétravail" || city === "Teletravail") return "Remote";
            return city;
        }
    }
    return String(location).split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ').trim();
};
