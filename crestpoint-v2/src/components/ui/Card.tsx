import { cn } from "@/lib/utils"

export function Card({ className, ...props }: any) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6",
        className
      )}
      {...props}
    />
  )
}