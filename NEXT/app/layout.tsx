import type { Metadata } from "next";
import "../styles/global.scss";
import styles from "../styles/AppStyles.module.scss";
import Nav from "../components/Nav";

export const metadata: Metadata = {
  title: "ISC TOOLS",
  description: "Ferramentas para ISC - UnB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>
        <div className={styles.appContainer}>
          <Nav />
          <main className="content-wrapper">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
