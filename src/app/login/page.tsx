import type { Metadata } from "next";
import { LoginSection } from "@/components/sections/login-section";
export const metadata: Metadata = { title: "Welcome to your studio" };
export default function LoginPage() {
  return <LoginSection />;
}
