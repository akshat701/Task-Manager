import { useState } from "react";
import { apiClient } from "../api/apiClient";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import Toast from "../components/common/Toast";
import Loader from "../components/common/Loader";

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [toast, setToast] = useState<any>(null);

  const validate = () => {
    const newErrors: any = {};

    if (!email) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      newErrors.email = "Invalid email";

    if (!password) newErrors.password = "Password required";
    else if (password.length < 6)
      newErrors.password = "Min 6 chars";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await apiClient.post("/auth/login", {
        email,
        password,
      });

      setAuth(res.data.token, res.data.user);

      setToast({ message: "Login successful", type: "success" });

      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (err: any) {
      setToast({
        message:
          err.response?.data?.message || "Login failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-bg h-screen flex items-center justify-center">
      {loading && <Loader />}
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="card p-8 w-[380px] border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Welcome Back 👋
        </h2>

        <input
          placeholder="Email"
          className="input w-full mb-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mb-2">{errors.email}</p>
        )}

        <input
          type="password"
          placeholder="Password"
          className="input w-full mb-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mb-3">{errors.password}</p>
        )}

        <button
          className="button-primary w-full"
          onClick={handleLogin}
          disabled={loading}
        >
          Login
        </button>

        {/* <p className="text-center text-sm text-secondary mt-4">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-500">
            Register
          </Link>
        </p> */}
      </div>
    </div>
  );
}