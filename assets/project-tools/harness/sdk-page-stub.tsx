// Local UI harness only (never shipped): stands in for @lark-base-open/base-database-app-sdk/page and /components.
// Function calls go to the harness server, which proxies them to the real Preview app, so pages render real data.
// If Vite reports a missing export, add a small stand-in here (host-only features should throw a clear message).
import { createElement, StrictMode, type ComponentType, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

type Envelope = { code: number; msg: string; data?: unknown };
const params = () => new URLSearchParams(window.location.search);
const theme = () => params().get('theme') ?? 'light';

export class DataNotReadyError extends Error {}

export async function invokeDatabaseFunction(id: string, input: unknown, _options?: unknown): Promise<Envelope> {
  const response = await fetch(`/__invoke/${encodeURIComponent(id)}`, { method: 'POST', body: JSON.stringify(input ?? {}) });
  return response.json();
}
export async function invokeDatabaseMutationBatch(id: string, items: unknown[]): Promise<Envelope> {
  const batch = (items ?? []).map((p) => ({ params: p }));
  const response = await fetch(`/__invoke/${encodeURIComponent(id)}`, { method: 'POST', body: JSON.stringify({ batch }) });
  return response.json();
}

export const siteRuntime = {
  getRuntimeContext: async () => ({ colorScheme: theme(), locale: params().get('locale') ?? 'vi', mode: 'reading', protocolVersion: 1, env: 'preview' }),
  getCurrentUser: async () => ({ name: 'Harness', avatarUrl: '' }),
  uploadAttachment: async () => {
    throw new Error('Tải tệp chỉ hoạt động trong Lark (harness cục bộ không có cầu nối tải lên).');
  },
  ready: () => undefined,
  reportLoadFailed: () => undefined,
};
export const getDatabaseContext = () => ({ env: 'preview', token: '' });
export async function resolveDatabaseContext() {
  return { env: 'preview', gatewayOrigin: '', token: '' };
}
export async function openLink(url: string) {
  window.open(url, '_blank', 'noopener');
  return { opened: true };
}
export const installLinkGuard = () => () => undefined;
export async function fetchAttachmentCover(): Promise<Blob> {
  throw new Error('Ảnh đính kèm chỉ hiển thị trong Lark.');
}
export async function fetchAttachmentDownloadUrl(): Promise<string> {
  throw new Error('Tải xuống chỉ hoạt động trong Lark.');
}
export async function openAttachmentDownload() {
  throw new Error('Tải xuống chỉ hoạt động trong Lark.');
}

export function invokeSiteAIFunctionStream(request: { functionKey: string; params?: unknown; messages: unknown[] }) {
  let onMessage: (d: { content: string; reasoningContent?: string }) => void = () => undefined;
  let onDone: () => void = () => undefined;
  let onError: (e: { message: string }) => void = () => undefined;
  let destroyed = false;
  fetch(`/__ai/${encodeURIComponent(request.functionKey)}`, { method: 'POST', body: JSON.stringify({ params: request.params, messages: request.messages }) })
    .then((r) => r.json())
    .then((body: { ok: boolean; text?: string; message?: string }) => {
      if (destroyed) return;
      if (!body.ok) return onError({ message: body.message ?? 'AI call failed' });
      const text = body.text ?? '';
      let i = 0;
      const tick = () => {
        if (destroyed) return;
        if (i >= text.length) return onDone();
        onMessage({ content: text.slice(i, i + 40) });
        i += 40;
        window.setTimeout(tick, 15);
      };
      tick();
    })
    .catch(() => !destroyed && onError({ message: 'AI call failed' }));
  return {
    onMessage: (cb: typeof onMessage) => (onMessage = cb),
    onDone: (cb: typeof onDone) => (onDone = cb),
    onError: (cb: typeof onError) => (onError = cb),
    destroy: () => (destroyed = true),
  };
}
export async function callSiteAIFunction(request: { functionKey: string; params?: unknown; messages?: unknown[] }) {
  const response = await fetch(`/__ai/${encodeURIComponent(request.functionKey)}`, { method: 'POST', body: JSON.stringify({ params: request.params, messages: request.messages ?? [] }) });
  const body = (await response.json()) as { ok: boolean; text?: string; message?: string };
  if (!body.ok) throw new Error(body.message ?? 'AI call failed');
  return { type: 'text' as const, content: body.text ?? '' };
}
export async function createSiteAIFunctionTask(): Promise<never> {
  throw new Error('Tạo ảnh/video bằng AI chỉ kiểm được trong Lark hoặc qua tools/invoke.mjs.');
}
export async function getSiteAIFunctionTask(): Promise<never> {
  throw new Error('Tạo ảnh/video bằng AI chỉ kiểm được trong Lark hoặc qua tools/invoke.mjs.');
}

// Components: simple stand-ins so pages render; the real ones need the Lark host.
export function DatabaseUserMenu() {
  return createElement('span', { className: 'badge badge-neutral', title: 'Harness' }, 'Harness');
}
export function FloatingButton() {
  return null;
}
export function AttachmentImage(props: { alt?: string; size?: number; className?: string }) {
  return createElement('div', { className: props.className, style: { width: props.size ?? 96, height: props.size ?? 96, background: 'var(--surface-3)', borderRadius: 8 }, 'aria-label': props.alt });
}
export function UserSelectorEditor() {
  return createElement('div', { className: 'input', style: { color: 'var(--text-3)' } }, 'Chọn người (chỉ trong Lark)');
}
export function UserSelectorPanel() {
  return createElement('div', { className: 'muted' }, 'Chọn người (chỉ trong Lark)');
}
export function BaseAppProvider({ children }: { children?: ReactNode }) {
  return createElement('div', null, children);
}

export function startBaseApp(options: { app: ComponentType; providers?: (children: ReactNode) => ReactNode }) {
  const root = createRoot(document.getElementById('root')!);
  const app = createElement(options.app);
  root.render(createElement(StrictMode, null, options.providers ? options.providers(app) : app));
  return { ready: Promise.resolve(), dispose: () => root.unmount() };
}
