import React, { useState } from "react";
import logo from "./assets/react.svg";
import {Link, useNavigate} from "react-router-dom";
import {toast} from "sonner";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"volunteer" | "organizer">("volunteer");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function handleSignupSubmit(event: React.FormEvent) {
    event.preventDefault(); // Ngăn form reload trang

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: fullName,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      const text = await data.text();
      console.log("Raw response:", text);

      if (!response.ok) {
        toast.error(data.error || "Invalid email or password.", {
          className: "bg-red-50 border border-red-200 text-red-800 font-medium",
          icon: "❌",
        });
        return;
      }
      const token = data.token;

      // ✅ Lưu token vào localStorage
      localStorage.setItem("authToken", token);

      // ✅ Điều hướng sang Dashboard
      toast.success("Registration successful! 🎉", {
        className: "bg-green-50 border border-green-200 text-green-800 font-medium",
        icon: "✅",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Register failed:", error);
      alert("An error occurred while register. Please try again later.");
    }
  }

  return (
    <div className="flex min-h-screen w-full justify-center items-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-md shadow-sm rounded-xl p-6 md:p-10 m-2 md:m-4 flex flex-col gap-6 md:gap-10 flex-1 max-h-full overflow-y-auto">
        {/* Logo */}
        <div className="flex justify-center">
          <img src={logo} alt="Logo" className="w-8 h-8 md:w-10 md:h-10" /> {/* Responsive size */}
        </div>

        {/* Welcome text */}
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900"> {/* Responsive text */}
            Create your account
          </h1>
          <p className="text-gray-500 text-xs md:text-sm">
            Join us and start your journey with Edulab
          </p>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4 md:gap-6">
          {/* Full name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-800">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-10 md:h-12 px-3 md:px-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Email - tương tự, thêm responsive */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-800">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 md:h-12 px-3 md:px-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-800">
              Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 md:px-4 h-10 md:h-12"> {/* Responsive */}
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 outline-none bg-transparent text-sm md:text-base"
              />
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 p-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <i className="fa-regular fa-eye-slash text-sm" />
                  ) : (
                  <i className="fa-regular fa-eye text-sm" />
                  )}
              </button>
            </div>
          </div>

          {/* Confirm password - tương tự */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-800">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-10 md:h-12 px-3 md:px-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Role select */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-800">
              You are signing up as
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setRole("volunteer")}
                className={`flex items-center justify-center gap-3 border rounded-lg px-3 md:px-4 py-2 md:py-3 w-full transition text-sm ${
                  role === "volunteer"
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
              <span className="text-gray-800 text-xs md:text-sm"> {/* Responsive text */}
                Volunteer
              </span>
              </button>

              <button
                onClick={() => setRole("organizer")}
                className={`flex items-center justify-center gap-3 border rounded-lg px-3 md:px-4 py-2 md:py-3 w-full transition text-sm ${
                  role === "organizer"
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
              <span className="text-gray-800 text-xs md:text-sm">
                Organizer
              </span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button className="w-full bg-indigo-900 hover:bg-indigo-800 text-white rounded-lg h-10 md:h-12 transition font-medium text-sm md:text-base">
            Sign Up
          </button>
        </form>

        {/* Bottom text */}
        <p className="text-center text-xs md:text-sm text-gray-600"> {/* Responsive */}
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-indigo-600 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
