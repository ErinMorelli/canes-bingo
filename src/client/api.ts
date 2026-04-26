import { ApiClient, Implementation } from './api-client';

const implementation: Implementation = async (method, path, params) => {
  const hasBody = !['get', 'head', 'delete'].includes(method);
  const searchParams = hasBody ? '' : `?${new URLSearchParams(params as Record<string, string>)}`;
  const response = await fetch(`${path}${searchParams}`, {
    method: method.toUpperCase(),
    headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
    body: hasBody ? JSON.stringify(params) : undefined,
    credentials: 'same-origin',
  });
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return { status: 'error', error: { message: `HTTP ${response.status}` } };
  }
  return response.json();
};

export const apiClient = new ApiClient(implementation);

type SuccessEnvelope<D> = { status: 'success'; data: D };
type ErrorEnvelope = { status: 'error'; error: { message: string } };

export function getData<D>(response: SuccessEnvelope<D> | ErrorEnvelope): D {
  if (response.status !== 'success') {
    throw new Error(response.error.message);
  }
  return response.data;
}
