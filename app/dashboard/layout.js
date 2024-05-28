"use client"
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>

        <div>
            <Header />
            <div className="flex">
                <Sidebar />

                <div className="flex flex-col w-full">
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </div>
      </body>
    </html>
  );
}
