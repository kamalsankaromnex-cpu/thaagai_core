export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-thaagai-bg text-thaagai-ink antialiased selection:bg-thaagai-wine selection:text-white dark:bg-thaagai-cardDark dark:text-thaagai-inkDark">
      {children}
    </div>
  );
}
