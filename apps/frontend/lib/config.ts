const FALLBACK_API_BASE = 'https://api.bosstradersinvestorclass.com/api';

export const getApiBaseUrl = (): string => {
  const envValue = process.env.NEXT_PUBLIC_API_BASE?.trim();

  if (!envValue) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'NEXT_PUBLIC_API_BASE is not defined. Falling back to default API URL:',
        FALLBACK_API_BASE,
      );
    }
    return FALLBACK_API_BASE;
  }

  return envValue;
};

export const API_BASE_URL = getApiBaseUrl();


