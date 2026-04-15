import "../globals.css";
import AdminLayoutClient from "@/components/AdminLayoutClient/AdminLayoutClient";

export const metadata = {
  title: "Admin Panel | Ecommerce",
  description: "Ecommerce Admin Panel",
};

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
