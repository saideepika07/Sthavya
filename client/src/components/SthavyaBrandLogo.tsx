import React from "react";

interface SthavyaBrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
  theme?: "dark" | "light";
  vertical?: boolean;
}

export default function SthavyaBrandLogo({
  size = "md",
  showTagline = true,
  className = "",
  theme = "dark",
  vertical = false,
}: SthavyaBrandLogoProps) {
  const imgSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  const titleSizes = {
    sm: "text-base tracking-[0.2em]",
    md: "text-lg tracking-[0.25em]",
    lg: "text-2xl tracking-[0.3em]",
    xl: "text-3xl tracking-[0.35em]",
  };

  const taglineSizes = {
    sm: "text-[7.5px] tracking-[0.2em]",
    md: "text-[9px] tracking-[0.25em]",
    lg: "text-[11px] tracking-[0.28em]",
    xl: "text-xs tracking-[0.3em]",
  };

  const isLight = theme === "light";
  const titleColor = isLight ? "text-white" : "text-[#181614]";
  const taglineColor = isLight ? "text-[#C9A675]" : "text-[#9E7348]";

  if (vertical) {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        <img
          src="/sthavya-logo.png"
          alt="STHAVYA"
          className={`${imgSizes[size]} object-contain drop-shadow-sm rounded-lg mb-2`}
          loading="eager"
        />
        <div className="flex flex-col items-center">
          <span className={`font-serif font-bold uppercase leading-none ${titleColor} ${titleSizes[size]}`}>
            STHAVYA
          </span>
          {showTagline && (
            <span className={`font-mono uppercase font-semibold mt-1.5 ${taglineColor} ${taglineSizes[size]}`}>
              YOUR VISION, BUILT TO BELONG
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <img
        src="/sthavya-logo.png"
        alt="STHAVYA Logo"
        className={`${imgSizes[size]} object-contain drop-shadow-sm rounded-lg shrink-0`}
        loading="eager"
      />
      <div className="flex flex-col">
        <span className={`font-serif font-bold uppercase leading-tight ${titleColor} ${titleSizes[size]}`}>
          STHAVYA
        </span>
        {showTagline && (
          <span className={`font-mono uppercase font-semibold leading-tight mt-0.5 ${taglineColor} ${taglineSizes[size]}`}>
            YOUR VISION, BUILT TO BELONG
          </span>
        )}
      </div>
    </div>
  );
}
