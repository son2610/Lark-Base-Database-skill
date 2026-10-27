import { useEffect, useState } from 'react';
import { siteRuntime } from '@lark-base-open/base-database-app-sdk/page';

export type ThemePreference = 'system' | 'light' | 'dark';
const KEY = 'app.theme';

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

/** Light/dark from the user's choice, else the Lark host scheme, else the OS setting. */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readPreference);
  const [hostScheme, setHostScheme] = useState<'light' | 'dark' | null>(null);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);

  useEffect(() => {
    let active = true;
    siteRuntime
      .getRuntimeContext()
      .then((context) => {
        if (active && (context.colorScheme === 'dark' || context.colorScheme === 'light')) setHostScheme(context.colorScheme);
      })
      .catch(() => undefined);
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media?.addEventListener?.('change', onChange);
    return () => {
      active = false;
      media?.removeEventListener?.('change', onChange);
    };
  }, []);

  const resolved: 'light' | 'dark' = preference === 'system' ? (hostScheme ?? (systemDark ? 'dark' : 'light')) : preference;
  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
  }, [resolved]);

  const choose = (next: ThemePreference) => {
    setPreference(next);
    try {
      if (next === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable: keep the choice for this session only */
    }
  };
  return { preference, resolved, choose };
}
