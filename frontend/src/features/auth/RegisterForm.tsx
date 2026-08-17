import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";
import { ApiError } from "@/lib/http";
import { useAuthStore } from "@/store/authStore";

export function RegisterForm() {
  const navigate = useNavigate();
  const registerAccount = useAuthStore((state) => state.register);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerAccount(values);
      navigate("/dashboard");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to create account";
      setError("root", { message });
    }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">Create your account</h1>
      <p className="mt-2 text-sm text-slate-500">Start monitoring production incidents in minutes.</p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <Input
          label="Name"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        {errors.root?.message ? (
          <p className="text-sm text-rose-600">{errors.root.message}</p>
        ) : null}
        <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link className="font-medium text-primary hover:text-indigo-500" to="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
