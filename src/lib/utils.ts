import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDateInput(d: Date = new Date()) {
  return d.toISOString().slice(0, 10);
}
