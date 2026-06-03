import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ThemeProvider } from "next-themes";
import { UserColorProvider } from "./context/UserColorContext";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Chatbot",
  description:
    "A modern AI chatbot powered by Gemini API with OpenAI-compatible integration for fast and intelligent responses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning
    >
      <body className=" h-screen flex flex-col  font-sans">
        <ThemeProvider
          attribute="class" defaultTheme="dark" enableSystem
        >
          <UserColorProvider>
            <Toaster />
            {children}
          </UserColorProvider>
        </ThemeProvider></body>
    </html>
  );
}
