import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ManualBatch, ManualBatchWithSlug } from "~/app/manual/manual";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



