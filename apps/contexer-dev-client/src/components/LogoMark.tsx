import React from "react";
import logoUrl from "@/assets/logo.svg";

interface LogoMarkProps {
  className?: string;
  title?: string;
}

export default function LogoMark({ className = "w-6 h-6", title = "Contexer" }: LogoMarkProps) {
  return (
    <img
      src={logoUrl}
      alt={title}
      className={`${className} block object-contain select-none`}
      draggable={false}
      loading="eager"
      decoding="async"
    />
  );
}


