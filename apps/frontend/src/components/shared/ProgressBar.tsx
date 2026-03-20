type ProgressBarProps = {
  progress?: number;
  variant?: "circular" | "bar";
  size?: number;
  strokeWidth?: number;
  barHeight?: number;
  color?: string;
  bgColor?: string;
  textSize?: string;
  hasText?: boolean;
};

const ProgressBar = ({
  progress = 0,
  variant = "circular",
  size = 18,
  strokeWidth = 2,
  barHeight = 10,
  color = "#2563eb",
  bgColor = "#e5e7eb",
  textSize = "text-xs",
  hasText = false,
}: ProgressBarProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-4">
      {/* Circular */}
      {variant === "circular" && (
        <div
          className="relative flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={bgColor}
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Progress */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>

          {/* Text */}
          {hasText && (
            <div
              className={`absolute inset-0 flex items-center justify-center font-semibold ${textSize}`}
            >
              {progress}%
            </div>
          )}
        </div>
      )}

      {/* Bar */}
      {variant === "bar" && (
        <div className="w-full">
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ backgroundColor: bgColor, height: barHeight }}
          >
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: color,
                height: "100%",
              }}
            />
          </div>

          {/* Text */}
          {hasText && (
            <p className={`mt-1 text-gray-500 ${textSize}`}>
              Uploading: {progress}%
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
