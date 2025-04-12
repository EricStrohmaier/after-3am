import type { Metadata } from "next";
import { AudioProvider } from "@/components/audio-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ask Me After 3AM",
  description: "Ask surreal, dreamlike responses after 3AM",
  keywords: ["3AM", "After 3AM", "Surreal", "Dreamlike", "Insomniac", "AI"],
  openGraph: {
    title: "Ask Me After 3AM",
    description: "Ask surreal, dreamlike responses after 3AM",
    type: "website",
  },
  twitter: {
    title: "Ask Me After 3AM",
    description: "Ask surreal, dreamlike responses after 3AM",
    card: "summary_large_image",
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
        <AudioProvider>
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
