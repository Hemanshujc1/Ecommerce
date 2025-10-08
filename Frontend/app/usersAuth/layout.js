import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import UserFooter from "@/components/UserFooter/UserFooter";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ecommerce User Panel",
  description: "Ecommerce User Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`min-h-[100vh] ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        <UserFooter />
      </body>
    </html>
  );
}
