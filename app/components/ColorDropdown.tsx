
"use client";
import { useMemo, useState } from "react"
import { userColorClasses } from "../utils";
import { RiArrowDownSLine } from "react-icons/ri";

export function ColorDropdown({
    userColor,
    setUserColor,
}: {
    userColor: string
    setUserColor: (color: string) => void
}) {
    const [open, setOpen] = useState(false);

    const key = useMemo(() => {
        const found = Object.entries(userColorClasses).find(
            ([, value]) => value === userColor
        )

        return found?.[0] ?? 'blue'
    }, [userColor])

    return (
        <div className="relative text-left text-[16px]">

            {/* BUTTON */}
            <button aria-label="Seleced Color"
                onClick={() => setOpen(!open)}
                className="bg-white/5 border dark:border-white/10 border-black/10 px-4 py-1 rounded-xl flex items-center gap-2"
            >
                <span
                    className={`w-2 h-2 block rounded-full capitalize ${userColor}`}
                />
                <span className="capitalize">{key}</span>
                <RiArrowDownSLine />
            </button>

            {/* DROPDOWN */}
            {open && (
                <div className="absolute right-0 top-10 mt-2 w-80  border dark:border-white/10 dark:bg-black bg-white border-black/10 rounded-xl shadow-lg overflow-hidden z-50">

                    <div className="grid md:grid-cols-3 grid-cols-1">
                        {Object.entries(userColorClasses).map(
                            ([key, value]) => (
                                <button aria-label="Selecting Color"
                                    key={key}
                                    onClick={() => {
                                        setUserColor(value);
                                        setOpen(false);
                                        localStorage.setItem('user-color', value)
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition"
                                >
                                    <span
                                        className={`w-2 h-2 flex-none rounded-full ${value}`}
                                    />
                                    <span className="capitalize ">
                                        {key}
                                    </span>
                                </button>
                            )
                        )}
                    </div>

                </div>
            )}
        </div>
    )
}