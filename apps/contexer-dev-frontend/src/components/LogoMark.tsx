import React from "react";
import logoUrl from "@/assets/logo.svg";

interface LogoMarkProps {
  className?: string;
  title?: string;
}

export default function LogoMark({ className = "w-8 h-8", title = "Contexer" }: LogoMarkProps) {
  return (
    <img
      src={logoUrl}
      alt={title}
      className={`${className} block select-none`}
      draggable={false}
      loading="eager"
      decoding="async"
    />
  );
}


