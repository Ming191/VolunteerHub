import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Mail,
  Lock,
  Users,
  Calendar,
  Award,
  Eye,
  EyeOff,
} from "lucide-react";
import { useLoginForm } from "../hooks/useLoginForm";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import LogoImg from "@/assets/logo.svg";

export const ModernSignInScreen = () => {
  const { form, onSubmit, isSubmitting } = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual Panel */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          {/* Logo and brand */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <img
                src={LogoImg}
                alt="VolunteerHub"
                className="h-10 w-10 object-contain"
              />
              <span className="text-3xl font-bold">VolunteerHub</span>
            </div>
          </motion.div>

          {/* Main content */}
          <div className="space-y-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <h1 className="text-5xl xl:text-6xl font-bold leading-tight">
                Make a Difference
                <br />
                <span className="text-white/90">One Volunteer at a Time</span>
              </h1>
              <p className="text-xl text-white/80 max-w-lg leading-relaxed">
                Join thousands of volunteers making real impact in their
                communities. Connect, contribute, and create lasting change.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-6 pt-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="text-3xl font-bold">10K+</span>
                </div>
                <p className="text-white/70 text-sm">Active Volunteers</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-3xl font-bold">500+</span>
                </div>
                <p className="text-white/70 text-sm">Events Monthly</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span className="text-3xl font-bold">100+</span>
                </div>
                <p className="text-white/70 text-sm">Organizations</p>
              </div>
            </motion.div>
          </div>

          {/* Bottom decorative element */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-white/60 text-sm"
          >
            © 2025 VolunteerHub. Making communities better together.
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Sign In Form */}
      <motion.div
        className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 bg-white"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <img
                src={LogoImg}
                alt="VolunteerHub"
                className="h-10 w-10 object-contain"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                VolunteerHub
              </span>
            </div>
          </div>

          {/* Header */}
          <motion.div
            className="space-y-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Email address
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-green-600" />
                          <Input
                            placeholder="name@example.com"
                            type="email"
                            className="pl-10 h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 text-gray-900 bg-white"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-green-600" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 text-gray-900 bg-white"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      <div className="flex justify-end mt-1">
                        <button
                          type="button"
                          onClick={() =>
                            (window.location.href = "/forgot-password")
                          }
                          className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors underline-offset-4 hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 hover:-translate-y-0.5"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Sign up link */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/signup" className="block">
              <Button
                variant="outline"
                className="w-full h-12 text-base font-semibold border-2 border-gray-200 hover:border-green-600 hover:bg-green-50 text-gray-700 transition-all duration-200"
              >
                <span className="text-gray-700 group-hover:text-gray-900 hover:text-gray-900 transition-colors">
                  Create an account
                </span>
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators (mobile) */}
          <div className="lg:hidden flex justify-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4 text-green-600" />
              <span>10K+ Users</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Award className="h-4 w-4 text-green-600" />
              <span>Trusted</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
