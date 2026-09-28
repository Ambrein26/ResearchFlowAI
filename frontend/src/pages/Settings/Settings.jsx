import { useState } from "react";
import { Bell, Check, KeyRound, LogOut, Palette, Shield, SlidersHorizontal, Trash2 } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";

const SETTINGS_KEY = "researchflow-settings";
const defaults = {
  emailNotifications: true,
  analysisNotifications: true,
  assistantNotifications: true,
  responseStyle: "Balanced",
  outputPreference: "Structured",
  language: "English",
};

function Settings() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState(() => {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
    } catch {
      return defaults;
    }
  });
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setNotice("Preferences saved locally on this device.");
    setError("");
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (password.length < 6) {
      setError("Use at least 6 characters for a new password.");
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setPassword("");
    setNotice("Password updated through Supabase Authentication.");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="px-8 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Workspace control</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage appearance, assistant defaults, notifications, and security.</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 p-8">
        {(notice || error) && (
          <div className={`flex items-center gap-3 rounded-xl border p-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {error ? <Shield size={17} /> : <Check size={17} />}
            {error || notice}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3"><Palette className="text-indigo-600" size={20} /><div><h2 className="font-bold text-slate-900 dark:text-slate-100">Appearance</h2><p className="text-sm text-slate-500">Choose how ResearchFlow AI looks on this device.</p></div></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["light", "dark", "system"].map((option) => (
              <label key={option} className={`cursor-pointer rounded-xl border p-4 ${theme === option ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15" : "border-slate-200 dark:border-slate-700"}`}>
                <input type="radio" name="theme" value={option} checked={theme === option} onChange={() => setTheme(option)} className="accent-indigo-600" />
                <span className="ml-2 text-sm font-semibold capitalize text-slate-800 dark:text-slate-200">{option}</span>
                <span className="mt-1 block text-xs text-slate-500">{option === "system" ? "Follow operating system" : `Use ${option} mode`}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3"><SlidersHorizontal className="text-indigo-600" size={20} /><div><h2 className="font-bold text-slate-900 dark:text-slate-100">Preferences</h2><p className="text-sm text-slate-500">These preferences are saved locally on this device.</p></div></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">AI response style<select value={settings.responseStyle} onChange={(event) => updateSetting("responseStyle", event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal dark:border-slate-700"><option>Concise</option><option>Balanced</option><option>Detailed</option></select></label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Default output<select value={settings.outputPreference} onChange={(event) => updateSetting("outputPreference", event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal dark:border-slate-700"><option>Structured</option><option>Plain text</option><option>Bullet points</option></select></label>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Language<select value={settings.language} onChange={(event) => updateSetting("language", event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal dark:border-slate-700"><option>English</option></select></label>
          </div>
          <button type="button" onClick={saveSettings} className="mt-6 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Save preferences</button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3"><Bell className="text-indigo-600" size={20} /><div><h2 className="font-bold text-slate-900 dark:text-slate-100">Notifications</h2><p className="text-sm text-slate-500">Local controls for future notification integrations.</p></div></div>
          <div className="mt-6 space-y-3">
            {[['emailNotifications', 'Email notifications'], ['analysisNotifications', 'Analysis completion notifications'], ['assistantNotifications', 'Assistant response notifications']].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700"><span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span><input type="checkbox" checked={settings[key]} onChange={(event) => updateSetting(key, event.target.checked)} className="h-4 w-4 accent-indigo-600" /></label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3"><KeyRound className="text-indigo-600" size={20} /><div><h2 className="font-bold text-slate-900 dark:text-slate-100">Security</h2><p className="text-sm text-slate-500">Authenticated as {user?.email || "your account"} through Supabase.</p></div></div>
          <form onSubmit={changePassword} className="mt-6 flex flex-col gap-3 sm:flex-row"><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 dark:border-slate-700" /><button type="submit" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Change password</button></form>
          <button type="button" onClick={signOut} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"><LogOut size={16} />Sign out</button>
          <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Delete account</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Account deletion requires a secure backend service-role flow and is intentionally unavailable in this browser-only client.</p>
            <button type="button" disabled title="Requires secure backend account-deletion support" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-400 disabled:cursor-not-allowed dark:border-red-900"><Trash2 size={15} />Delete account unavailable</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Settings;
