"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import { Progress } from "@/components/ui/progress";

function CourseIntroCard({ course }) {
    const { user } = useUser();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (user?.primaryEmailAddress?.emailAddress && course?.courseId) {
            fetchProgress();
        }
    }, [user, course]);

    const fetchProgress = async () => {
        try {
            // Fetch study materials progress
            const progressResponse = await axios.get(`/api/study-progress?courseId=${course.courseId}&userId=${user?.primaryEmailAddress?.emailAddress}`);
            
            // Fetch quiz results
            const quizResponse = await axios.post('/api/quiz/get-result', {
                courseId: course.courseId,
                userId: user?.primaryEmailAddress?.emailAddress
            });

            // Calculate overall progress
            const progressData = progressResponse.data.progress || [];
            const notesProgress = progressData.find(p => p.type === 'notes')?.currentPosition || 0;
            const notesTotal = progressData.find(p => p.type === 'notes')?.totalItems || 1;
            const flashcardProgress = progressData.find(p => p.type === 'flashcard')?.currentPosition || 0;
            const flashcardTotal = progressData.find(p => p.type === 'flashcard')?.totalItems || 1;
            
            const quizScore = quizResponse.data.result ? 
                (quizResponse.data.result.score / quizResponse.data.result.totalQuestions) * 100 : 0;

            // Calculate average progress (notes, flashcards, and quiz)
            const notesPercentage = (notesProgress / notesTotal) * 100;
            const flashcardPercentage = (flashcardProgress / flashcardTotal) * 100;
            const overallProgress = Math.round((notesPercentage + flashcardPercentage + quizScore) / 3);
            
            setProgress(overallProgress);
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    };

    const getEmoji = () => {
        const title = course?.courseLayout?.courseTitle?.toLowerCase() || '';
        const summary = course?.courseLayout?.courseSummary?.toLowerCase() || '';
        const content = title + ' ' + summary;

        if (content.includes('math') || content.includes('calculus') || content.includes('algebra')) {
            return '🧮';
        } else if (content.includes('science') || content.includes('physics') || content.includes('chemistry')) {
            return '🔬';
        } else if (content.includes('programming') || content.includes('coding') || content.includes('software')) {
            return '💻';
        } else if (content.includes('language') || content.includes('english') || content.includes('writing')) {
            return '📚';
        } else if (content.includes('history') || content.includes('geography')) {
            return '🌍';
        } else if (content.includes('art') || content.includes('music')) {
            return '🎨';
        } else if (content.includes('business') || content.includes('economics')) {
            return '📊';
        } else if (content.includes('health') || content.includes('medical')) {
            return '🧬';
        } else {
            return '📖';
        }
    };

    const getProgressColor = (value) => {
        if (value >= 80) return 'from-green-500 to-green-600';
        if (value >= 60) return 'from-yellow-500 to-yellow-600';
        return 'from-red-500 to-red-600';
    };

    return (
        <div className="bg-gradient-to-r from-[#CAD5FF] via-[#D8CAFF] to-[#F0D5FF] dark:from-[#2C2C6D] dark:via-[#3B3B8F] dark:to-[#4F4F99] rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-6">
                <div className="text-5xl">{getEmoji()}</div>
                <div className="flex-1">
                    <h2 className="font-bold text-2xl md:text-3xl text-gray-900 dark:text-white">
                        {course?.courseLayout?.courseTitle}
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                        {course?.courseLayout?.courseSummary}
                    </p>
                </div>
            </div>

            {/* Progress Section */}
            <div className="mt-6 p-4 bg-gradient-to-r from-[#CAD5FF] via-[#D8CAFF] to-[#F0D5FF] dark:from-[#2C2C6D] dark:via-[#3B3B8F] dark:to-[#4F4F99] rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Overall Progress</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{progress}%</span>
                </div>
                <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`absolute h-full bg-gradient-to-r ${getProgressColor(progress)} transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Chapters</div>
                    <div className="font-semibold text-xl text-gray-900 dark:text-white mt-2">
                        {course?.courseLayout?.chapters?.length}
                    </div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Difficulty</div>
                    <div className="font-semibold text-xl text-gray-900 dark:text-white mt-2">
                        {course?.difficultyLevel}
                    </div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</div>
                    <div className="font-semibold text-xl text-gray-900 dark:text-white mt-2">
                        {course?.courseType}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseIntroCard;