import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { logout } from "../model/authSlice";

const AuthHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useSelector((state) => state.auth.user);

  const wasVerified = searchParams.get("verified") === "1";

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  const initials = useMemo(
    () => user?.username?.slice(0, 2)?.toUpperCase() || "U",
    [user?.username]
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-slate-50 to-slate-100 px-6">
      <section className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
        {/* Top Accent */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600" />

        <div className="p-10">
          {/* Brand */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                Perplexity Lite
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h1>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
              {initials}
            </div>
          </div>

          {wasVerified && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-emerald-800">
                Email verified successfully
              </span>
            </div>
          )}

          <div className="mt-8 rounded-2xl bg-slate-50 p-6">
            <h2 className="text-sm font-medium text-slate-500">Signed in as</h2>

            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {user?.username}
            </p>

            {user?.email && (
              <p className="mt-1 text-sm text-slate-500">{user.email}</p>
            )}

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-700">
                Account Active
              </span>
            </div>
          </div>

          <p className="mt-6 text-slate-600">
            Your account is authenticated and ready to use. Continue to the
            application or sign out from this device.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="flex h-12 flex-1 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Continue to App
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="h-12 rounded-xl border border-slate-300 px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthHome;
