import React, { useState } from "react";
import teacher1 from "./assets/react.svg";
import teacher2 from "./assets/react.svg";
import logo from "./assets/react.svg";
import volunteerImage from './assets/Volunteer_Hub.png';
import {Link, useNavigate} from "react-router-dom";
import {toast} from "sonner";

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selected, setSelected] = useState<"teacher1" | "teacher2">("teacher1");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate()

  async function handleLoginSubmit(event: React.FormEvent) {
    event.preventDefault(); // Ngăn form reload trang

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Invalid email or password.", {
          className: "bg-red-50 border border-red-200 text-red-800 font-medium",
          icon: "❌",
        });
        return;
      }

      // ✅ Lưu token vào localStorage
      const token = data.token;
      localStorage.setItem("authToken", token);

      // ✅ Điều hướng sang Dashboard
      toast.success("Login successful! 🎉", {
        className: "bg-green-50 border border-green-200 text-green-800 font-medium",
        icon: "✅",
      });
      navigate("/dashboardLayout");
    } catch (error) {
      console.error("Login failed:", error);
      alert("An error occurred while logging in. Please try again later.");
    }
  }

  return (
    <div className="flex p-4">
      <div className="flex-[3] min-h-screen flex justify-center items-center bg-gray-50 mr-[16px]">
        <div className=" w-[420px] shadow-sm rounded-xl p-10 flex flex-col gap-10">
          {/* Logo */}
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="w-10 h-10"/>
          </div>

          {/* Welcome Text */}
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome to VolunteerHub
            </h1>
            <p className="text-gray-500 text-sm">
              Your Learning, Your Way
              <br/>
              Access Your Courses at Edulab
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-6">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-800">
                Email Address
              </label>
              <input
                type="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-800">
                Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-4 h-12">
                <input
                  type={showPassword ? "text" : "password"}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="flex-1 outline-none bg-transparent"
                />
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <i className="fa-regular fa-eye-slash"/>
                  ) : (
                    <i className="fa-regular fa-eye"/>
                  )}
                </button>
              </div>
            </div>

            {/* User Type */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-gray-800">
                You will sign in as
              </p>

              <button
                onClick={() => setSelected("teacher1")}
                className={`flex items-center gap-3 border rounded-lg px-4 py-3 w-full transition ${
                  selected === "teacher1"
                    ? "border-indigo-600"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <img src={teacher1} alt="Teacher 1" className="w-6 h-6 rounded-full"/>
                <span className="text-gray-800 text-sm">Sign in as a Volunteer</span>
              </button>

              <button
                onClick={() => setSelected("teacher2")}
                className={`flex items-center gap-3 border rounded-lg px-4 py-3 w-full transition ${
                  selected === "teacher2"
                    ? "border-indigo-600"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <img src={teacher2} alt="Teacher 2" className="w-6 h-6 rounded-full"/>
                <span className="text-gray-800 text-sm">Sign in as a Organizer</span>
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-indigo-900 hover:bg-indigo-800 text-white rounded-lg h-12 transition font-medium">
              Sign in
            </button>

            {/*signup-link*/}
            <p className="text-center">
              Don't have an account?{" "}
              <Link to="/signup" className="text-indigo-600 hover:underline">
                Sign up here.
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="flex-[4] flex flex-col justify-center items-center">
        <img
          src={volunteerImage}
          alt="volunteerImage"
          className="w-full h-full object-cover"
        />
        <h2 className="text-xl  px-6 py-3 rounded-lg">
          "Together We Can, Volunteers Hand in Hand."
        </h2>
      </div>
    </div>
  );
}
