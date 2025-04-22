import localFont from "next/font/local";
import "./globals.css";
import {Outfit} from 'next/font/google';
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({subsets: ['latin']});

export const metadata = {
  title: "Intellistudy-Hub",
  description: "An Lms for students and teachers",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={outfit.className}
      >
        <Provider>
          {children}
        </Provider>
        <Toaster/>
      </body>
    </html>
    </ClerkProvider>
  );
}