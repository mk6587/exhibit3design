
import { ReactNode, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SEOHead from "../SEO/SEOHead";
import { ChatButton } from "../chat/ChatButton";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
}

const Layout = ({ children, title, description, keywords, url }: LayoutProps) => {
  useEffect(() => {
    const handleOpenChat = () => {
      const chatButton = document.querySelector('[data-chat-button]') as HTMLButtonElement;
      chatButton?.click();
    };

    window.addEventListener('openSupportChat', handleOpenChat);
    return () => window.removeEventListener('openSupportChat', handleOpenChat);
  }, []);

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
      <ChatButton />
    </div>
  );
};

export default Layout;
