"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type ApiKeysContextValue = {
  configuredProviders: string[];
  loading: boolean;
  hasAnyKey: boolean;
  refresh: () => Promise<void>;
};

const ApiKeysContext = createContext<ApiKeysContextValue>({
  configuredProviders: [],
  loading: true,
  hasAnyKey: false,
  refresh: async () => {},
});

export function ApiKeysProvider({ children }: { children: ReactNode }) {
  const [configuredProviders, setConfiguredProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/user/api-keys");
      if (res.ok) {
        const data: { provider: string }[] = await res.json();
        setConfiguredProviders(data.map((d) => d.provider));
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <ApiKeysContext.Provider
      value={{
        configuredProviders,
        loading,
        hasAnyKey: configuredProviders.length > 0,
        refresh,
      }}
    >
      {children}
    </ApiKeysContext.Provider>
  );
}

export function useApiKeys() {
  return useContext(ApiKeysContext);
}
