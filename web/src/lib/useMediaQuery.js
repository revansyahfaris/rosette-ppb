import { useEffect, useState } from "react";

// true kalau layar cocok dengan media query, ikut berubah saat jendela diubah ukurannya
export function useMediaQuery(query) {
  const get = () => typeof window !== "undefined" && window.matchMedia(query).matches;
  const [matches, setMatches] = useState(get);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

// Batas layar lebar: navigasi pindah ke sidebar, Riwayat jadi dua panel
export const WIDE = "(min-width: 960px)";
