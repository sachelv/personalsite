import type { Metadata } from "next";
import "./globals.css";
import { CrystalProvider } from "./components/CrystalProvider";
import SiteShell from "./components/SiteShell";

export const metadata: Metadata = {
  title: "samuel chen",
  description: "personal site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <CrystalProvider>
          <SiteShell>{children}</SiteShell>
        </CrystalProvider>
      </body>
    </html>
  );
}
