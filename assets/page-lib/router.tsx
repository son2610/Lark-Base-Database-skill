import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

/** Hash routes (#/learn/<courseId>/<lessonKey>?tab=qa) keep deep links working inside the Lark host iframe. */
export interface Route {
  parts: string[];
  query: URLSearchParams;
  path: string;
}

export function parseRoute(hash = window.location.hash): Route {
  const raw = hash.replace(/^#\/?/, '');
  const [path, search = ''] = raw.split('?');
  return { parts: path.split('/').filter(Boolean).map(decodeURIComponent), query: new URLSearchParams(search), path: `/${path}` };
}

/** First load: honour ?view=...&id=... links (Lark message buttons) when the hash is empty. */
function initialRoute(): Route {
  if (window.location.hash.replace(/^#\/?/, '')) return parseRoute();
  const params = new URLSearchParams(window.location.search);
  const target = params.get('to');
  if (target && /^\/[A-Za-z0-9/_?=&%.-]*$/.test(target)) {
    window.history.replaceState(null, '', `#${target}`);
    return parseRoute();
  }
  return parseRoute();
}

export function navigate(path: string, replace = false) {
  const target = path.startsWith('#') ? path : `#${path}`;
  if (window.location.hash === target) return;
  if (replace) {
    window.history.replaceState(null, '', target);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else window.location.hash = target;
}

export function useRoute(): Route {
  const [route, setRoute] = useState(initialRoute);
  useEffect(() => {
    const onChange = () => setRoute(parseRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

/** Updates query parameters of the current route without adding a history entry. */
export function setQuery(patch: Record<string, string | null | undefined>) {
  const route = parseRoute();
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === undefined || value === '') route.query.delete(key);
    else route.query.set(key, value);
  }
  const search = route.query.toString();
  navigate(`${route.path}${search ? `?${search}` : ''}`, true);
}

/** Đường dẫn của app — thay bằng các trang thật. */
export const paths = {
  home: () => '/',
  list: (q?: Record<string, string>) => `/items${q && Object.keys(q).length ? `?${new URLSearchParams(q)}` : ''}`,
  detail: (id: string) => `/items/${id}`,
  notifications: () => '/notifications',
};

/** In-app link: real href (middle click still works) but navigation through the hash. */
export function Link({ to, children, onClick, ...rest }: { to: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const handle = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    navigate(to);
  };
  return (
    <a href={`#${to}`} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
