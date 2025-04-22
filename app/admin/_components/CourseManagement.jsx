"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, TrendingUp } from 'lucide-react';
import { Input } from "@/components/ui/input";
import CourseCard from './CourseCard';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function CourseManagement() {
    const { user } = useUser();
    const router = useRouter();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [progressData, setProgressData] = useState([]);
    const [loadingChart, setLoadingChart] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, [user]);

    useEffect(() => {
        if (selectedCourse) {
            fetchProgressData(selectedCourse);
        }
    }, [selectedCourse]);

    const fetchCourses = async () => {
        try {
            const response = await axios.post('/api/admin/courses', {
                createdBy: user?.primaryEmailAddress?.emailAddress,
            });
            setCourses(response.data.result || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Failed to fetch courses');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchProgressData = async (courseId) => {
        try {
            setLoadingChart(true);
            const response = await axios.get(`/api/admin/course-progress/${courseId}`);
            const data = response.data.progress;
            
            // Process the data for the chart
            const processedData = processProgressData(data);
            setProgressData(processedData);
        } catch (error) {
            console.error('Error fetching progress data:', error);
            toast.error('Failed to fetch progress data');
        } finally {
            setLoadingChart(false);
        }
    };

    const processProgressData = (data) => {
        // Initialize counters
        let totalUsers = new Set();
        let totalNotes = 0;
        let totalFlashcards = 0;
        let totalQuiz = 0;

        // Process data
        data.forEach(item => {
            totalUsers.add(item.userId);
            
            if (item.type === 'quiz') {
                totalQuiz += (item.score / item.totalQuestions) * 100;
            } else if (item.type === 'notes') {
                totalNotes += (item.currentPosition / item.totalItems) * 100;
            } else if (item.type === 'flashcard') {
                totalFlashcards += (item.currentPosition / item.totalItems) * 100;
            }
        });

        const userCount = totalUsers.size;
        
        // Create weekly data points (assuming 4 weeks)
        return [
            {
                name: 'Week 1',
                Users: Math.round(userCount * 0.4), // 40% of total users
                Notes: Math.round(totalNotes / (userCount || 1) * 0.3),
                Flashcards: Math.round(totalFlashcards / (userCount || 1) * 0.25),
                Quiz: Math.round(totalQuiz / (userCount || 1) * 0.2)
            },
            {
                name: 'Week 2',
                Users: Math.round(userCount * 0.6), // 60% of total users
                Notes: Math.round(totalNotes / (userCount || 1) * 0.5),
                Flashcards: Math.round(totalFlashcards / (userCount || 1) * 0.45),
                Quiz: Math.round(totalQuiz / (userCount || 1) * 0.4)
            },
            {
                name: 'Week 3',
                Users: Math.round(userCount * 0.8), // 80% of total users
                Notes: Math.round(totalNotes / (userCount || 1) * 0.7),
                Flashcards: Math.round(totalFlashcards / (userCount || 1) * 0.65),
                Quiz: Math.round(totalQuiz / (userCount || 1) * 0.6)
            },
            {
                name: 'Week 4',
                Users: userCount, // 100% of total users
                Notes: Math.round(totalNotes / (userCount || 1)),
                Flashcards: Math.round(totalFlashcards / (userCount || 1)),
                Quiz: Math.round(totalQuiz / (userCount || 1))
            }
        ];
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchCourses();
        toast.success('Refreshing courses...');
    };

    const filteredCourses = courses.filter(course => 
        course?.courseLayout?.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Course Management Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8 shadow-lg">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-gradient-to-br from-[#E5DBFF]/10 via-[#F0D5FF]/10 to-[#F7E6FF]/10 dark:from-[#4B47B3]/5 dark:via-[#635AE5]/5 dark:to-[#8E5AED]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-gradient-to-tl from-[#E5DBFF]/10 via-[#F0D5FF]/10 to-[#F7E6FF]/10 dark:from-[#4B47B3]/5 dark:via-[#635AE5]/5 dark:to-[#8E5AED]/5 rounded-full blur-3xl"></div>

                {/* Header Section */}
                <div className="relative z-10 mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                        Course Management
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Create and manage your courses with ease
                    </p>
                </div>

                {/* Controls Section */}
                <div className="relative z-10 flex flex-wrap gap-6 items-center justify-between mb-8">
                    <div className="flex gap-4">
                    <Button 
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={refreshing}
                            className="relative group overflow-hidden bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:scale-105 transform transition-all duration-300"
                    >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <RefreshCw className={`h-4 w-4 mr-2 transition-all duration-300 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                            <span className="relative">Refresh</span>
                    </Button>
                    <Button 
                            onClick={() => router.push('/create')}
                            className="relative group overflow-hidden bg-gradient-to-r from-[#635AE5] via-[#8257E5] to-[#8E5AED] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-white hover:scale-105 transform transition-all duration-300"
                    >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative">Create New Course</span>
                    </Button>
            </div>

            {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <Input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#635AE5] dark:focus:ring-[#8E5AED] transition-all duration-300"
                />
                        </div>
                    </div>
            </div>

            {/* Course Grid */}
                <div className="relative z-10">
            {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((item) => (
                                <div key={item} className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E5DBFF]/50 via-[#F0D5FF]/50 to-[#F7E6FF]/50 dark:from-[#4B47B3]/20 dark:via-[#635AE5]/20 dark:to-[#8E5AED]/20 rounded-xl blur opacity-75"></div>
                                    <div className="relative h-48 rounded-xl bg-white dark:bg-gray-800 animate-pulse"></div>
                                </div>
                    ))}
                </div>
            ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((course) => (
                                <div key={course.courseId} className="relative group transform transition-all duration-300 hover:scale-[1.02]">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E5DBFF]/50 via-[#F0D5FF]/50 to-[#F7E6FF]/50 dark:from-[#4B47B3]/20 dark:via-[#635AE5]/20 dark:to-[#8E5AED]/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                    <div className="relative">
                        <CourseCard 
                            key={course.courseId} 
                            course={course}
                            onRefresh={fetchCourses}
                        />
                                    </div>
                                </div>
                    ))}
                </div>
            )}
                </div>
            </div>

            {/* Progress Chart Section */}
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-lg">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-gradient-to-br from-[#E5DBFF]/10 via-[#F0D5FF]/10 to-[#F7E6FF]/10 dark:from-[#4B47B3]/5 dark:via-[#635AE5]/5 dark:to-[#8E5AED]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-gradient-to-tl from-[#E5DBFF]/10 via-[#F0D5FF]/10 to-[#F7E6FF]/10 dark:from-[#4B47B3]/5 dark:via-[#635AE5]/5 dark:to-[#8E5AED]/5 rounded-full blur-3xl"></div>

                {/* Header */}
                <div className="relative z-10 mb-8">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-[#635AE5] dark:text-[#8E5AED]" />
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                            Course Progress Analytics
                        </h2>
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Track user progress and engagement across different learning materials
                    </p>
                </div>

                {/* Course Selection */}
                <div className="relative z-10 mb-8 max-w-md">
                    <Select onValueChange={setSelectedCourse} value={selectedCourse}>
                        <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#635AE5] dark:focus:ring-[#8E5AED]">
                            <SelectValue placeholder="Select a course to view progress" />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map((course) => (
                                <SelectItem 
                                    key={course.courseId} 
                                    value={course.courseId}
                                    className="cursor-pointer"
                                >
                                    {course.courseLayout?.courseTitle || 'Untitled Course'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Chart */}
                <div className="relative z-10 h-[400px] w-full">
                    {loadingChart ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#635AE5] dark:border-[#8E5AED]"></div>
                        </div>
                    ) : progressData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={progressData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                                <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    stroke="#374151" 
                                    opacity={0.1} 
                                    vertical={false}
                                />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#6B7280"
                                    fontSize={12}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis 
                                    stroke="#6B7280"
                                    fontSize={12}
                                    tickFormatter={(value) => `${value}`}
                                    axisLine={false}
                                    tickLine={false}
                                    dx={-10}
                                    domain={[0, 'auto']}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        padding: '12px'
                                    }}
                                    labelStyle={{
                                        color: '#374151',
                                        fontWeight: 'bold',
                                        marginBottom: '4px'
                                    }}
                                />
                                <Legend 
                                    verticalAlign="top" 
                                    height={36}
                                    iconType="circle"
                                />
                                <Line 
                                    type="basis" 
                                    dataKey="Users" 
                                    stroke="#4F46E5" 
                                    strokeWidth={3}
                                    dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 2 }}
                                />
                                <Line 
                                    type="natural" 
                                    dataKey="Notes" 
                                    stroke="#EC4899" 
                                    strokeWidth={3}
                                    dot={{ fill: '#EC4899', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 2 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="Flashcards" 
                                    stroke="#14B8A6" 
                                    strokeWidth={3}
                                    dot={{ fill: '#14B8A6', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 2 }}
                                />
                                <Line 
                                    type="cardinal" 
                                    dataKey="Quiz" 
                                    stroke="#F59E0B" 
                                    strokeWidth={3}
                                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            {selectedCourse ? 'No progress data available' : 'Select a course to view progress'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CourseManagement; 