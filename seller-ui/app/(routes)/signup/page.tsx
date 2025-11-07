"use client";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";
import React, {  useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import CountryList from "@/app/utils/countries";
import CreateShop from "@/app/shared/modules/create-shop";
import StripeLogo from "@/assets/svgs/Stripe-Logo";

type FormData = {
  email: string;
  password: string;
  name: string;
  phone_number: number;
  country: string;
};
const Register = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [sellerData, setSellerData] = useState<FormData | null>(null);
  const [sellerId, setSellerId] = useState("");
  const inputRef = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/seller-register`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formdata) => {
      setSellerData(formdata);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-seller`,
        { ...sellerData, otp: otp.join("") }
      );
      return response.data;
    },
    onSuccess: async (data) => {
      setActiveStep(2);
      setSellerId(data?.seller.id);
    },
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
    if (sellerData) {
      signupMutation.mutate(sellerData);
    }
  };

  const onSubmit = (data: FormData) => {
    signupMutation.mutate(data);
  };

  const connectStripe=async()=>{
    try{
      const response= await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-stripe-link`,{sellerId});
      const url=response.data.url
      if(url){
        window.location.href=url
      }
    }catch(error){
      console.log("error in stripe connection",error)
    }
  }

  return (
    <div className="w-full flex flex-col items-center pt-10  min-h-screen">
      {/* steps */}
      <div className="relative flex items-center justify-between md:w-[50%] mb-8">
        <div className="absolute top-[25%] w-[80%] h-1 left-0 md:w-[90%] bg-gray-300 -z-10" />
        {[1, 2, 3].map((step) => (
          <div key={step}>
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${
                step <= activeStep ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              {step}
            </div>
            <span className=" ml-[-15px]">
              {step == 1
                ? "Create an account"
                : step === 2
                ? "Setup Shop"
                : "Connect Bank"}
            </span>
          </div>
        ))}
      </div>
      {/* Steps Content */}
      <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
        {activeStep == 1 && (
          <>
            {!showOtp ? (
              <>
                <h3 className="text-3xl  font-semibold text-center mb-2">
                  Create An Account
                </h3>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <label className="block text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter your name"
                    className="w-full p-2 border-gray-300 border outline-0 rounded mb-1"
                    {...register("name", {
                      required: "Name is required field",
                    })}
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
                  <label className="block text-gray-700 mb-1">Phone No</label>
                  <input
                    type="tel"
                    id="phone_number"
                    placeholder="Phone No"
                    className="w-full p-2 border-gray-300 border outline-0 rounded mb-1"
                    {...register("phone_number", {
                      required: "Phone No is required field",
                      pattern: {
                        value: /^\+?[1-9]\d{1,14}$/,
                        message: "Invalid phone format",
                      },
                      minLength: {
                        value: 10,
                        message: "Phone number must have different atleast 10.",
                      },
                      maxLength: {
                        value: 15,
                        message: "Phone number cannot exceed 15.",
                      },
                    })}
                  />
                  {errors.phone_number && (
                    <p className="text-red-500 text-sm">
                      {String(errors.phone_number.message)}
                    </p>
                  )}
                  <label className="block text-gray-700 mb-1">Country</label>
                  <select
                    className="w-full p-2 border-gray-300 border outline-0 rounded mb-1"
                    {...register("country", {
                      required: "Country is required field",
                    })}
                  >
                    <option value="">Select the Country</option>
                    {CountryList.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-red-500 text-sm">
                      {String(errors.country.message)}
                    </p>
                  )}{" "}
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
                    <p className="text-red-500 text-sm mt-2">
                      {String(errors)}
                    </p>
                  )}
                  {signupMutation?.isError &&
                    signupMutation.error instanceof AxiosError && (
                      <p className="text-red-500 text-sm mt-2">
                        {String(
                          signupMutation.error?.response?.data?.message ||
                            signupMutation.error.message
                        )}
                      </p>
                    )}
                  <p className="text-center text-gray-500 mb-4 mt-4">
                    {`Already have an account?`}{" "}
                    <Link href={"/login"} className="text-blue-500">
                      Login
                    </Link>
                  </p>
                </form>
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
                {verifyOtpMutation?.isError &&
                  verifyOtpMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2">
                      {String(
                        verifyOtpMutation.error?.response?.data?.message ||
                          verifyOtpMutation.error.message
                      )}
                    </p>
                  )}
              </div>
            )}
          </>
        )}

        {activeStep == 2 && (
          <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
        )}

        {activeStep === 3 && (
          <div>
            <h3 className="text-3xl  font-semibold text-center mb-2">
              WithDraw Method
            </h3>
            <button className="w-full m-auto flex items-center justify-center gap-3 text-lg bg-[#331455] text-white py-2 rounded-lg" onClick={connectStripe}>
              Connect Stripe <StripeLogo/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Register;
