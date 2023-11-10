"use client";


import showConfetti from "@/utils/confetti";
import { useEffect } from "react";

export const Confetti = () => {
  useEffect(() => {
    showConfetti();
  }, []);

  return <></>;
};
