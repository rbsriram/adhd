console.log(`[LOGO.TSX] Mounted**********************`);
import cn from "classnames"; 
 
 interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className, size = "md" }: LogoProps) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className="flex items-center gap-3 cursor-default">
      <div className={cn("relative group", sizes[size], className)}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full transform transition-transform duration-300 group-hover:scale-110"
        >
          {/* Outer circle with gradient */}
          <defs>
            <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#D946EF" />
            </linearGradient>
          </defs>
          
          <circle
            cx="50"
            cy="50"
            r="45"
            className="fill-none stroke-[4]"
            style={{ stroke: "url(#circleGradient)" }}
          />
          
          {/* Inner spiral representing transformation */}
          <path
            d="M50,50 m-25,0 a25,25 0 1,1 50,0 a20,20 0 1,0 -40,0 a15,15 0 1,1 30,0"
            className="fill-none stroke-[3]"
            style={{ stroke: "#0EA5E9" }}
            strokeLinecap="round"
          />
          
          {/* Central dot */}
          <circle
            cx="50"
            cy="50"
            r="4"
            className="fill-primary-foreground transition-all duration-300 group-hover:r-5"
            style={{ fill: "#F97316" }}
          />
        </svg>
      </div>
      <span className="text-2xl font-semibold tracking-tight text-foreground dark:text-white cursor-pointer">
        njiva
      </span>
    </div>
  );
};

export default Logo;