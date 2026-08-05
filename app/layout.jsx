import './globals.css';

export const metadata = {
  title: 'SJ 32Core ERP',
  description: 'Enterprise Resource Planning & AI Orchestration System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-enterprise-dark text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
