export function formatPKR(amount: number): string {
  if (!Number.isFinite(amount)) return 'PKR 0';
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

export function formatShortPKR(amount: number): string {
  if (!Number.isFinite(amount) || amount === 0) return 'PKR 0';
  if (amount >= 10_000_000) {
    return `PKR ${(amount / 10_000_000).toFixed(2)} Cr`;
  }
  if (amount >= 100_000) {
    return `PKR ${(amount / 100_000).toFixed(2)} Lac`;
  }
  return formatPKR(amount);
}

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (typeof err === 'object' && err !== null) {
    const maybeAxios = err as {
      response?: { data?: { error?: string; message?: string } };
      message?: string;
    };
    if (maybeAxios.response?.data?.error) return maybeAxios.response.data.error;
    if (maybeAxios.response?.data?.message) return maybeAxios.response.data.message;
    if (maybeAxios.message) return maybeAxios.message;
  }
  return fallback;
}
