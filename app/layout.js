import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from '../components/ClientProviders';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ojutu Dashboard",
  description: "Ojutu Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
