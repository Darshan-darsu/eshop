"use client";
import GoogleButton from "@/shared/components/google-button";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";

type FormData = {
  email: string;
  password: string;
  name: string;
};
const Register = () => {
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userData, setUserData] = useState<FormData | null>(null);
  const inputRef = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-register`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formdata) => {
      setUserData(formdata);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-user`,
        { ...userData, otp: otp.join("") }
      );
      return response.data;
    },
    onSuccess:async()=>{
      router.push("/login")
    }
  });

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
  const resendOtp = () => {
    if(userData){
      signupMutation.mutate(userData);
    }
  };

  const onSubmit = (data: FormData) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="w-full py-8 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-poppins font-semibold text-center text-black">
        Sign Up
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Sign Up
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8  bg-white shadow rounded-lg">
          <h3 className="text-3xl  font-semibold text-center mb-2">
            Sign Up to E Shop
          </h3>
          <p className="text-center text-gray-500 mb-4">
            {`Already have an account?`}{" "}
            <Link href={"/login"} className="text-blue-500">
              Login
            </Link>
          </p>
          <GoogleButton />
          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-500"></div>
            <span className="px-3">Or Sign in with Email</span>
            <div className="flex-1 border-t border-gray-500"></div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            {!showOtp ? (
              <>
                <label className="block text-gray-700 mb-1">Name</label>
                <input
                  type="name"
                  id="name"
                  placeholder="Enter your name"
                  className="w-full p-2 border-gray-300 border outline-0 rounded mb-1"
                  {...register("name", { required: "Name is required field" })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">
                    {String(errors.name.message)}
                  </p>
                )}

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

                <button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="w-full text-lg  cursor-pointer  bg-black text-white py-2 rounded mt-4"
                >
                  {" "}
                  {signupMutation.isPending ? "Signing up ..." : "Sign Up"}
                </button>
                {error && (
                  <p className="text-red-500 text-sm mt-2">{String(errors)}</p>
                )}
              </>
            ) : (
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
                  onClick={()=>verifyOtpMutation.mutate()}
                  type="button"
                  className="w-full mt-4 text-lg cursor-pointer bg-blue-500 rounded-lg py-2 text-white"
                >
                 {verifyOtpMutation.isPending?"Verifying the Otp ...":"Verify OTP"}
                </button>
                <p className="text-center text-sm mt-4">
                  {canResend ? (
                    <button
                      onClick={resendOtp}
                      type="button"
                      className="mt-2 text-sm cursor-pointer text-blue-500 rounded-lg py-2"
                    >
                      Resend OTP
                    </button>

                  ) : (
                    `Resend OTP in ${timer}`
                  )}
                </p>
                {verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError &&(
                    <p className="text-red-500 text-sm mt-2">{String( verifyOtpMutation.error?.response?.data?.message || verifyOtpMutation.error.message)}</p>
                ) }
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
export default Register;
