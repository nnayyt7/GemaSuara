import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
const UserContext = createContext(null);
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api('/me').then(setUser).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  const saveName = async (name) => setUser(await api(user ? '/me' : '/login', { name }));
  const logout = async () => { await api('/logout', {}); setUser(null); };
  return <UserContext.Provider value={{ name: user?.name || '', user, loading, saveName, logout }}>{children}</UserContext.Provider>;
}
export const useUser = () => useContext(UserContext);
