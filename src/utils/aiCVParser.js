import { base44 } from "@/api/base44Client";

const SHARED_GEMINI_KEY = "AIzaSyATZyBOzfrdTun6XPaxYAtOltJUcumshrk";

export async function parseCVWithGemini(file, onProgress = () => {}) {
    try {
        onProgress("Uploading CV...");
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        onProgress("Analyzing with Gemini 1.5 Flash...");

        const prompt = `EXTRACT DATA from this CV. Return ONLY valid JSON:
        {
          "skills": [],
          "preferred_industries": [],
          "bio": "",
          "education": [{"degree":"","institution":"","field_of_study":"","start_year":"","end_year":"","description":""}],
          "professional_experience": [{"title":"","company":"","location":"","start_date":"","end_date":"","current":false,"description":""}],
          "certifications": [],
          "language": "en"
        }`;

        const res = await base44.integrations.Core.InvokeLLM({ apiKey: SHARED_GEMINI_KEY, model: "gemini-1.5-flash", prompt, file_urls: [file_url] });
        let params = typeof res === 'object' ? res : JSON.parse(String(res).slice(String(res).indexOf('{'), String(res).lastIndexOf('}') + 1));

        const find = (obj, keys) => {
            if (!obj || typeof obj !== 'object') return null;
            const k = Object.keys(obj).find(k => keys.includes(k.toLowerCase().replace(/[\s-_]/g, '')));
            if (k) return obj[k];
            for (const key of Object.keys(obj)) { const f = find(obj[key], keys); if (f) return f; }
            return null;
        };
        const arr = v => Array.isArray(v) ? v : (v && typeof v === 'object' ? Object.values(v) : []);

        const bio = find(params, ['bio','summary','about']);
        return {
            success: true,
            data: {
                skills: arr(find(params, ['skills','technologies','competencies'])),
                professional_experience: arr(find(params, ['professionalexperience','experience','workexperience'])),
                education: arr(find(params, ['education','academics','degrees'])),
                preferred_industries: arr(find(params, ['preferredindustries','industries'])),
                certifications: arr(find(params, ['certifications','licences'])),
                bio: typeof bio === 'string' ? bio : '',
                cv_file_url: file_url
            },
            raw: params
        };
    } catch (e) {
        return { success: false, error: e.message || 'Unknown error' };
    }
}
