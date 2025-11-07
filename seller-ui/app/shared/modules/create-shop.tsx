import Categories from "@/app/utils/category";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";

type FormData = {
  name: string;
  bio: string;
  address: string;
  opening_hours: string;
  website: string;
  socialLinks: string;
  category: string;
};
const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const createShopMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-shop`,
        data
      );
      return response.data;
    },
    onSuccess: async () => {
      setActiveStep(3);
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    const value = { ...data, sellerId };
    createShopMutation.mutate(value);
  };

  const countWords = (text?: string): number => {
    if (!text) return 0;
    const matches = text.match(/\S+/g);
    return matches ? matches.length : 0;
  }
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-3xl  font-semibold text-center mb-2">
          Setup new shop
        </h3>
        <label className="block text-gray-700 mb-1">Name *</label>
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
          <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
        )}
        <label className="block text-gray-700 mb-1">Bio *</label>
        <input
          type="text"
          id="bio"
          placeholder="Enter your shop bio"
          className="w-full p-2 border-gray-300 border outline-0 rounded mb-1"
          {...register("bio", {
            required: "Bio is required field",
            validate: (value) => {
              return countWords(value) <= 100 || "Bio cannot exceed 100 words";
            },
          })}
        />
        {errors.bio && (
          <p className="text-red-500 text-sm">{String(errors.bio.message)}</p>
        )}
        <label className="block text-gray-700 mb-1">Address *</label>
        <input
          type="text"
          id="address"
          placeholder="Enter your shop address"
          className="w-full p-2 border-gray-300 border outline-0 rounded mb-1"
          {...register("address", {
            required: "Address is required field",
          })}
        />
        {errors.address && (
          <p className="text-red-500 text-sm">
            {String(errors.address.message)}
          </p>
        )}
        <label className="block text-gray-700 mb-1">Opening Hours *</label>
        <input
          type="text"
          id="opening_hours"
          placeholder="Ex Mon - Fri 9AM to 10PM"
          className="w-full p-2 border-gray-300 border outline-0 rounded mb-1"
          {...register("opening_hours", {
            required: "Opening_hours is required field",
          })}
        />
        {errors.opening_hours && (
          <p className="text-red-500 text-sm">
            {String(errors.opening_hours.message)}
          </p>
        )}
        <label className="block text-gray-700 mb-1">Website </label>
        <input
          type="text"
          id="website"
          placeholder="http://localhost.com"
          className="w-full p-2 border-gray-300 border outline-0 rounded mb-1"
          {...register("website", {
            required: "website is required field",
          })}
        />
        {errors.website && (
          <p className="text-red-500 text-sm">
            {String(errors.website.message)}
          </p>
        )}
        <label className="block text-gray-700 mb-1">Category *</label>
        <select
          className="w-full p-2 border-gray-300 border outline-0 rounded mb-1"
          {...register("category", {
            required: "Category is required field",
          })}
        >
          <option value="">Select the Category</option>
          {Categories.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm">
            {String(errors.category.message)}
          </p>
        )}{" "}
        <button
          type="submit"
          disabled={createShopMutation.isPending}
          className="w-full text-lg  cursor-pointer  bg-blue-600 text-white py-2 rounded mt-4"
        >
          {" "}
          {createShopMutation.isPending ? "Creating  ..." : "Create"}
        </button>
      </form>
    </div>
  );
};

export default CreateShop;
