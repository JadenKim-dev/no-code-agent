import { useEffect, useRef, useState } from "react";
import type { AgentFormValues } from "./types";

const REQUIRED_FIELDS = ["name", "goal", "systemPrompt"] as const;
type RequiredField = typeof REQUIRED_FIELDS[number];

export function useAgentForm(initialValues: AgentFormValues) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<Set<RequiredField>>(new Set());
  const serialized = JSON.stringify(initialValues);
  const prevRef = useRef(serialized);

  useEffect(() => {
    if (prevRef.current === serialized) return;
    prevRef.current = serialized;
    setValues(initialValues);
    setTouched(new Set());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized]);

  const isValid = REQUIRED_FIELDS.every((f) => values[f].trim());

  function markTouched(field: RequiredField) {
    setTouched((prev) => new Set(prev).add(field));
  }

  function markAllTouched() {
    setTouched(new Set(REQUIRED_FIELDS));
  }

  function hasFieldError(field: RequiredField): boolean {
    return touched.has(field) && !values[field].trim();
  }

  return { values, setValues, isValid, markTouched, markAllTouched, hasFieldError };
}
