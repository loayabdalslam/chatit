import React from "react";

interface LogoProps {
  size?: number;
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 36, withText = true }) => {
  return (
    <div className="flex items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="chatitGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--brand-electric))" />
            <stop offset="100%" stopColor="hsl(var(--brand-purple))" />
          </linearGradient>
        </defs>
        {/* Chat bubble with subtle tail */}
        <path
          d="M12 14c0-4.418 3.582-8 8-8h24c8.837 0 16 7.163 16 16v6c0 8.837-7.163 16-16 16H31l-11 10 3.5-10H20c-4.418 0-8-3.582-8-8V14Z"
          fill="url(#chatitGradient)"
          opacity="0.9"
        />
        {/* AI brain / circuit nodes */}
        <circle cx="26" cy="22" r="3" fill="white" fillOpacity="0.9" />
        <circle cx="38" cy="22" r="3" fill="white" fillOpacity="0.9" />
        <circle cx="32" cy="30" r="3" fill="white" fillOpacity="0.9" />
        <path d="M26 22h-6m12 8v6m6-14h6m-18 0v8m12 0v8" stroke="white" strokeOpacity="0.75" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {withText && (
        <span className="text-xl font-semibold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(135deg,hsl(var(--brand-electric)),hsl(var(--brand-purple)))]">
          Chatit
        </span>
      )}
    </div>
  );
};

export default Logo;
