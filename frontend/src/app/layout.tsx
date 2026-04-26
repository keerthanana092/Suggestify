import type { Metadata } from "next";
import "./globals.css";

import { Providers } from '../components/Providers';
import { Sidebar } from '../components/Sidebar';

export const metadata: Metadata = {
  title: "Suggestify",
  description: "Discover your next favorite thing with Suggestify.",
  icons: {
    icon: "/suggestify_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app-layout">
            <Sidebar />
            <div className="main-content">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
