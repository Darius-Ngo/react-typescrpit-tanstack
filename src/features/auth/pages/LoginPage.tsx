import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { login } from "../api/auth-api";
import { loginFormSchema, type LoginFormValues } from "../schema";

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      const { accessToken, refreshToken, ...user } = data;
      setAuth(user, accessToken);
      navigate("/");
    },
    onError: () => {
      toast.error("Invalid username or password");
    },
  });

  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-50 dark:bg-slate-950">
      <form
        onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
        className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Sign in
        </h1>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Username
          </label>
          <input
            {...register("username")}
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-600">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
          </label>
          <input
            type="password"
            {...register("password")}
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
        >
          {loginMutation.isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
