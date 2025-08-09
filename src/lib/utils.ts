import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrencyKRW(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value as number)) {
    return "-"
  }
  return new Intl.NumberFormat("ko-KR").format(Number(value)) + "원"
}
