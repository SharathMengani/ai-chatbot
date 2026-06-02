
// app/context/UserColorContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const UserColorContext = createContext<any>(null);

export function UserColorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userColor, setUserColor] = useState("border-2 border-blue-500");

  useEffect(() => {
    const saved = localStorage.getItem("user-color");

    if (saved) {
      setUserColor(saved);
    }
  }, []);

  const updateUserColor = (color: string) => {
    setUserColor(color);
    localStorage.setItem("user-color", color);
  };

  return (
    <UserColorContext.Provider
      value={{
        userColor,
        setUserColor: updateUserColor,
      }}
    >
      {children}
    </UserColorContext.Provider>
  );
}

export function useUserColor() {
  return useContext(UserColorContext);
}