import "./globals.css";
import { ServiceWorkerRegister } from "@/app/ServiceWorkerRegister";

export const viewport = {
  themeColor: "#166534",
};

export const metadata = {
  title: "Mandi Markt",
  description: "Wholesale/Retail ordering app.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mandi Markt",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/globe.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/favicon.ico" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
