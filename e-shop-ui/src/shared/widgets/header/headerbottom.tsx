"use client";
import Link from "next/link";
import { NavItems } from "@/configs/constanst/constant";
import { AlignLeft, ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import useUser from "@/hooks/useUser";
import { HeartIcon, ShoppingCart } from "lucide-react";
import ProfileIcon from "@/assets/svgs/profile-icon.svg";
import Image from "next/image";

const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { user, isLoading } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className={`w-full transition-full duration-300 ${
          isSticky
            ? "fixed top-0 left-0 z-[100] bg-white shadow-lg"
            : "relative"
        }}`}
      >
        <div
          className={`w-[80%]  relative m-auto flex items-center justify-between ${
            isSticky ? "pt-3" : "py-0"
          }`}
        >
          {/* All dorpdown */}
          <div
            className={`w-[250] ${
              isSticky && "-mb-2"
            } cursor-pointer flex justify-between items-center px-5 h-[50px] bg-[#3489ff]`}
            onClick={() => setShow(!show)}
          >
            <div className="flex items-center gap-2">
              <AlignLeft color={"white"} />
              <span className="text-white font-medium">All Departments</span>
            </div>
            <ChevronDown color={"white"} />
          </div>

          {/* Dropdown Menu */}
          {show && (
            <div
              className={`absolute left-0 ${
                isSticky ? "top-[70px]" : "top-[50px]"
              } w-[250px] h-[450px] bg-[#f5f5f5]`}
            ></div>
          )}
          {/* Navgation Link */}
          <div className="flex items-center">
            {NavItems.map((item: NavItemsTypes) => (
              <Link
                key={item.title}
                className="px-5 font-medium text-lg"
                href={item.href}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div>
        {isSticky && (
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              {!isLoading && user ? (
                <>
                  <Link
                    href={"/profile"}
                    className="border-2 border-[#010f1c1a] w-[50px] h-[50px] flex items-center justify-center rounded-full"
                  >
                    <Image
                      src={ProfileIcon}
                      alt={"No Profile"}
                      width={35}
                      height={45}
                    />
                  </Link>
                  <Link href={"/login"}>
                    <span className="block font-bold"> Hello , </span>
                    <span className="block font-bold"> {user?.name}</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={"/login"}
                    className="border-2 border-[#010f1c1a] w-[50px] h-[50px] flex items-center justify-center rounded-full"
                  >
                    <Image
                      src={ProfileIcon}
                      alt={"No Profile"}
                      width={35}
                      height={45}
                    />
                  </Link>
                  <Link href={"/login"}>
                    <span className="block font-bold"> Hello , </span>
                    <span className="block font-bold">
                      {isLoading ? "..." : " Sign in"}{" "}
                    </span>
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center justify-center gap-5">
              <Link href={"/wishlist"} className="relative">
                <HeartIcon />
                <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                  <span className="text-white font-medium text-sm">1</span>
                </div>
              </Link>
              <Link href={"/cart"} className="relative ">
                <ShoppingCart />
                <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                  <span className="text-white font-medium text-sm">1</span>
                </div>
              </Link>
            </div>
          </div>
        )}{" "}
      </div>
    </>
  );
};

export default HeaderBottom;
