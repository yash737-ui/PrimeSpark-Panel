import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes conditionally.
 * Standard shadcn/ui utility - required by generated shadcn components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
