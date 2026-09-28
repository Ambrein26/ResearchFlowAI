import { useEffect, useState } from "react";
import { Activity, Calendar, FileText, Mail, Pencil, Shield, Trash2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { supabase } from "../../lib/supabase";
import api from "../../services/api";

const fields = [
  ["institution", "Institution / college"],
  ["department", "Department"],
  ["academic_year", "Academic year"],
  ["research_interests", "Research interests"],
  ["bio", "Short bio"],
];

function Profile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [stats, setStats] = useState({ papers: 0, bookmarks: 0, conversations: 0 });
  const metadata = user?.user_metadata || {};
  const name = metadata.full_name || metadata.name || user?.email?.split("@")[0] || "Researcher";
  const [form, setForm] = useState(() => ({
    full_name: name,
    ...Object.fromEntries(fields.map(([key]) => [key, metadata[key] || ""])),
  }));

  const email = user?.email || "No email";
  const initial = name.charAt(0).toUpperCase();
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Not available";

  useEffect(() => {
    let cancelled = false;
    const loadStats = async () => {
      try {
        const paperResponse = await api.get("/api/papers");
        const papers = paperResponse.data.papers || [];
        let bookmarks = 0;
        let conversations = 0;
        await Promise.all(papers.map(async (paper) => {
          const [bookmarkResponse, conversationResponse] = await Promise.all([
            api.get(`/api/papers/${paper.id}/bookmarks`),
            api.get("/api/conversations", { params: { paper_id: paper.id } }),
          ]);
          bookmarks += bookmarkResponse.data.count || 0;
          conversations += conversationResponse.data.count || 0;
        }));
        if (!cancelled) setStats({ papers: papers.length, bookmarks, conversations });
      } catch (loadError) {
        console.error("Failed to load profile activity:", loadError);
      }
    };
    loadStats();
    return () => { cancelled = true; };
  }, []);

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const saveProfile = async (event) => {
    event.preventDefault();
    const { error: updateError } = await supabase.auth.updateUser({ data: form });
    if (updateError) {
      setError(updateError.message);
      setNotice("");
      return;
    }
    setEditing(false);
    setNotice("Profile details saved to your Supabase account metadata.");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="px-8 py-6"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Researcher account</p><h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Profile</h1><p className="mt-1 text-sm text-slate-500">Your identity, academic context, and activity.</p></div></header>
      <main className="mx-auto max-w-5xl space-y-6 p-8">
        {(notice || error) && <div className={`rounded-xl border p-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{error || notice}</div>}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-5"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">{initial}</div><div><h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{name}</h2><p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><Mail size={15} />{email}</p><p className="mt-2 text-xs text-slate-500">{user?.email_confirmed_at ? "Email verified" : "Email verification pending"}</p></div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setEditing((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"><Pencil size={16} />{editing ? "Close editor" : "Edit profile"}</button><Link to="/settings" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Change password</Link><button type="button" onClick={() => setDeleteOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 dark:border-red-900"><Trash2 size={16} />Delete account</button></div></div></section>

        {editing && <form onSubmit={saveProfile} className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-6 dark:border-indigo-900 dark:bg-indigo-500/10"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full name<input value={form.full_name || ""} onChange={(event) => updateField("full_name", event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 dark:border-slate-700" /></label>{fields.map(([key, label]) => <label key={key} className={`text-sm font-semibold text-slate-700 dark:text-slate-300 ${key === "bio" ? "sm:col-span-2" : ""}`}>{label}{key === "bio" ? <textarea rows={4} value={form[key] || ""} onChange={(event) => updateField(key, event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 dark:border-slate-700" /> : <input value={form[key] || ""} onChange={(event) => updateField(key, event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 dark:border-slate-700" />}</label>)}</div><button type="submit" className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Save profile</button></form>}

        <section className="grid gap-4 sm:grid-cols-3"><Stat icon={FileText} label="Uploaded papers" value={stats.papers} /><Stat icon={Activity} label="Bookmarks" value={stats.bookmarks} /><Stat icon={UserRound} label="Assistant conversations" value={stats.conversations} /></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><h3 className="font-bold text-slate-900 dark:text-slate-100">Account details</h3><div className="mt-5 grid gap-4 sm:grid-cols-2"><Detail icon={Calendar} label="Account created" value={createdAt} /><Detail icon={Shield} label="Authentication" value="Supabase Auth" /><Detail icon={Mail} label="Email" value={email} /><Detail icon={UserRound} label="Research interests" value={metadata.research_interests || "Not added yet"} /></div></section>
      </main>
      {deleteOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"><h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Account deletion</h2><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Deleting a Supabase account and its user-owned data requires a secure backend service-role operation. No deletion was performed.</p><button type="button" onClick={() => setDeleteOpen(false)} className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">Close</button></div></div>}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><Icon size={18} className="text-indigo-600" /><p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>; }
function Detail({ icon: Icon, label, value }) { return <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700"><Icon size={18} className="mt-0.5 text-indigo-600" /><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p></div></div>; }

export default Profile;
