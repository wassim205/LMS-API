import { AuthProvider } from "@/context/auth-context";
import { AlertCircle, CheckCircle } from "lucide-react";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: " Bright Academy",
  description: " Bright Academy E-Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        className={`${manrope.className} antialiased bg-white text-[#1a1a1a]`}
      >
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right" 
            richColors={false}
            icons={{
                success: (
                  <div className="rounded-full p-2 flex items-center justify-center">
                    <CheckCircle className="text-red-700 w-4.5 h-4.5" />
                  </div>
                ),
                error: (
                  <div className="rounded-full p-2 flex items-center justify-center">
                    <AlertCircle className="text-red-700 w-4.5 h-4.5" />
                  </div>
                ),
              }}
            toastOptions={{
              style: {
                background: 'white',
                color: '#1a1a1a',
                borderRadius: '4px',
                border: 'none',
                borderLeft: '5px solid #cb1030',
                padding: '16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                fontSize: '14px',
                fontFamily: 'var(--font-manrope)',
              },
              classNames: {
                toast: 'group pointer-events-auto flex items-center',
                title: 'text-[#1a1a1a] font-medium ml-3',
                icon: 'flex items-center justify-center',
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
