export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return headers;
}
