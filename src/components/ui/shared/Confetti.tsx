"use client";

import { showConfetti } from "@/utils";
import { useEffect } from "react";

export const Confetti = () => {
  useEffect(() => {
    showConfetti();
  }, []);

  return <></>;
};
