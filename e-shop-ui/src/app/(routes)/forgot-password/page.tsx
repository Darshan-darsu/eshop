"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type FormData = {
  email: string;
  password: string;
};

const ForgotPassword = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userEmail, setuserEmail] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const router = useRouter();

  const requestOtpMutation = useMutation({
    mutationFn: async ({email}: {email:string}) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/forgot-password-user`,
        {email},
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: (_, { email }) => {
      setError(null);
      setuserEmail(email);
      setStep("otp");
      setCanResend(false);
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      const errorMsg =
        (error.response?.data as { message?: string })?.message ||
        "Invalid OTP try again!";
      setError(errorMsg);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-password-user`,
        { email: userEmail, otp: otp.join("") },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep("reset");
      setError(null);
    },
    onError: (error: AxiosError) => {
      const errorMsg =
        (error.response?.data as { message?: string })?.message ||
        "Invalid OTP try again!";
      setError(errorMsg);
    },
  });

  const resetMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!password) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/reset-password-user`,
        { email: userEmail, password: password },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep("email");
      toast.success("Password reset successfull. Login with new password");
      setError(null);
      router.push("/");
    },
    onError: (error: AxiosError) => {
      const errorMsg =
        (error.response?.data as { message?: string })?.message ||
        "Invalid OTP try again!";
      setError(errorMsg);
    },
  });
  const onSubmitEmail = (data: FormData) => {
    requestOtpMutation.mutate(data);
  };

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtp = (index: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < inputRef.current.length - 1) {
      inputRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key == "Backspace" && !otp[index] && index > 0) {
      inputRef.current[index - 1]?.focus();
    }
  };
  const onSubmitPassword = ({ password }: { password: string }) => {
    resetMutation.mutate({ password });
  };

  return (
    <div className="w-full py-8 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-poppins font-semibold text-center text-black">
        Forgot Password
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Forgot-password
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8  bg-white shadow rounded-lg">
          {step === "email" && (
            <>
              <h3 className="text-3xl  font-semibold text-center mb-2">
                Login to E Shop
              </h3>
              <p className="text-center text-gray-500 mb-4">
                {`Go back to ?`}{" "}
                <Link href={"/login"} className="text-blue-500">
                  Login
                </Link>
              </p>
              <form onSubmit={handleSubmit(onSubmitEmail)}>
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

                <button
                  type="submit"
                  disabled={requestOtpMutation.isPending}
                  className="w-full text-lg  cursor-pointer mt-4 bg-black text-white py-2 rounded"
                >
                  {" "}
                  {requestOtpMutation.isPending ? "Sending Otp ..." : "Submit"}
                </button>
                {error && (
                  <p className="text-red-500 text-sm mt-2">{String(error)}</p>
                )}
              </form>
            </>
          )}

          {step === "otp" && (
            <div className="">
              <h3 className="text-xl font-semibold text-center mb-4">
                Enter OTP
              </h3>
              <div className="flex justify-center gap-6">
                {otp?.map((item, index) => (
                  <input
                    type="text"
                    key={index}
                    maxLength={1}
                    className="w-12 h-12 border-gray-300 border text-center outline-none !rounded"
                    value={item}
                    onChange={(e) => handleOtp(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    ref={(el) => {
                      if (el) {
                        inputRef.current[index] = el;
                      }
                    }}
                  />
                ))}
              </div>
              <button
                disabled={verifyOtpMutation.isPending}
                onClick={() => verifyOtpMutation.mutate()}
                type="button"
                className="w-full mt-4 text-lg cursor-pointer bg-blue-500 rounded-lg py-2 text-white"
              >
                {verifyOtpMutation.isPending
                  ? "Verifying the Otp ..."
                  : "Verify OTP"}
              </button>
              <p className="text-center text-sm mt-4">
                {canResend ? (
                  <button
                    onClick={() =>
                      requestOtpMutation.mutate({ email: userEmail })
                    }
                    type="button"
                    className="mt-2 text-sm cursor-pointer text-blue-500 rounded-lg py-2"
                  >
                    Resend OTP
                  </button>
                ) : (
                  `Resend OTP in ${timer}`
                )}
              </p>
              {verifyOtpMutation?.isError &&
                verifyOtpMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-sm mt-2">
                    {String(
                      (verifyOtpMutation.error?.response?.data as { message?: string })?.message ||
                        verifyOtpMutation.error.message
                    )}
                  </p>
                )}
            </div>
          )}

          {step === "reset" && (
            <>
              <h3 className="text-3xl  font-semibold text-center mb-2">
                Password Reset
              </h3>
              <form onSubmit={handleSubmit(onSubmitPassword)}>
                <label className="block text-gray-700 mb-1">New Password</label>

                <div className="relative">
                  <input
                    type={"password"}
                    id="password"
                    placeholder="Enter a password"
                    className="w-full p-2 border-gray-300 border outline-0 rounded mb-1"
                    {...register("password", {
                      required: "password is required field",
                      minLength: {
                        value: 6,
                        message: "Password must be contain 6 charatcer ",
                      },
                    })}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {String(errors.password.message)}
                    </p>
                  )}{" "}
                </div>
                <button
                  type="submit"
                  disabled={resetMutation.isPending}
                  className="w-full text-lg  cursor-pointer mt-4 bg-black text-white py-2 rounded"
                >
                  {" "}
                  {resetMutation.isPending ? "Resetting ..." : "Reset Password"}
                </button>
                {error && (
                  <p className="text-red-500 text-sm mt-2">{String(error)}</p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
