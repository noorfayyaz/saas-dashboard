import "./globals.css";

export const metadata = {
  title: "TeamHub - Multi-tenant SaaS Dashboard",
  description: "Team management, roles, subscription plans, and analytics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
