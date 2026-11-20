import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Admin is never indexed and never linked from public pages. */
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
