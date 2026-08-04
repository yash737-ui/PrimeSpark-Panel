import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PowerSpark Panel",
  description: "Minecraft server hosting control panel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
