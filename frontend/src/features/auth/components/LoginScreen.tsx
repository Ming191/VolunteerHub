import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Heart, Loader2, Mail, Lock, Users, Award, Shield } from "lucide-react";
import AnimatedPage from "@/components/common/AnimatedPage";
import { useLoginForm } from "../hooks/useLoginForm";
import { motion } from "framer-motion";

interface LoginScreenProps {
  isTabbed?: boolean;
}

export const LoginScreen = ({ isTabbed = false }: LoginScreenProps) => {
  const { form, onSubmit, isSubmitting } = useLoginForm();

  const cardContent = (
    <Card className="w-full max-w-md shadow-2xl border-2 border-gray-200 bg-white/95 backdrop-blur-xl">
      <CardHeader className="space-y-4 pb-6">
        {/* Logo/Icon with animation */}
        <motion.div
          className="flex justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
        >
          <div className="p-5 rounded-3xl bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-2xl relative overflow-hidden group hover:shadow-green-500/50 transition-all duration-300 hover:scale-105">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            <Heart className="h-12 w-12 text-white fill-white relative z-10 drop-shadow-lg" />
          </div>
        </motion.div>

        <div className="space-y-2">
          <CardTitle className="text-4xl text-center bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 bg-clip-text text-transparent font-extrabold tracking-tight">
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-center text-base text-gray-600 font-medium">
            Sign in to continue making a difference in your community
          </CardDescription>
        </div>

        {/* Trust indicators */}
        {!isTabbed && (
          <div className="flex justify-center gap-6 pt-2">
            <motion.div
              className="flex items-center gap-1.5 text-xs text-gray-500"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Shield className="h-4 w-4 text-green-600" />
              <span>Secure</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-1.5 text-xs text-gray-500"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Users className="h-4 w-4 text-green-600" />
              <span>10K+ Volunteers</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-1.5 text-xs text-gray-500"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Award className="h-4 w-4 text-green-600" />
              <span>Trusted</span>
            </motion.div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6 px-8 pb-8">
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-gray-700">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                      <Input
                        placeholder="name@example.com"
                        type="email"
                        className="pl-11 h-12 border-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-white"
                        aria-label="Email address"
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
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-base font-semibold text-gray-700">
                      Password
                    </FormLabel>
                    {!isTabbed && (
                      <Link
                        to="/signin"
                        className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                      >
                        Forgot?
                      </Link>
                    )}
                  </div>
                  <FormControl>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-11 h-12 border-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-white"
                        aria-label="Password"
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
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
              disabled={isSubmitting}
              aria-label="Sign in to your account"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <Heart className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
        {!isTabbed && (
          <div className="mt-8 text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  New to VolunteerHub?
                </span>
              </div>
            </div>
            <Link to="/signup" className="block w-full">
              <Button
                variant="outline"
                className="w-full h-11 font-semibold border-2 border-green-200 hover:border-green-500 hover:bg-green-50 text-green-700 transition-all duration-300"
              >
                Create Account
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return isTabbed ? (
    cardContent
  ) : (
    <AnimatedPage className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-100/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4">{cardContent}</div>
    </AnimatedPage>
  );
};
