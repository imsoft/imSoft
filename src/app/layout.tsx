import { ConversionBar, Footer, Header } from "@/components/ui/shared";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"] });

interface Props {
  children: React.ReactNode;
}

export const metadata = {
  title: "imSoft",
  description: "imSoft",
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="es">
      <body className={montserrat.className}>
        <header className="sticky top-0 z-50">
          <ConversionBar />
          <Header />
        </header>
        {children}
        <Footer />
      </body>
    </html>
  );
}
