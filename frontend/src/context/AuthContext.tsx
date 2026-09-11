import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { TOKEN_STORAGE_KEY } from '../api/client';
import { login as loginRequest } from '../api/auth';

interface AuthContextValue {
  isAuthenticated: boolean;
  username: string | null;
  name: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  );
  const [username, setUsername] = useState<string | null>(() =>
    localStorage.getItem(`${TOKEN_STORAGE_KEY}:username`),
  );
  const [name, setName] = useState<string | null>(() =>
    localStorage.getItem(`${TOKEN_STORAGE_KEY}:name`),
  );

  const login = useCallback(async (usernameInput: string, password: string) => {
    const response = await loginRequest(usernameInput, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, response.accessToken);
    localStorage.setItem(`${TOKEN_STORAGE_KEY}:username`, response.username);
    if (response.name) {
      localStorage.setItem(`${TOKEN_STORAGE_KEY}:name`, response.name);
    } else {
      localStorage.removeItem(`${TOKEN_STORAGE_KEY}:name`);
    }
    setToken(response.accessToken);
    setUsername(response.username);
    setName(response.name);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(`${TOKEN_STORAGE_KEY}:username`);
    localStorage.removeItem(`${TOKEN_STORAGE_KEY}:name`);
    setToken(null);
    setUsername(null);
    setName(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated: Boolean(token), username, name, login, logout }),
    [token, username, name, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
