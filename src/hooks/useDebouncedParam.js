import { useEffect, useRef, useState } from "react";

// Local input state that is committed to the URL after `delay` ms without typing.
// If the URL changes from outside (Clear button, back/forward) the input follows it.
export default function useDebouncedParam(urlValue, commit, delay = 400) {
  const [local, setLocal] = useState(urlValue);
  const commitRef = useRef(commit);
  commitRef.current = commit; // always call the latest version (avoids stale URL params)

  useEffect(() => { setLocal(urlValue); }, [urlValue]);

  useEffect(() => {
    if (local === urlValue) return undefined;
    const timer = setTimeout(() => commitRef.current(local), delay);
    return () => clearTimeout(timer);
  }, [local, urlValue, delay]);

  return [local, setLocal];
}
