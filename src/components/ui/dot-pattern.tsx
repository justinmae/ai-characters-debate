import { cn } from "@/lib/utils"

interface DotPatternProps {
  width?: number
  height?: number
  x?: number
  y?: number
  cx?: number
  cy?: number
  cr?: number
  className?: string
  glow?: boolean
}

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
  ...props
}: DotPatternProps) {
  return (
    <div className={cn("absolute inset-0 -z-10", className)} {...props}>
      <div
        className={cn(
          "absolute h-full w-full",
          glow && "opacity-50 blur-[100px]"
        )}
        style={{
          backgroundImage: `radial-gradient(circle at center, hsl(var(--foreground)) 0.5px, transparent 0.5px)`,
          backgroundSize: `${width}px ${height}px`,
          backgroundPosition: `${x}px ${y}px`,
        }}
      />
      <svg
        className="absolute h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={`${width}/${height}`}
            width={width}
            height={height}
            patternUnits="userSpaceOnUse"
            x={x}
            y={y}
          >
            <circle
              cx={cx}
              cy={cy}
              r={cr}
              fill="currentColor"
              className="text-foreground/20"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${width}/${height})`}
        />
      </svg>
    </div>
  )
} 