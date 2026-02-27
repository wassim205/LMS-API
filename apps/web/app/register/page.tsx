"use client";

import { useAuth } from "@/context/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Column - Branding/Image */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-zinc-900 text-white overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2670&auto=format&fit=crop')",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-zinc-900/90 to-zinc-900"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="bg-red-700 p-2 rounded-md">
              <GraduationCap className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">Bright Academy</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <blockquote className="text-2xl font-medium leading-relaxed">
            "The beautiful thing about learning is that no one can take it away
            from you."
          </blockquote>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-0.5 w-12 bg-red-700"></div>
            <p className="text-sm text-zinc-400 font-medium">B.B. King</p>
          </div>
        </div>

        <div className="relative z-10">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          >
            Back to Website
            <ArrowRight size={16} className="transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <Link href="/" className="bg-red-700 p-2 rounded-md text-white">
                <GraduationCap size={24} />
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Join thousands of learners achieving their goals.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-sm text-sm flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="firstName"
                >
                  First Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    {...register("firstName")}
                    id="firstName"
                    type="text"
                    placeholder="John"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-red-500/20 focus:border-red-300 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="lastName"
                >
                  Last Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    {...register("lastName")}
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-red-500/20 focus:border-red-300 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-red-500/20 focus:border-red-300 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "password" : "text"}
                  placeholder="Create a password"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-red-500/20 focus:border-red-300 outline-none transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  type={showConfirmPassword ? "password" : "text"}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-sm text-sm focus:ring-1 focus:ring-red-500/20 focus:border-red-300 outline-none transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 text-red-700 border-gray-300 accent-red-700 rounded focus:ring-red-500 cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-500 cursor-pointer"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="font-medium text-gray-900 hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="font-medium text-gray-900 hover:underline"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-700 hover:bg-red-800 text-white py-2.5 rounded-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-red-700 hover:text-red-800 hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
