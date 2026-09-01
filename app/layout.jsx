import '../src/index.css';

export const metadata = {
  title: 'Learnozi — AI Powered Study & Productivity Platform',
  description: 'AI-assisted study planner, flashcards, pomodoro timer, and exam preparation platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body style={{ margin: 0, padding: 0, minHeight: '100vh' }} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
