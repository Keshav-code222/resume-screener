// useScrollSpy — observes a list of section ids and returns the id of the
// currently-active section. Used by ChapterNav on the Landing page.
//
// Strategy: a single IntersectionObserver with a narrow horizontal band
// (rootMargin: '-40% 0px -55% 0px') — a section is "active" when its top
// crosses ~5% from the viewport top.

import { useEffect, useState } from 'react';

export function useScrollSpy(ids, options = { rootMargin: '-40% 0px -55% 0px' }) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      options,
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids.join('|'), options.rootMargin]);

  return active;
}
