import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { signUpSchema } from "../schemas/signupSchema";
import type { SignUpFormValues } from "../types/ui-signup";

export function useSignUpForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: SignUpFormValues) {
    try {
      // Map form values to RegisterRequest format
      await registerUser({
        username: values.username,
        email: values.email,
        password: values.password,
        gender: values.gender as
          | "MALE"
          | "FEMALE"
          | "OTHER"
          | "PREFER_NOT_TO_SAY",
        role: values.role as "VOLUNTEER" | "EVENT_ORGANIZER" | undefined,
      });
      toast.success("Registration successful!", {
        description: "Please check your email to verify your account.",
      });
      navigate({ to: "/signin" });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (
              error as {
                response?: { data?: { message?: string; error?: string } };
              }
            ).response?.data?.error ||
            (
              error as {
                response?: { data?: { message?: string; error?: string } };
              }
            ).response?.data?.message ||
            "Registration failed. Please try again."
          : "Registration failed. Please try again.";
      toast.error("Registration failed", {
        description: errorMessage,
      });
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
  };
}
