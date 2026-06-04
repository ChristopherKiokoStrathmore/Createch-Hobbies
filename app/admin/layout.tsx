import { AdminAuthProvider } from "@/context/AdminAuthContext";
import AdminShell from "./_shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
