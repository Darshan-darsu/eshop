import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { Poppins} from "next/font/google";

export const metadata: Metadata = {
  title: "E Shop Seller",
  description: "E Shop Seller",
};

const poppins=Poppins({
  subsets:["latin"],
  weight:["100","200","300","400","500","600","700","800","900"],
  variable:"--font-poppins"
})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-slate-900 font-sans antialiased ${poppins.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
