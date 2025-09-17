// src/hooks/useDebouncedCallback.js
import { useRef } from "react";

export default function useDebouncedCallback(cb, delay = 600) {
  const t = useRef(null);
  return (...args) => {
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => cb(...args), delay);
  };
}
