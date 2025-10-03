export const metadata = {
  title: "AI-powered End-to-End Test Generator",
  description: "Generate Playwright tests with Azure AI (or mock) and run them.",
};

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
