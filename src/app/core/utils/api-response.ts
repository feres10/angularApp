export function extractList<T>(response: any): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.content)) {
    return response.data.content;
  }

  return [];
}

export function extractData<T>(response: any): T | null {
  return response?.data ?? response ?? null;
}
