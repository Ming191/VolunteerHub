import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/auth/api/authService";
import { toast } from "sonner";

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => authService.changePassword(data.currentPassword, data.newPassword),
    onError: () => {
      toast.success("Change password successfully!");
    }
  })
}
