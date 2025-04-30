import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse bg-muted", className)} // removed rounded-md
      {...props}
    />
  )
}

export { Skeleton }
