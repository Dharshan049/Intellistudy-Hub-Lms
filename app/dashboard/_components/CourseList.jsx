"use client";

import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import CourseCardItem from './CourseCardItem';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, Plus } from 'lucide-react';
import { CourseCountContext } from '@/app/_context/CourseCountContext';
import { useLanguage } from "@/app/contexts/LanguageContext"; // Import useLanguage
import translations1 from './translations1'; // Import translations
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";

function CourseList() {
  const { user } = useUser();
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const { totalCourses, setTotalCourses } = useContext(CourseCountContext);
  const { language } = useLanguage(); // Access current language
  const [searchQuery, setSearchQuery] = useState('');

  // Store translations based on current language
  const t = (key) => {
    const translations = {
      en: {
        yourCourses: "Your Courses",
        "Create New": "Create New",
        refresh: "Refresh",
      },
      ta: {
        yourCourses: "உங்கள் பாடங்கள்",
        "Create New": "புதியது உருவாக்கவும்",
        refresh: "புதுப்பிக்கவும்",
      },
      ml: {
        yourCourses: "നിങ്ങളുടെ കോഴ്സുകൾ",
        "Create New": "പുതിയത് സൃഷ്ടിക്കുക",
        refresh: "പുതുക്കുക",
      },
    };
    return translations[language]?.[key] || translations.en[key];
  };

  useEffect(() => {
    if (user) {
      getUserRole();
    }
  }, [user]);

  const getUserRole = async () => {
    try {
      const response = await axios.post('/api/get-user-role', {
        email: user?.primaryEmailAddress?.emailAddress
      });
      setUserRole(response.data.role);
      fetchCourses(response.data.role);
    } catch (error) {
      console.error('Error getting user role:', error);
      toast.error("Failed to fetch user role");
    }
  };

  const fetchCourses = async (role) => {
    setLoading(true);
    try {
      // Log user info for debugging
      // console.log('Fetching courses with:', {
      //   email: user?.primaryEmailAddress?.emailAddress,
      //   userId: user?.id,
      //   role: role
      // });

      const response = await axios.post('/api/courses', {
        createdBy: user?.primaryEmailAddress?.emailAddress,
        userId: user?.id,
        role: role
      });

      // Filter out courses that don't have courseLayout
      const validCourses = (response.data.result || []).filter(course => 
        course.courseLayout && 
        (course.createdBy === user?.primaryEmailAddress?.emailAddress || course.publishedBy)
      );

      // console.log('Filtered courses:', validCourses);
      setCourseList(validCourses);
      setTotalCourses(validCourses.length);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseDelete = (deletedCourseId) => {
    // Update the courseList state by filtering out the deleted course
    setCourseList(prevCourses => prevCourses.filter(course => course.courseId !== deletedCourseId));
  };

  const filteredCourses = courseList.filter(course => 
    course?.courseLayout?.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-3xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
          {t("yourCourses")}
        </h2>
        <div className="flex gap-4 items-center">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black z-10" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[200px] bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-30 dark:bg-opacity-40 border-[#E5DBFF] dark:border-gray-600 focus:border-[#DDE3FF] dark:focus:border-gray-500 placeholder-gray-600 dark:placeholder-gray-300 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#E5DBFF] dark:focus:ring-gray-600 transition-all duration-300 rounded-xl"
            />
          </div>
          <Link href="/create">
            <Button className="relative group overflow-hidden bg-gradient-to-r from-[#DDE3FF] via-[#E5DBFF] to-[#F7E6FF] hover:from-[#B7C4FF] hover:via-[#D0BCFF] hover:to-[#F2CDFF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] dark:hover:from-[#3730A3] dark:hover:via-[#4F46E5] dark:hover:to-[#7C3AED] text-gray-900 dark:text-white border-none hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300">
              <span className="relative">{t("Create New")}</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              fetchCourses(userRole);
            }}
            className="relative group overflow-hidden border-2 border-[#E5DBFF] dark:border-[#635AE5] bg-gradient-to-r from-[#DDE3FF]/50 via-[#E5DBFF]/50 to-[#F7E6FF]/50 hover:from-[#B7C4FF] hover:via-[#D0BCFF] hover:to-[#F2CDFF] dark:from-[#4B47B3]/50 dark:via-[#635AE5]/50 dark:to-[#8E5AED]/50 dark:hover:from-[#3730A3] dark:hover:via-[#4F46E5] dark:hover:to-[#7C3AED] text-gray-900 dark:text-white transform hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <RefreshCw className="mr-2 h-4 w-4 relative" />
            <span className="relative">{t("refresh")}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 mt-5 gap-5">
        {loading === false ? (
          <>
            {filteredCourses?.length > 0 ? (
              <>
                {filteredCourses.map((course, index) => (
                  <CourseCardItem course={course} key={index} userRole={userRole} onDelete={handleCourseDelete} />
                ))}
                <Link href="/create" className="flex items-center justify-center">
                  <div className="rounded-lg p-5 bg-gradient-to-r from-[#CAD5FF] via-[#D8CAFF] to-[#F0D5FF] hover:from-[#B7C4FF] hover:via-[#D0BCFF] hover:to-[#F2CDFF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] dark:hover:from-[#3730A3] dark:hover:via-[#4F46E5] dark:hover:to-[#7C3AED] border-2 border-dashed border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 w-full h-full min-h-[200px] flex flex-col items-center justify-center cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-white/80 dark:bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-[360deg] transition-all duration-500">
                      <Plus className="w-6 h-6 text-gray-900 dark:text-white" />
                    </div>
                    <p className="mt-4 text-gray-900 dark:text-white text-center font-medium group-hover:text-black dark:group-hover:text-white transition-colors duration-300">Create New Course</p>
                  </div>
                </Link>
              </>
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#CAD5FF] via-[#D8CAFF] to-[#F0D5FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No courses yet</h3>
                <p className="text-gray-800 dark:text-gray-200 mb-6 text-center">Get started by creating your first course</p>
                <Link href="/create">
                  <Button className="relative group overflow-hidden bg-gradient-to-r from-[#CAD5FF] via-[#D8CAFF] to-[#F0D5FF] hover:from-[#B7C4FF] hover:via-[#D0BCFF] hover:to-[#F2CDFF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] dark:hover:from-[#3730A3] dark:hover:via-[#4F46E5] dark:hover:to-[#7C3AED] text-gray-900 dark:text-white hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300">
                    <span className="absolute inset-0 bg-white/30 dark:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative">Add a new course</span>
                  </Button>
                </Link>
              </div>
            )}
          </>
        ) : (
          [1, 2, 3, 4, 5, 6].map((item, index) => (
            <div
              key={index}
              className="h-56 w-full bg-gradient-to-r from-[#EEF2FF] via-[#F3E8FF] to-[#FCE7F3] rounded-lg animate-pulse"
            ></div>
          ))
        )}
      </div>
    </div>
  );
}

export default CourseList;