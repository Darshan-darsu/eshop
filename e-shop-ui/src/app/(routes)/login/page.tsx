"use client";
import GoogleButton from "@/shared/components/google-button";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";

type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/login-user`,
        data,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      setError(null);
      router.push("/");
    },
    onError: (error: AxiosError) => {
      const errorMsg =(error.response?.data as {message?:string})?.message || "Invalid Credentials!";
      setError(errorMsg);
    }
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };
  return (
    <div className="w-full py-8 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-poppins font-semibold text-center text-black">
        Login
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Login
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8  bg-white shadow rounded-lg">
          <h3 className="text-3xl  font-semibold text-center mb-2">
            Login to E Shop
          </h3>
          <p className="text-center text-gray-500 mb-4">
            {`Don't have an account?`}{" "}
            <Link href={"/signup"} className="text-blue-500">
              Sign up
            </Link>
          </p>
          <GoogleButton />
          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-500"></div>
            <span className="px-3">Or Sign in with Email</span>
            <div className="flex-1 border-t border-gray-500"></div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              placeholder="support@email.com"
              className="w-full p-2 border-gray-300 border outline-0 rounded mb-1"
              {...register("email", {
                required: "Email is required field",
                pattern: {
                  value: /^[^@]+@[^@]+\.[^@]+$/,
                  message: "Invalid email",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">
                {String(errors.email.message)}
              </p>
            )}

            <label className="block text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                id="password"
                placeholder="password"
                className="w-full p-2 border-gray-300 border outline-0 rounded mb-1"
                {...register("password", {
                  required: "password is required field",
                  minLength: {
                    value: 6,
                    message: "Password must be contain 6 charatcer ",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
              >
                {show ? <Eye /> : <EyeClosed />}{" "}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {String(errors.password.message)}
                </p>
              )}{" "}
            </div>
            <div className="flex justify-between items-center my-4">
              <label className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  className="mr-2"
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember Me
              </label>
              <Link href={"/forgot-password"} className="text-blue-500 text-sm">
                Forgot Password
              </Link>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full text-lg  cursor-pointer  bg-black text-white py-2 rounded"
            >
              {" "}
              {loginMutation.isPending ? "Logging ..." : "Login"}
            </button>
            {error && (
              <p className="text-red-500 text-sm mt-2">{String(error)}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
export default Login;
