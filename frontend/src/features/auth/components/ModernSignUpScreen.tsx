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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Heart,
  Users,
  Calendar,
  Award,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { useSignUpForm } from "../hooks/useSignUpForm";
import { motion } from "framer-motion";
import { useState } from "react";
import LogoImg from "@/assets/logo.svg";

export const ModernSignUpScreen = () => {
  const { form, onSubmit, isSubmitting } = useSignUpForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual Panel */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-emerald-600 via-green-500 to-teal-600 relative overflow-hidden"
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
                Start Your Journey
                <br />
                <span className="text-white/90">To Make an Impact</span>
              </h1>
              <p className="text-xl text-white/80 max-w-lg leading-relaxed">
                Create your free account and join a community of changemakers.
                Find opportunities, organize events, and track your volunteer
                impact.
              </p>
            </motion.div>

            {/* Benefits */}
            <motion.div
              className="space-y-4 pt-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Connect with Others</h3>
                  <p className="text-white/70">
                    Join thousands of volunteers making a difference
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Find Opportunities</h3>
                  <p className="text-white/70">
                    Discover events that match your interests
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Track Your Impact</h3>
                  <p className="text-white/70">
                    Monitor your contributions and achievements
                  </p>
                </div>
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

      {/* Right Side - Sign Up Form */}
      <motion.div
        className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 bg-white overflow-y-auto"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md space-y-6 py-8">
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
            <h2 className="text-3xl font-bold text-gray-900">
              Create your account
            </h2>
            <p className="text-gray-600">
              Join thousands of volunteers making a difference
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-5">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Full name
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-green-600" />
                          <Input
                            placeholder="John Doe"
                            className="pl-10 h-11 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200"
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
                            className="pl-10 h-11 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          Gender
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                            <SelectItem value="PREFER_NOT_TO_SAY">
                              Prefer not to say
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          I am a...
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                            <SelectItem value="EVENT_ORGANIZER">
                              Organizer
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                            className="pl-10 pr-10 h-11 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
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
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Confirm password
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-green-600" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10 h-11 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
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
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  By signing up, you agree to our{" "}
                  <span className="text-green-600">Terms of Service</span> and{" "}
                  <span className="text-green-600">Privacy Policy</span>
                </p>
              </form>
            </Form>
          </motion.div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-950 text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign in link */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/signin" className="block">
              <Button
                variant="outline"
                className="w-full h-12 text-base font-semibold border-2 border-gray-200 hover:border-green-600 hover:bg-green-50 dark:border-gray-800 dark:hover:bg-green-950 dark:hover:border-green-600 text-gray-700 dark:text-gray-300 transition-all duration-200"
              >
                Sign in instead
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
