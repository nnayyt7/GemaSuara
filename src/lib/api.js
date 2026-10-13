const backend = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '');
export const apiUrl = (path) => `${backend}/api${path}`;

export async function api(path, data) {
  let response;
  try {
    response = await fetch(apiUrl(path), { credentials: 'include', signal: AbortSignal.timeout(15000), ...(data !== undefined ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Gema-Request': '1' }, body: JSON.stringify(data) } : {}) });
  } catch {
    throw new Error('Server belum dapat dihubungi. Periksa koneksi atau coba lagi sebentar.');
  }
  const result = await readApiResponse(response);
  return result;
}

export async function readApiResponse(response) {
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Layanan GemaSuara belum terhubung. Backend perlu diaktifkan oleh pengelola aplikasi.');
  }
  let result;
  try { result = await response.json(); }
  catch { throw new Error('Respons server tidak lengkap. Silakan coba lagi.'); }
  if (!response.ok) {
    const error = new Error(result?.error || 'Koneksi server gagal.');
    error.status = response.status;
    throw error;
  }
  return result;
}
