import { useState } from "react";
import { useDispatch ,useSelector} from "react-redux";
import { useNavigate , Navigate} from "react-router-dom";
import AuthShell from "../components/AuthShell";
import FormField from "../components/FormField";
import { login } from "../model/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await dispatch(login(form)).unwrap();
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  if(loading && user){
    return <Navigate to="/dashboard" replace />
  }

  return (
    <AuthShell
      title="Login"
      subtitle="Enter your email and password to continue."
      footerText="Do not have an account?"
      footerLinkText="Register"
      footerHref="/register"
    >
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <FormField
          id="email"
          label="Email address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <FormField
          id="password"
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        {error ? (
          <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <button
          className="h-12 w-full rounded-[8px] bg-cyan-500 px-4 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:bg-cyan-300"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;
