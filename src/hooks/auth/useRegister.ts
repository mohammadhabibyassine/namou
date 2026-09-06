import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { registerUser } from "@/services/api/v1/auth.api";
import { RegisterDto, RegistrationResult } from "@/types/api/auth.types";
import { extractValidationErrors } from "@/utils/errorHandler";
import { logger } from "@/utils/logger";
import { useAuthStore } from "@/store";
import { usePostAuthentication } from "./usePostAuthentication";

interface UseRegisterOptions extends Omit<
  UseMutationOptions<RegistrationResult, Error, RegisterDto>,
  "mutationFn"
> {
  onValidationError?: (errors: Record<string, string[]>) => void;
}

export const useRegister = (options?: UseRegisterOptions) => {
  const completeLogin = useAuthStore((state) => state.completeLogin);
  const complete = usePostAuthentication();
  return useMutation<RegistrationResult, Error, RegisterDto>({
    ...options,
    mutationFn: registerUser,
    onSuccess: async (data, variables, onMutateResult, context) => {
      completeLogin(data);
      await complete(data.user);
      logger.info("Registration successful", { userId: data.user.id });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      logger.error("Registration failed", error);
      const validationErrors = extractValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        options?.onValidationError?.(validationErrors);
      }
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
};
