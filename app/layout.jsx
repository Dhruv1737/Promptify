import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Promptify — Smarter Prompts, Better Outputs",
  description:
    "Stop getting bad AI outputs. Our smart prompt engine wraps your ideas in elite-level instructions automatically.",
  icons: {
    icon: "/favicon.jpg",
    apple: "/favicon.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}