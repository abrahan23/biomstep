import { ClerkProvider } from "@clerk/nextjs"

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return <ClerkProvider>{children}</ClerkProvider>
}
