import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import AdminNavbar from "@/components/AdminNavbar/AdminNavbar";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ecommerce",
  description: "Ecommerce User Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`min-h-[100vh] ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen w-screen gap-2">
          <div className="w-[25vw]">
            <AdminNavbar />
          </div>
          <div className="w-[75vw]">{children}</div>
        </div>
      </body>
    </html>
  );
}
