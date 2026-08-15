import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  User,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
function Settings() {

  return (

    <div className="min-h-screen bg-slate-50">

      {/* Header */}

      <header className="border-b border-slate-200 bg-white">

        <div className="px-8 py-5">

          <h1 className="text-2xl font-bold text-slate-900">
            Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your ResearchFlow AI preferences.
          </p>

        </div>

      </header>


      {/* Content */}

      <main className="mx-auto max-w-4xl space-y-6 p-8">

        {/* General */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">

              <SettingsIcon size={19} />

            </div>

            <div>

              <h2 className="font-bold text-slate-900">
                General
              </h2>

              <p className="text-sm text-slate-500">
                General workspace preferences.
              </p>

            </div>

          </div>


          <div className="mt-6">

            <label className="block text-sm font-medium text-slate-700">

              Workspace name

            </label>

            <input
              type="text"
              defaultValue="My Research Workspace"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

          </div>

        </section>


        {/* Notifications */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">

              <Bell size={19} />

            </div>

            <div>

              <h2 className="font-bold text-slate-900">
                Notifications
              </h2>

              <p className="text-sm text-slate-500">
                Control research workspace notifications.
              </p>

            </div>

          </div>


          <div className="mt-6 space-y-4">

            <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4">

              <div>

                <p className="text-sm font-semibold text-slate-900">
                  Analysis notifications
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Notify when paper analysis is completed.
                </p>

              </div>

              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-indigo-600"
              />

            </label>


            <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4">

              <div>

                <p className="text-sm font-semibold text-slate-900">
                  AI assistant notifications
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Receive notifications related to AI research activity.
                </p>

              </div>

              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-indigo-600"
              />

            </label>

          </div>

        </section>


        {/* Security */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">

              <Shield size={19} />

            </div>

            <div>

              <h2 className="font-bold text-slate-900">
                Security
              </h2>

              <p className="text-sm text-slate-500">
                Your account is secured using Supabase Authentication.
              </p>

            </div>

          </div>


          <div className="mt-6 rounded-lg bg-slate-50 p-4">

            <div className="flex items-center gap-3">

              <User
                size={18}
                className="text-slate-500"
              />

              <div>

                <p className="text-sm font-semibold text-slate-900">
                  Authentication
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Your account session is managed securely by Supabase.
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>

  );

}


export default Settings;