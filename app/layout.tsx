import "./globals.css"
import { Inter } from "next/font/google"
import Header from "./components/Header"
import { ThemeProvider } from "./components/ThemeProvider"
import { config } from "dotenv"
config()

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ORB",
  description: "Online Recipe Book - Create and share delicious recipes",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

