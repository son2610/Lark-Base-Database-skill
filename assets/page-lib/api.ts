import { invokeDatabaseFunction } from '@lark-base-open/base-database-app-sdk/page';
import { useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import type { DatabaseFunctionInputMap } from '../generated/function-inputs';

export type FunctionId = keyof DatabaseFunctionInputMap;
export type Params<K extends FunctionId> = DatabaseFunctionInputMap[K];

/** Error carrying the function's own business message (safe to show). `unknownOutcome` = the write may have run. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: number | null,
    readonly unknownOutcome = false,
  ) {
    super(message);
  }
}

type Envelope = { code?: unknown; msg?: unknown; data?: unknown };
const invoke = invokeDatabaseFunction as unknown as (id: string, input: unknown) => Promise<Envelope>;

/** Strips the platform suffix ("Business code: … LogID: …") so messages stay readable. */
function cleanMessage(msg: unknown): string {
  if (typeof msg !== 'string' || !msg.trim()) return 'Yêu cầu không thành công. Vui lòng thử lại.';
  return msg.split(/\s*(?:Business code:|LogID:)/)[0].trim().replace(/\.{2,}$/, '.');
}

export async function call<K extends FunctionId>(id: K, input: Params<K>): Promise<unknown> {
  let response: Envelope;
  try {
    response = await invoke(id, input);
  } catch {
    throw new ApiError('Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.', null, true);
  }
  if (!response || typeof response.code !== 'number') throw new ApiError('Máy chủ trả về dữ liệu không hợp lệ.', null, true);
  if (response.code !== 0) throw new ApiError(cleanMessage(response.msg), response.code, response.code === 50202);
  return response.data;
}

/** Calls a Database Function and returns its rows. */
export async function rows<T, K extends FunctionId = FunctionId>(id: K, input: Params<K>): Promise<T[]> {
  const data = (await call(id, input)) as { rows?: unknown } | null;
  if (!data || !Array.isArray(data.rows)) throw new ApiError('Máy chủ trả về dữ liệu không hợp lệ.', null, true);
  return data.rows as T[];
}

/** Calls a write (FaaS) function and returns its business payload. */
export async function write<T, K extends FunctionId = FunctionId>(id: K, input: Params<K>): Promise<T> {
  return (await call(id, input)) as T;
}

export const errorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Đã có lỗi xảy ra.');

/** Query hook for a Database Function: rows of type T, cached by function and params. */
export function useRows<T, K extends FunctionId = FunctionId>(id: K, input: Params<K>, options: { enabled?: boolean; refetchInterval?: number } = {}) {
  return useQuery({
    queryKey: [id, input] as QueryKey,
    queryFn: () => rows<T, K>(id, input),
    enabled: options.enabled ?? true,
    refetchInterval: options.refetchInterval,
    staleTime: 15_000,
    retry: 1,
  });
}

/** After a write, Database Function reads can lag a moment behind: refresh now and once more shortly after. */
export function useRefresh() {
  const client = useQueryClient();
  return (...ids: FunctionId[]) => {
    const run = () =>
      client.invalidateQueries({ predicate: (q) => ids.length === 0 || ids.includes(q.queryKey[0] as FunctionId) });
    void run();
    window.setTimeout(run, 1200);
    window.setTimeout(run, 3500);
  };
}
