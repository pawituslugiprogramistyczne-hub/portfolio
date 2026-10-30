import type { Metadata } from "next"
import { AdminPanel } from "@/components/losowanie/admin-panel"

export const metadata: Metadata = {
  title: "Panel losowania",
  robots: { index: false, follow: false },
}

export default function Page() {
  return <AdminPanel />
}
