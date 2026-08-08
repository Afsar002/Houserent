import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rent Receipt Generator & Property Manager",
  description:
    "Generate receipts, manage properties, and maintain tenant ledger with server-side persistence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-800 font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}