import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import DesktopNav from "@/components/navigation/DesktopNav";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Personal Nexus",
  description: "Modular personal dashboard for tracking life metrics",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="personalhub-theme"
        >
          <div className="flex min-h-screen">
            <DesktopNav />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
