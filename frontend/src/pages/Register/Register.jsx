import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, LoaderCircle } from "lucide-react";
import { useState } from "react";

import { useAuth } from "../../context/AuthContext";

function Register() {
  const navigate = useNavigate();

  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (event) => {
  event.preventDefault();

  try {
    setLoading(true);
    setError("");

    const data = await signUp(
      email,
      password,
      name
    );

    console.log("Registration successful:", data);

    if (data?.session) {
      navigate("/dashboard");
    } else {
      setError(
        "Account created, but no session was returned."
      );
    }

  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    setError(
      error.message ||
      "Unable to create account."
    );

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold text-slate-900">
            Create your account
          </h1>

          <p className="mt-2 text-slate-600">
            Start organizing and understanding your research.
          </p>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister}>

            {/* Name */}

            <div className="mb-5">

              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Full name
              </label>

              <div className="relative">

                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Your name"
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                />

              </div>

            </div>

            {/* Email */}

            <div className="mb-5">

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                />

              </div>

            </div>

            {/* Password */}

            <div className="mb-6">

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Create a password"
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                />

              </div>

              <p className="mt-2 text-xs text-slate-500">
                Use at least 8 characters.
              </p>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}

            </button>

          </form>

          <div className="mt-6 border-t border-slate-200 pt-6 text-center">

            <p className="text-sm text-slate-600">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Sign in
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;