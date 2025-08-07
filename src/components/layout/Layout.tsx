
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SEOHead from "../SEO/SEOHead";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
}

const Layout = ({ children, title, description, keywords, url }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen relative">
      <SEOHead 
        title={title}
        description={description}
        keywords={keywords}
        url={url}
      />
      <Header />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
