import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { ApiError } from "@/lib/http";
import { useAuthStore } from "@/store/authStore";

export function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
      navigate("/dashboard");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to sign in right now";
      setError("root", { message });
    }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-500">Sign in to your DevPulse workspace.</p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        {errors.root?.message ? (
          <p className="text-sm text-rose-600">{errors.root.message}</p>
        ) : null}
        <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link className="font-medium text-primary hover:text-indigo-500" to="/register">
          Create one
        </Link>
      </p>
    </div>
  );
}
