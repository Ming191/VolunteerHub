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
import { Mail, ArrowLeft, Shield, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import axios from "axios";
import LogoImg from "@/assets/logo.svg";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordScreen = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API endpoint when backend implements it
      await axios.post("/api/auth/forgot-password", {
        email: data.email,
      });

      toast.success("Password reset link sent!", {
        description:
          "Check your email for instructions to reset your password.",
      });

      // Reset form after successful submission
      form.reset();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Please check your email address and try again.";
      toast.error("Failed to send reset link", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual Panel */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <img
                src={LogoImg}
                alt="VolunteerHub"
                className="h-10 w-10 object-contain"
              />
              <span className="text-3xl font-bold">VolunteerHub</span>
            </div>

            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Reset Your
              <br />
              Password
            </h1>
            <p className="text-xl text-green-50 mb-12 leading-relaxed max-w-md">
              Don't worry! It happens to the best of us. Enter your email and
              we'll send you instructions to reset your password.
            </p>

            {/* Security Steps */}
            <div className="space-y-6">
              <motion.div
                className="flex items-start gap-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Enter Your Email
                  </h3>
                  <p className="text-green-50 text-sm">
                    Provide the email address associated with your account
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Check Your Inbox
                  </h3>
                  <p className="text-green-50 text-sm">
                    We'll send you a secure link to reset your password
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    Create New Password
                  </h3>
                  <p className="text-green-50 text-sm">
                    Choose a strong password to secure your account
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Form Panel */}
      <motion.div
        className="flex-1 flex items-center justify-center p-8 bg-white"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img
              src={LogoImg}
              alt="VolunteerHub"
              className="h-10 w-10 object-contain"
            />
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              Forgot password?
            </h2>
            <p className="text-gray-600">
              No worries, we'll send you reset instructions
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          className="pl-10 h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          </Form>

          {/* Back to sign in */}
          <div className="pt-4">
            <Link to="/signin" className="block">
              <Button
                variant="ghost"
                className="w-full text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="pt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Remember your password?{" "}
              <Link
                to="/signin"
                className="font-semibold text-green-600 hover:text-green-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
