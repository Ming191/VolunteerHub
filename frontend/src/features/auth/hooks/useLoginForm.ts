import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { loginSchema } from "../schemas/loginSchema";
import type { LoginFormValues } from "../types/ui-login";

export function useLoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: LoginFormValues) {
    try {
      setLoginError(null);
      // Clear form errors to allow fresh error display
      form.clearErrors();
      await login(values);
      toast.success("Login successful!");
      // Navigation will happen automatically via auth state change
      // The DashboardLayout or other auth checks will handle routing
    } catch (error: unknown) {
      let errorMessage = "Invalid email or password. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const response = (
          error as { response?: { data?: { message?: string } } }
        ).response;
        if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      }
      setLoginError(errorMessage);
      toast.error(errorMessage);
      // Don't reset form fields, just show error
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    loginError,
  };
}
