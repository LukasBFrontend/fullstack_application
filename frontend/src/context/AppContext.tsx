import React, { createContext, useContext, useState} from 'react';
import type { ReactNode } from 'react';
import type { Post } from '../context/Types'
import type { User } from '../context/Types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  friends: User[] | null;
  setFriends: (friends: User[] | null) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  language: string;
  setLanguage: (language: string) => void;
  posts: Post[] | null;
  setPosts: (posts: Post[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// 3. Create the provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<User[] | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<string>('en');
  const [posts, setPosts] = useState<Post[]>([]);

  const value: AppContextType = {
    user,
    setUser,
    friends,
    setFriends,
    theme,
    setTheme,
    language,
    setLanguage,
    posts,
    setPosts,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// 4. Custom hook for easier consumption
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
