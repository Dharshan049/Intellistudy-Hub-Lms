"use client";

import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState, useContext } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import { CourseCountContext } from "@/app/_context/CourseCountContext";
import { Book, FileText, MessageCircle, Clock, ChevronLeft, ChevronRight, CalendarDays, Sparkles } from "lucide-react";
import axios from 'axios';
import { format, parseISO, isToday, isSameDay } from 'date-fns';

function WelcomeBanner() {
  const { user } = useUser();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { totalCourses } = useContext(CourseCountContext);
  const [fullName, setFullName] = useState("Guest");
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalFlashcards: 0,
    totalQuizzes: 0,
    timeSpent: "3h 40m",
    onFire: true
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [overallProgress, setOverallProgress] = useState({
    completed: 0,
    total: 0
  });
  const [timeSpentData, setTimeSpentData] = useState([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [visibleDates, setVisibleDates] = useState([]);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      fetchUserStats();
      fetchTimeSpentData();
    }
  }, [user, totalCourses]);

  const fetchUserStats = async () => {
    try {
      // Fetch all courses for the user
      const coursesResponse = await axios.post('/api/courses', {
        createdBy: user.primaryEmailAddress.emailAddress,
        userId: user.primaryEmailAddress.emailAddress,
        role: 'user'
      });

      const courses = coursesResponse.data.result;
      let totalProgress = 0;
      let totalNotesCount = 0;
      let totalFlashcardsCount = 0;
      let totalQuizCount = 0;

      // For each course, fetch progress
      for (const course of courses) {
        // Fetch study progress
        const progressResponse = await axios.get('/api/study-progress', {
          params: {
            courseId: course.courseId,
            userId: user.primaryEmailAddress.emailAddress
          }
        });

        const studyProgress = progressResponse.data.progress;
        
        // Count total items for stats
        studyProgress.forEach(progress => {
          if (progress.type === 'notes') {
            totalNotesCount += progress.totalItems;
          } else if (progress.type === 'flashcard') {
            totalFlashcardsCount += progress.totalItems;
          }
        });

        // Calculate course progress percentage
        if (studyProgress.length > 0) {
          const courseProgressPercentage = studyProgress.reduce((acc, curr) => {
            return acc + ((curr.currentPosition / curr.totalItems) * 100);
          }, 0) / studyProgress.length; // Average progress for this course

          totalProgress += courseProgressPercentage;
        }

        // Fetch quiz results for stats
        const quizResponse = await axios.post('/api/quiz/get-result', {
          courseId: course.courseId,
          userId: user.primaryEmailAddress.emailAddress
        });

        if (quizResponse.data.result) {
          totalQuizCount += quizResponse.data.result.totalQuestions;
        }
      }

      // Calculate overall progress as average of all courses
      const averageProgress = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0;

      setOverallProgress({
        completed: averageProgress,
        total: 100
      });

      setStats({
        totalNotes: totalNotesCount,
        totalFlashcards: totalFlashcardsCount,
        totalQuizzes: totalQuizCount,
        timeSpent: stats.timeSpent,
        onFire: stats.onFire
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchTimeSpentData = async () => {
    try {
      // Fetch study progress data
      const studyProgressResponse = await axios.get('/api/study-progress', {
        params: {
          userId: user.primaryEmailAddress.emailAddress
        }
      });

      // Fetch quiz results
      const quizResponse = await axios.post('/api/quiz/get-result', {
        userId: user.primaryEmailAddress.emailAddress
      });

      // console.log('Study Progress Data:', studyProgressResponse.data);
      // console.log('Quiz Data:', quizResponse.data);

      // Process and combine the data
      const progressData = studyProgressResponse.data.progress || [];
      const quizData = quizResponse.data.result || [];

      // Create a map to store time spent per date
      const timeMap = new Map();

      // Process study progress data (5 minutes per update)
      progressData.forEach(progress => {
        if (progress.lastUpdated) {
          const date = format(parseISO(progress.lastUpdated), 'yyyy-MM-dd');
          const minutes = timeMap.get(date) || 0;
          timeMap.set(date, minutes + 5);
        }
      });

      // Process quiz data (10 minutes per quiz)
      quizData.forEach(quiz => {
        if (quiz.completedAt) {
          const date = format(parseISO(quiz.completedAt), 'yyyy-MM-dd');
          const minutes = timeMap.get(date) || 0;
          timeMap.set(date, minutes + 10);
        }
      });

      // Get the date range for the last 7 days
      const today = new Date();
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i)); // This makes the dates go from oldest to newest
        return format(date, 'yyyy-MM-dd');
      });

      // Create an array with all dates, including empty ones
      const timeArray = dates.map(date => ({
        date: parseISO(date),
        minutes: timeMap.get(date) || 0
      }));

      // console.log('Processed Time Data:', timeArray);

      setTimeSpentData(timeArray);
      updateVisibleDates(timeArray, 0);
    } catch (error) {
      // console.error('Error fetching time spent data:', error);
      // Set some sample data if there's an error
      const sampleData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i)); // Keep consistent with the main logic
        return {
          date,
          minutes: Math.floor(Math.random() * 60) + 30
        };
      });
      setTimeSpentData(sampleData);
      updateVisibleDates(sampleData, 0);
    }
  };

  const updateVisibleDates = (data, startIndex) => {
    const visibleData = data.slice(startIndex, startIndex + 7);
    setVisibleDates(visibleData);
  };

  const handleNext = () => {
    const newIndex = Math.min(currentDateIndex + 1, timeSpentData.length - 7);
    setCurrentDateIndex(newIndex);
    updateVisibleDates(timeSpentData, newIndex);
  };

  const handlePrev = () => {
    const newIndex = Math.max(currentDateIndex - 1, 0);
    setCurrentDateIndex(newIndex);
    updateVisibleDates(timeSpentData, newIndex);
  };

  useEffect(() => {
    if (user?.fullName) {
      setFullName(user.fullName);
    } else {
      setFullName("Guest");
    }
  }, [user?.fullName]);

  const availableCredits = 5 - totalCourses;

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    const startDate = new Date(selectedDate);
    // Center the current date by going back 2 days
    startDate.setDate(startDate.getDate() - 2);
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date) => {
    return date.getDate().toString().padStart(2, '0');
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="relative group overflow-hidden rounded-3xl p-8 bg-white/30 backdrop-blur-md shadow-lg 
                      dark:bg-white/10 dark:backdrop-blur-lg animate-fadeIn border-[3px] border-transparent 
                      before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-r 
                      before:from-blue-500 before:via-purple-500 before:to-pink-500 before:opacity-0 
                      before:transition-opacity before:duration-500 before:animate-glow">

        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-50 
                        animate-flowingBackground blur-xl"></div>

        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white animate-slideUp">
            {t("Welcome back")}
          </h1>
          <p className="text-center text-2xl md:text-3xl lg:text-4xl font-semibold max-w-2xl mx-auto 
              bg-gradient-to-r from-blue-600 to-purple-600 dark:from-cyan-400 dark:to-pink-400 
              bg-clip-text text-transparent animate-slideUp">
          {t("Enjoy your learning journey!")}
        </p>
        </div>
      </div>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Section - Statistics Cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* Statistics Grid */}
          <div className="grid grid-cols-4 gap-4">
            {/* Total Courses Card */}
            <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 dark:from-rose-600 dark:via-fuchsia-600 dark:to-indigo-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative h-[120px] p-4 rounded-xl bg-white dark:bg-gray-800 flex flex-col justify-between backdrop-blur-sm bg-opacity-30 dark:bg-opacity-40">
                <div className="flex items-center gap-2">
                  <Book className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  <div className="text-sm text-black dark:text-gray-300">{t("Total Courses")}</div>
                </div>
                <div className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{totalCourses}</div>
              </div>
            </div>
            {/* Total Notes Card */}
            <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
              {/* Glowing border effect with reduced intensity */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-400 dark:from-amber-500 dark:via-orange-500 dark:to-yellow-500 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
              
              {/* Frosted glass background with blur effect */}
              <div className="relative h-[120px] p-4 rounded-xl bg-white dark:bg-gray-800 flex flex-col justify-between backdrop-blur-sm bg-opacity-30 dark:bg-opacity-40">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <div className="text-sm text-black dark:text-gray-300">{t("Total Notes")}</div>
                </div>
                <div className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{stats.totalNotes}</div>
              </div>
            </div>
            {/* Total Flashcards Card */}
            <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
              {/* Frosted Glass Effect on the Card */}
              <div className="relative h-[120px] p-4 rounded-xl bg-white dark:bg-gray-800 flex flex-col justify-between backdrop-blur-lg bg-opacity-30 dark:bg-opacity-40">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center text-emerald-500 dark:text-emerald-400">🎴</div>
                  {/* Label with theme-based text color */}
                  <div className="text-sm text-black dark:text-white">{t("Total Flashcards")}</div>
                </div>
                {/* Numbers with theme-based text color */}
                <div className="text-2xl font-semibold 
                  dark:text-white text-black">
                  {stats.totalFlashcards}
                </div>
              </div>

              {/* Reduced Glowing Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-200 via-teal-300 to-cyan-300 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 rounded-xl opacity-30 group-hover:opacity-50 transition duration-300"></div>
            </div>
            {/* Total Quizzes Card */}
            <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
              {/* Reduced Glowing Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-300 via-sky-400 to-cyan-400 dark:from-blue-500 dark:via-sky-500 dark:to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>

              {/* Card Content with Frosted Glass Effect */}
              <div className="relative h-[120px] p-4 rounded-xl bg-white dark:bg-gray-800 flex flex-col justify-between backdrop-blur-lg bg-opacity-30 dark:bg-opacity-40">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  {/* Label text color (black in light mode, white in dark mode) */}
                  <div className="text-sm text-black dark:text-white">{t("Total Quizzes")}</div>
                </div>
                {/* Number text color (black in light mode, white in dark mode) */}
                <div className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent text-black dark:text-white">
                  {stats.totalQuizzes}
                </div>
              </div>
            </div>
          </div>

          {/* Available Credits Section */}
          <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
            {/* Glowing Background with Reduced Intensity */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-300 via-purple-400 to-fuchsia-400 dark:from-violet-600 dark:via-purple-600 dark:to-fuchsia-600 rounded-xl blur opacity-40 group-hover:opacity-75 transition duration-300"></div>

            {/* Card Content with Frosted Glass Effect */}
            <div className="relative h-[140px] p-4 rounded-xl bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-30 dark:bg-opacity-40">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                  <div>
                    {/* Label Text (Black in Light Mode, White in Dark Mode) */}
                    <div className="text-sm text-black dark:text-white">{t("Available Credits")}</div>
                    {/* Number Text (Black in Light Mode, White in Dark Mode) */}
                    <div className="text-2xl font-semibold mt-1 bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent text-black dark:text-white">
                      {availableCredits} {t("Credits")}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {/* Used Text (Light Mode and Dark Mode Support) */}
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {t("Used")}: {totalCourses}/5
                  </div>
                  {/* Progress Bar */}
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${(totalCourses / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Circle Progress (Dots) */}
              <div className="grid grid-cols-5 gap-1 mt-4">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full ${index < totalCourses ? 'bg-gradient-to-r from-violet-500 to-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Time Spent */}
        <div className="relative group transform transition-all duration-300 hover:scale-[1.02]">
          {/* Frosted glass background */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] rounded-xl blur opacity-50 group-hover:opacity-80 transition duration-300"></div>

          <div className="relative h-[320px] p-4 rounded-xl bg-white dark:bg-gray-800 backdrop-blur-lg bg-opacity-30 dark:bg-opacity-40">
            <div className="flex flex-col h-full">
              {/* Header with navigation */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-300">{t("Time Spent")}</div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePrev}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    disabled={currentDateIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleNext}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    disabled={currentDateIndex >= timeSpentData.length - 7}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chart */}
              <div className="flex-1 flex items-end gap-4 px-2">
                {visibleDates.length > 0 ? (
                  visibleDates.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      {item.minutes > 0 ? (
                        <div className="relative group/bar">
                          <div 
                            className={`w-full rounded-sm transition-all duration-300 hover:opacity-80 ${
                              isToday(item.date) ? 'bg-blue-500' : index % 2 === 0 ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                            style={{ 
                              height: `${Math.max(Math.min(item.minutes * 2.0, 200), 20)}px`,
                              minWidth: '20px'
                            }}
                          />
                          {/* Timing tooltip on hover */}
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200">
                            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-md">
                              <Clock className="w-3 h-3" />
                              {Math.floor(item.minutes / 60)}{t("hours")} {item.minutes % 60}{t("minutes")}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-20 bg-gray-100 dark:bg-gray-700 rounded-sm" style={{ minWidth: '20px' }}></div>
                      )}
                      <div className="mt-2 text-center">
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          {format(item.date, 'd MMM')}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center text-gray-500">{t("No time data available")}</div>
                )}
              </div>

              <div className="h-5"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default WelcomeBanner;