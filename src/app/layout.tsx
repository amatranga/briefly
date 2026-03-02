import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Briefly",
  description: "Generate a quick daily brief.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}