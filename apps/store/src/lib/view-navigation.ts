import { useLocation, useNavigate } from "react-router-dom";

export function useViewNavigation(base: string) {
  const location = useLocation();
  const navigate = useNavigate();
  const depth = (location.state as { viewDepth?: number } | null)?.viewDepth ?? 0;
  function open(path: string) { navigate(path, { state: { viewDepth: depth + 1 } }); }
  function back(fallback = base) { if (depth > 0) navigate(-1); else navigate(fallback, { replace: true }); }
  function finish() { if (depth > 0) navigate(-depth); else navigate(base, { replace: true }); }
  return { pathname: location.pathname, open, back, finish };
}
