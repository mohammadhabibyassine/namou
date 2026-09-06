import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { loginUser } from "@/services/api/v1/auth.api";
import { LoginDto, LoginResult } from "@/types/api/auth.types";
import { useAuthStore } from "@/store";
import { extractValidationErrors } from "@/utils/errorHandler";
import { logger } from "@/utils/logger";
import { usePostAuthentication } from "./usePostAuthentication";

interface UseLoginOptions extends Omit<
  UseMutationOptions<LoginResult, Error, LoginDto>,
  "mutationFn"
> {
  onValidationError?: (errors: Record<string, string[]>) => void;
}

export const useLogin = (options?: UseLoginOptions) => {
  const completeLogin = useAuthStore((state) => state.completeLogin);
  const complete = usePostAuthentication();

  return useMutation<LoginResult, Error, LoginDto>({
    ...options,
    mutationFn: loginUser,
    onSuccess: async (data, variables, onMutateResult, context) => {
      completeLogin(data);
      await complete(data.user);
      logger.info("Login successful", { userId: data.user.id });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      logger.error("Login failed", error);
      const validationErrors = extractValidationErrors(error);
      if (Object.keys(validationErrors).length > 0) {
        options?.onValidationError?.(validationErrors);
      }
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
};
