'use client';

import { useEffect, useState } from 'react';

export function useCSRF() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);

  useEffect(() => {
    // Get CSRF token from cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const token = getCookie('csrf-token');
    setCSRFToken(token || null);
  }, []);

  // Utility function to add CSRF token to headers
  const addCSRFHeader = (headers: HeadersInit = {}): HeadersInit => {
    if (!csrfToken) return headers;

    return {
      ...headers,
      'x-csrf-token': csrfToken,
    };
  };

  return { csrfToken, addCSRFHeader };
}
