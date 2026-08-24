export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Extract token from document cookies (in a real app, use a safer method)
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('jwt='))
    ?.split('=')[1];

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}${url}`, {
    ...options,
    headers,
  });

  return response.json();
}