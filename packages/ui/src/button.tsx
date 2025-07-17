"use client";

import { ReactNode } from "react";

type ButtonProps = {
  size?: "lg" | "md" | "sm";
  variant?: "primary" | "outline" | "secondary";
  className: string;
  children: ReactNode;
  onclick?: () => void;
};

export const Button = ({
  size = "md",
  variant = "primary",
  className,
  children,
  onclick,
}: ButtonProps) => {
  return (
    <button
      className={`${className} rounded-lg text-white px-4 py-2 ${
        size === "sm"
          ? "text-sm"
          : size === "lg"
          ? "text-lg"
          : "text-base"
      } ${
        variant === "primary"
          ? "bg-blue-500 hover:bg-blue-600"
          : variant === "outline"
          ? "border border-blue-500 hover:bg-blue-100 hover:text-blue-500" 
          : "bg-gray-300 hover:bg-gray-400"
      }`}
      onClick={onclick}
    >
      {children}
    </button>
  );
};

