// src/app/layout.jsx
import './styles/globals.css';

export const metadata = {
  title: 'TinyLink',
  description: 'TinyLink - simple URL shortener',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className="antialiased bg-gray-50 text-gray-900">
        {/* You can add a shared header/footer here if you want */}
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
