"use client";

import { useContext, useState, useEffect } from "react";
import { CourseCountContext } from "@/app/_context/CourseCountContext";
import { Button } from "@/components/ui/button";
import { Columns, ArrowUpCircle, Rocket, TrendingUp, Globe } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/app/contexts/LanguageContext"; // Import custom hook for language
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import axios from 'axios';
import { changeLanguage } from '@/app/i18n';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', nativeLabel: 'English' },
  { code: 'te', nativeLabel: 'తెలుగు' },
  { code: 'ta', nativeLabel: 'தமிழ்' },
  { code: 'ml', nativeLabel: 'മലയാളം' },
  { code: 'hi', nativeLabel: 'हिंदी' },
  { code: 'es', nativeLabel: 'Español' },
  { code: 'fr', nativeLabel: 'Français' },
  { code: 'de', nativeLabel: 'Deutsch' },
  { code: 'zh', nativeLabel: '中文' }
];

function Sidebar() {
  const { totalCourses } = useContext(CourseCountContext);
  const { language, changeLanguage } = useLanguage();
  const path = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const { user } = useUser();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setDarkMode(savedTheme === "dark");
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    // Fetch user role when component mounts
    if (user?.primaryEmailAddress?.emailAddress) {
      getUserRole();
    }
  }, [user]);

  // Add effect to sync language with localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  const getUserRole = async () => {
    try {
      const response = await axios.post('/api/get-user-role', {
        email: user?.primaryEmailAddress?.emailAddress
      });
      setUserRole(response.data.role);
    } catch (error) {
      console.error('Error getting user role:', error);
    }
  };

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("theme", newMode ? "dark" : "light");
      document.documentElement.classList.toggle("dark", newMode);
      return newMode;
    });
  };

  const availableCredits = 5 - totalCourses;

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    try {
      await i18n.changeLanguage(newLang);
      localStorage.setItem('i18nextLng', newLang);
      document.documentElement.lang = newLang;
    } catch (error) {
      console.error('Language change error:', error);
    }
  };

  // Get the current language's native label
  const getCurrentLanguageLabel = () => {
    const currentLang = languages.find(lang => lang.code === i18n.language);
    return currentLang ? currentLang.nativeLabel : 'English';
  };

  const getProgressColor = (credits) => {
    if (credits >= 4) return 'from-red-500 to-red-600';
    if (credits >= 2) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  return (
    <div className="h-screen shadow-md bg-white/30 dark:bg-gray-900/30 dark:text-white relative flex flex-col backdrop-blur-lg rounded-lg">
      {/* Main Content Wrapper with Scrolling */}
      <div className="flex-1 overflow-y-auto p-4 pb-24"> {/* Added pb-24 for bottom padding */}
        {/* Logo and Title */}
        <div className="flex gap-2 items-center">
          <Image src="/logo.png" alt={t("logoTitle")} width={40} height={40} />
          <h2 className="font-bold text-2xl">{t("logoTitle")}</h2>
        </div>

        {/* User Profile Section */}
        <div className="mt-8 flex flex-col items-center">
          <div className="relative">
            <div className="scale-[2.0] z-10">
              <UserButton />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mt-6">{user?.fullName || t("Guest")}</h3>
        </div>

        {/* Menu Links */}
        <div className="mt-3">
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: t("Dashboard"), path: "/dashboard", icon: Columns },
              { name: t("Upgrade"), path: "/dashboard/upgrade", icon: ArrowUpCircle }
            ].map((menu, index) => (
              <Link href={menu.path} key={index}>
                <div
                  className={`relative group overflow-hidden flex flex-col items-center p-4 rounded-md transition-all duration-300 ${
                    path === menu.path 
                    ? "bg-gradient-to-r from-[#CAD5FF] via-[#D8CAFF] to-[#F0D5FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-gray-900 dark:text-white" 
                    : "hover:bg-gradient-to-r hover:from-[#CAD5FF] hover:via-[#D8CAFF] hover:to-[#F0D5FF] dark:hover:from-[#4B47B3] dark:hover:via-[#635AE5] dark:hover:to-[#8E5AED] text-gray-700 dark:text-gray-200"
                  }`}
                >
                  <span className="absolute inset-0 bg-white/30 dark:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <menu.icon size={24} className="mb-2 relative z-10" />
                  <h2 className="text-sm relative z-10">{menu.name}</h2>
                </div>
              </Link>
            ))}
          </div>

          {/* Language Dropdown */}
          <div className="mt-5 px-4">
            <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 dark:from-purple-600 dark:via-pink-600 dark:to-red-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative p-4 rounded-xl bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {t("Select Language")}
                  </span>
                </div>
                <select
                  value={i18n.language || 'en'}
                  onChange={handleLanguageChange}
                  className="w-full p-2 rounded-md bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 border border-purple-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all duration-300"
                >
                  {languages.map((lang) => (
                    <option
                      key={lang.code}
                      value={lang.code}
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {lang.nativeLabel}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Credits Section */}
        <div className="mt-5">
          

          {/* Admin Button - Only show for admin/metaadmin */}
          {(userRole === 'admin' || userRole === 'metaadmin') && (
            <div className="mt-3 mb-4">
              <Link href="/admin">
                <Button 
                  className="relative group overflow-hidden w-full bg-gradient-to-r from-[#CAD5FF] via-[#D8CAFF] to-[#F0D5FF] hover:from-[#B7C4FF] hover:via-[#D0BCFF] hover:to-[#F2CDFF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] dark:hover:from-[#3730A3] dark:hover:via-[#4F46E5] dark:hover:to-[#7C3AED] text-gray-900 dark:text-white hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <span className="absolute inset-0 bg-white/30 dark:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative">{t("Admin Dashboard")}</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Dark Mode Toggle - Outside the scrollable area */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center px-4">
        <div className="bg-gradient-to-r from-[#CAD5FF]/50 via-[#D8CAFF]/50 to-[#F0D5FF]/50 dark:from-[#4B47B3]/30 dark:via-[#635AE5]/30 dark:to-[#8E5AED]/30 rounded-full p-1 flex w-48 shadow-lg backdrop-blur-lg">
          <button
            onClick={toggleTheme}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-full transition-all duration-300 w-24
              ${!darkMode 
                ? 'bg-gradient-to-r from-[#CAD5FF] via-[#D8CAFF] to-[#F0D5FF] text-gray-900 shadow-md' 
                : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Image src="/sun.svg" width={16} height={16} alt="sun icon" />
            {t("Light")}
          </button>
          <button
            onClick={toggleTheme}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-full transition-all duration-300 w-24
              ${darkMode 
                ? 'bg-gradient-to-r dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-800'}`}
          >
            <Image src="/moon.svg" width={16} height={16} alt="moon icon" />
            {t("Dark")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;