import "../styles/global.css";

export const metadata = { title: "Auto Verse AI" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-zinc-50 text-zinc-900">{children}</body>
    </html>
  );
}