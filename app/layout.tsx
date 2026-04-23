import type { Metadata } from "next";
import "./globals.css";
import { CrystalProvider } from "./components/CrystalProvider";
import SiteShell from "./components/SiteShell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://samuelchenn.com";
const socialPreviewImage = "/electron%20filling%20arrows.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "samuel chen",
  description: "personal site",
  openGraph: {
    title: "samuel chen",
    description: "personal site",
    url: "/",
    siteName: "samuel chen",
    images: [
      {
        url: socialPreviewImage,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "samuel chen",
    description: "personal site",
    images: [socialPreviewImage],
  },
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
