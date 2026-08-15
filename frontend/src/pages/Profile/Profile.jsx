import {
  User,
  Mail,
  Calendar,
  ArrowLeft,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";


function Profile() {

  const { user } = useAuth();


  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Researcher";


  const email =
    user?.email || "No email";


  const initial =
    name.charAt(0).toUpperCase();


  const createdAt = user?.created_at
    ? new Date(
        user.created_at
      ).toLocaleDateString()
    : "Not available";


  return (

    <div className="min-h-screen bg-slate-50">

      {/* Header */}

      <header className="border-b border-slate-200 bg-white">

        <div className="px-8 py-5">

          <div className="flex items-center gap-3">

            <Link
              to="/dashboard"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >

              <ArrowLeft size={20} />

            </Link>


            <div>

              <h1 className="text-2xl font-bold text-slate-900">
                Profile
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View your ResearchFlow AI account information.
              </p>

            </div>

          </div>

        </div>

      </header>


      {/* Content */}

      <main className="mx-auto max-w-4xl p-8">

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Profile Header */}

          <div className="border-b border-slate-200 p-8">

            <div className="flex items-center gap-5">

              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">

                {initial}

              </div>


              <div>

                <h2 className="text-2xl font-bold text-slate-900">

                  {name}

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  {email}

                </p>

              </div>

            </div>

          </div>


          {/* Account Information */}

          <div className="p-8">

            <h3 className="text-lg font-bold text-slate-900">
              Account Information
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Information associated with your account.
            </p>


            <div className="mt-6 space-y-4">

              {/* Name */}

              <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">

                  <User size={19} />

                </div>

                <div>

                  <p className="text-xs font-medium text-slate-500">
                    Full Name
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {name}
                  </p>

                </div>

              </div>


              {/* Email */}

              <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">

                  <Mail size={19} />

                </div>

                <div>

                  <p className="text-xs font-medium text-slate-500">
                    Email Address
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {email}
                  </p>

                </div>

              </div>


              {/* Created */}

              <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">

                  <Calendar size={19} />

                </div>

                <div>

                  <p className="text-xs font-medium text-slate-500">
                    Account Created
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {createdAt}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>

  );

}


export default Profile;