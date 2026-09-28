import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { useState } from "react";

import { supabase } from "../../lib/supabase";


function Login() {

  const navigate = useNavigate();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // ============================================================
  // Login
  // ============================================================

  const handleLogin = async (event) => {

    event.preventDefault();

    setError("");


    if (!email.trim() || !password) {

      setError(
        "Please enter your email and password."
      );

      return;

    }


    try {

      setLoading(true);


      const {
        data,
        error,
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });


      if (error) {
        throw error;
      }


      if (!data.user) {

        throw new Error(
          "Unable to sign in. Please try again."
        );

      }


      navigate("/dashboard", {
        replace: true,
      });


    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      setError(
        error.message ||
        "Unable to sign in."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">

      <div className="w-full max-w-md">


        {/* Heading */}

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back
          </h1>

          <p className="mt-2 text-slate-600">
            Sign in to continue to your research workspace.
          </p>

        </div>


        {/* Card */}

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">


          {/* Error */}

          {error && (

            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">

              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <p>
                {error}
              </p>

            </div>

          )}


          <form onSubmit={handleLogin}>


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
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

              </div>

            </div>


            {/* Submit */}

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

                  Signing in...
                </>

              ) : (

                <>
                  Sign In
                  <ArrowRight size={18} />
                </>

              )}

            </button>

          </form>


          {/* Register */}

          <div className="mt-6 border-t border-slate-200 pt-6 text-center">

            <p className="text-sm text-slate-600">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Create account
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>

  );

}


export default Login;