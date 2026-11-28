import { createContext, useContext } from "react";

export type ValidationContextValue = {
  errors: Record<string, string>;
  change: (id: string, value: string, rule: string, length?: number) => void;
  blur: (id: string, value: string, rule: string, length?: number) => void;
};
export const ValidationContext = createContext<ValidationContextValue | null>(null);
export function useFormValidation() {
  const context = useContext(ValidationContext);
  if (!context) throw new Error("Validated fields require ValidationForm");
  return context;
}
