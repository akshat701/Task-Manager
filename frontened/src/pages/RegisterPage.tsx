import { useState } from "react";
import { apiClient } from "../api/apiClient";
import { useNavigate, Link } from "react-router-dom";
import Toast from "../components/common/Toast";
import Loader from "../components/common/Loader";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<any>(null);

  const handleRegister = async () => {
    try {
      setLoading(true);

      await apiClient.post("/auth/signup", {
        name,
        email,
        password,
      });

      setToast({
        message: "Registered successfully!",
        type: "success",
      });

      setTimeout(() => navigate("/login"), 1000);

    } catch (err: any) {
      setToast({
        message:
          err.response?.data?.message ||
          "Registration failed",
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

      <div className="card p-8 w-[380px]">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Account 🚀
        </h2>

        <input
          placeholder="Name"
          className="input w-full mb-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          className="input w-full mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="input w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="button-primary w-full"
          onClick={handleRegister}
        >
          Register
        </button>

        <p className="text-center mt-4">
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}