"use client";

import { useEffect, useState } from "react";

const DEFAULT_COLOR = "bg-blue-500";

export function useUserColor() {
    const [userColor, setUserColor] = useState(DEFAULT_COLOR);

    useEffect(() => {
        const savedColor = localStorage.getItem("user-color");

        if (savedColor) {
            setUserColor(savedColor);
        }
    }, []);

    const updateUserColor = (color: string) => {
        setUserColor(color);
        localStorage.setItem("user-color", color);
    };

    return {
        userColor,
        setUserColor: updateUserColor,
    };
}