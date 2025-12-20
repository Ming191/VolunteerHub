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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Heart } from "lucide-react";
import AnimatedPage from "@/components/common/AnimatedPage";
import { useSignUpForm } from "../hooks/useSignUpForm";
import LogoImg from "@/assets/logo.svg";

interface SignUpScreenProps {
  isTabbed?: boolean;
}

export const SignUpScreen = ({ isTabbed = false }: SignUpScreenProps) => {
  const { form, onSubmit, isSubmitting } = useSignUpForm();

  const cardContent = (
    <Card className="w-full max-w-md shadow-2xl border-2 border-green-100 dark:border-green-900/30 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
      <CardHeader className="space-y-3">
        {/* Logo/Icon */}
        {!isTabbed && (
          <div className="flex justify-center mb-2">
            <img
              src={LogoImg}
              alt="VolunteerHub"
              className="h-16 w-16 object-contain"
            />
          </div>
        )}
        <CardTitle className="text-3xl text-center bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent font-bold">
          Create an Account
        </CardTitle>
        <CardDescription className="text-center text-base text-gray-600 dark:text-gray-400">
          Join VolunteerHub to find or create events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender" />
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
                  <FormLabel>I am a...</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                      <SelectItem value="EVENT_ORGANIZER">
                        Event Organizer
                      </SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
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
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Account
            </Button>
          </form>
        </Form>
        {!isTabbed && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-semibold text-green-600 hover:text-green-700 underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return isTabbed ? (
    cardContent
  ) : (
    <AnimatedPage className="flex items-center justify-center min-h-screen py-12 bg-gradient-to-br from-green-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {cardContent}
    </AnimatedPage>
  );
};
