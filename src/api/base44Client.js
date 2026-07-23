// Firebase-backed client for base44
import { auth, db, googleProvider } from '../firebaseConfig';
import { signInWithPopup } from "firebase/auth";
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    setDoc
} from 'firebase/firestore';
import { extractTextFromPDF } from '../utils/cvParser';

const getCurrentUid = () => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    return auth.currentUser.uid;
};

export const base44 = {
    auth: {
        me: async () => {
            return new Promise((resolve, reject) => {
                const unsubscribe = auth.onAuthStateChanged(async (user) => {
                    unsubscribe();
                    if (!user) {
                        reject(new Error("Not authenticated"));
                        return;
                    }
                    try {
                        const docRef = doc(db, 'users', user.uid);
                        const snapshot = await getDoc(docRef);
                        if (snapshot.exists()) {
                            resolve({ id: snapshot.id, ...snapshot.data(), uid: user.uid, email: user.email });
                        } else {
                            const newUser = {
                                uid: user.uid,
                                email: user.email,
                                full_name: user.displayName || 'User',
                                role: 'user',
                                created_date: new Date().toISOString()
                            };
                            resolve(newUser);
                        }
                    } catch (err) {
                        console.error("Error fetching user profile:", err);
                        resolve({
                            uid: user.uid,
                            email: user.email,
                            full_name: user.displayName,
                            role: 'user'
                        });
                    }
                });
            });
        },
        signInWithGoogle: async () => {
            try {
                const result = await signInWithPopup(auth, googleProvider);
                const user = result.user;
                const userDocRef = doc(db, 'users', user.uid);
                const snapshot = await getDoc(userDocRef);
                if (!snapshot.exists()) {
                    const newUser = {
                        uid: user.uid,
                        email: user.email,
                        full_name: user.displayName,
                        photoURL: user.photoURL,
                        role: 'user',
                        created_date: new Date().toISOString(),
                        gamification: {
                            total_points: 0,
                            level: 1,
                            achievements: [],
                            current_streak: 0
                        }
                    };
                    await setDoc(userDocRef, newUser);
                }
                return user;
            } catch (error) {
                console.error("Google Sign In Error", error);
                throw error;
            }
        },
        updateMe: async (data) => {
            const uid = getCurrentUid();
            const userDocRef = doc(db, 'users', uid);
            const snapshot = await getDoc(userDocRef);
            if (snapshot.exists()) {
                await updateDoc(userDocRef, data);
            } else {
                await setDoc(userDocRef, { ...data, uid }, { merge: true });
            }
            const updatedSnap = await getDoc(userDocRef);
            return { id: uid, ...updatedSnap.data() };
        },
        signOut: async () => {
            await auth.signOut();
        }
    },
    entities: {
        JobApplication: {
            list: async (sortStr) => {
                const uid = getCurrentUid();
                let q = query(collection(db, 'jobs'), where('uid', '==', uid));
                const snapshot = await getDocs(q);
                let jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (sortStr === "-created_date") {
                    jobs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
                }
                return jobs;
            },
            create: async (data) => {
                const uid = data.uid || getCurrentUid();
                const newJob = {
                    ...data,
                    uid,
                    created_date: new Date().toISOString()
                };
                const docRef = await addDoc(collection(db, 'jobs'), newJob);
                return { id: docRef.id, ...newJob };
            },
            update: async (id, data) => {
                const docRef = doc(db, 'jobs', id);
                await updateDoc(docRef, data);
                return { id, ...data };
            },
            delete: async (id) => {
                await deleteDoc(doc(db, 'jobs', id));
                return { success: true };
            },
            filter: async (criteria) => {
                const uid = getCurrentUid();
                let q = query(collection(db, 'jobs'), where('uid', '==', uid));
                Object.keys(criteria).forEach(key => {
                    q = query(q, where(key, '==', criteria[key]));
                });
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            },
            listAll: async () => {
                const snapshot = await getDocs(collection(db, 'jobs'));
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
        },
        LinkedInProfile: {
            list: async () => {
                const uid = getCurrentUid();
                const q = query(collection(db, 'linkedin_profiles'), where('uid', '==', uid));
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            },
            create: async (data) => {
                const uid = data.uid || getCurrentUid();
                const newProfile = {
                    ...data,
                    uid,
                    created_date: new Date().toISOString()
                };
                const docRef = await addDoc(collection(db, 'linkedin_profiles'), newProfile);
                return { id: docRef.id, ...newProfile };
            },
            update: async (id, data) => {
                const docRef = doc(db, 'linkedin_profiles', id);
                await updateDoc(docRef, data);
                return { id, ...data };
            },
            delete: async (id) => {
                await deleteDoc(doc(db, 'linkedin_profiles', id));
                return { success: true };
            },
            filter: async (criteria) => {
                const uid = getCurrentUid();
                let q = query(collection(db, 'linkedin_profiles'), where('uid', '==', uid));
                Object.keys(criteria).forEach(key => {
                    q = query(q, where(key, '==', criteria[key]));
                });
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            },
            listAll: async () => {
                const snapshot = await getDocs(collection(db, 'linkedin_profiles'));
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
        },
        JobWatcher: {
            list: async () => {
                const uid = getCurrentUid();
                const q = query(collection(db, 'job_watchers'), where('uid', '==', uid));
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            },
            create: async (data) => {
                const uid = getCurrentUid();
                const newWatcher = {
                    ...data,
                    uid,
                    created_date: new Date().toISOString(),
                    last_checked: null
                };
                const docRef = await addDoc(collection(db, 'job_watchers'), newWatcher);
                return { id: docRef.id, ...newWatcher };
            },
            update: async (id, data) => {
                const docRef = doc(db, 'job_watchers', id);
                await updateDoc(docRef, data);
                return { id, ...data };
            },
            delete: async (id) => {
                await deleteDoc(doc(db, 'job_watchers', id));
                return { success: true };
            }
        },
        User: {
            list: async () => {
                const snapshot = await getDocs(collection(db, 'users'));
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            },
            get: async (id) => {
                const docRef = doc(db, 'users', id);
                const snapshot = await getDoc(docRef);
                return { id: snapshot.id, ...snapshot.data() };
            }
        }
    },
    admin: {
        seedDemoData: async () => {
            const uid = getCurrentUid();
            const FAKE_JOBS = [
                { title: "Software Engineer", company: "Google", status: "Applied", location: "Mountain View", contract_type: "Full-time", job_link: "https://google.com/careers" },
                { title: "Frontend Dev", company: "Meta", status: "Interview", location: "Remote", contract_type: "Contract", job_link: "https://meta.com/careers" },
                { title: "Product Manager", company: "Linear", status: "To Apply", location: "San Francisco", contract_type: "Full-time", job_link: "https://linear.app/careers" },
            ];
            for (const job of FAKE_JOBS) {
                await base44.entities.JobApplication.create(job);
            }
            return { success: true, message: `Created ${FAKE_JOBS.length} demo jobs.` };
        }
    },
    integrations: {
        Core: {
            UploadFile: async ({ file }) => {
                return { file_url: URL.createObjectURL(file) };
            },
            InvokeLLM: async ({ prompt, file_urls, apiKey, ...props }) => {
                try {
                    const fileUrl = file_urls[0];
                    if (!fileUrl) throw new Error("No file URL provided");
                    const response = await fetch(fileUrl);
                    const blob = await response.blob();
                    const base64Data = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result.split(',')[1]);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                    const selectedModel = props.model || "gemini-1.5-flash";
                    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
                    const payload = {
                        contents: [{
                            parts: [
                                { text: prompt },
                                { inline_data: { mime_type: blob.type || "application/pdf", data: base64Data } }
                            ]
                        }],
                        generationConfig: { response_mime_type: "application/json" }
                    };
                    const llmReq = await fetch(apiURL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });
                    if (!llmReq.ok) {
                        const err = await llmReq.json();
                        throw new Error(err.error?.message || "Gemini API Request Failed");
                    }
                    const llmRes = await llmReq.json();
                    const textResponse = llmRes.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!textResponse) throw new Error("Empty response from AI");
                    return JSON.parse(textResponse);
                } catch (error) {
                    console.error("LLM Error:", error);
                    throw error;
                }
            }
        }
    }
};
