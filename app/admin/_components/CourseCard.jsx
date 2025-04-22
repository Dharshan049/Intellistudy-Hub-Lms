"use client";

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import PublishDialog from './PublishDialog';
import PublishedUsersDialog from './PublishedUsersDialog';
import axios from 'axios';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

function CourseCard({ course, onRefresh }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const [showPublishedUsersDialog, setShowPublishedUsersDialog] = useState(false);
    const [progress, setProgress] = useState({
        notes: 0,
        flashcard: 0,
        quiz: 0,
        overall: 0
    });

    useEffect(() => {
        fetchCourseProgress();
    }, []);

    const fetchCourseProgress = async () => {
        try {
            const response = await axios.get(`/api/admin/course-progress/${course.courseId}`);
            const progressData = response.data.progress;

            // Calculate average progress
            let totalNotes = 0, totalFlashcards = 0, totalQuiz = 0;
            let countNotes = 0, countFlashcards = 0, countQuiz = 0;

            progressData.forEach(item => {
                if (item.type === 'notes') {
                    totalNotes += (item.currentPosition / item.totalItems) * 100;
                    countNotes++;
                } else if (item.type === 'flashcard') {
                    totalFlashcards += (item.currentPosition / item.totalItems) * 100;
                    countFlashcards++;
                } else if (item.type === 'quiz') {
                    totalQuiz += (item.score / item.totalQuestions) * 100;
                    countQuiz++;
                }
            });

            const notesProgress = countNotes ? Math.round(totalNotes / countNotes) : 0;
            const flashcardProgress = countFlashcards ? Math.round(totalFlashcards / countFlashcards) : 0;
            const quizProgress = countQuiz ? Math.round(totalQuiz / countQuiz) : 0;

            setProgress({
                notes: notesProgress,
                flashcard: flashcardProgress,
                quiz: quizProgress,
                overall: Math.round((notesProgress + flashcardProgress + quizProgress) / 3)
            });
        } catch (error) {
            console.error('Error fetching course progress:', error);
        }
    };

    const getProgressColor = (value) => {
        if (value >= 80) return 'from-green-500 to-green-600';
        if (value >= 60) return 'from-yellow-500 to-yellow-600';
        return 'from-red-500 to-red-600';
    };

    const formatDate = () => {
        const date = new Date(course.createdAt);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleDelete = async () => {
        try {
            await axios.post('/api/delete-course', {
                courseId: course.courseId
            });
            toast.success('Course deleted successfully');
            onRefresh();
        } catch (error) {
            console.error('Error deleting course:', error);
            toast.error('Failed to delete course');
        }
        setShowDeleteDialog(false);
    };

    const getEmoji = () => {
        const emojis = ['📚', '🎯', '💡', '🚀', '🎨', '🔬', '🌟', '📝'];
        const hash = course.courseId.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        return emojis[Math.abs(hash) % emojis.length];
    };

    return (
        <div className="relative group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Card Header with Gradient */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#CAD5FF] via-[#D8CAFF] to-[#F0D5FF] dark:from-[#2C2C6D] dark:via-[#3B3B8F] dark:to-[#4F4F99] p-6">
                <div className="relative z-10 flex items-start gap-4">
                    <div className="text-4xl">{getEmoji()}</div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-xl text-gray-900 dark:text-white">
                            {course?.courseLayout?.courseTitle}
                        </h3>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                            {course?.courseLayout?.courseSummary}
                        </p>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Card Body */}
            <div className="p-6">
                {/* Overall Progress */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-base font-semibold text-gray-700 dark:text-gray-300">Overall Progress</span>
                        <span className="text-base font-semibold text-gray-900 dark:text-white">{progress.overall}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#635AE5] via-[#8257E5] to-[#8E5AED] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] transition-all duration-300"
                            style={{ width: `${progress.overall}%` }}
                        />
                    </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-4">
                    {/* Notes Progress */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes Progress</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{progress.notes}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${getProgressColor(progress.notes)} transition-all duration-300`}
                                style={{ width: `${progress.notes}%` }}
                            />
                        </div>
                    </div>

                    {/* Flashcard Progress */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Flashcard Progress</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{progress.flashcard}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${getProgressColor(progress.flashcard)} transition-all duration-300`}
                                style={{ width: `${progress.flashcard}%` }}
                            />
                        </div>
                    </div>

                    {/* Quiz Progress */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Quiz Progress</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{progress.quiz}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${getProgressColor(progress.quiz)} transition-all duration-300`}
                                style={{ width: `${progress.quiz}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-4">
                    <div className="flex gap-4">
                        <Button
                            onClick={() => setShowPublishDialog(true)}
                            className="flex-1 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-gray-900 dark:text-white hover:shadow-lg transition-all duration-300"
                        >
                            Publish
                        </Button>
                        <Button
                            onClick={() => setShowPublishedUsersDialog(true)}
                            className="flex-1 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-gray-900 dark:text-white hover:shadow-lg transition-all duration-300"
                        >
                            View Published
                        </Button>
                    </div>

                    <Link 
                        href={`/course/${course.courseId}`}
                        className="block"
                    >
                        <Button className="w-full bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-gray-900 dark:text-white hover:shadow-lg transition-all duration-300">
                            View Course
                        </Button>
                    </Link>
                </div>

                {/* Course Info */}
                <div className="mt-6 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                            {course?.difficultyLevel}
                        </div>
                        <div className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                            {course?.courseType}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the course
                            and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Publish Dialog */}
            <PublishDialog
                open={showPublishDialog}
                onClose={() => setShowPublishDialog(false)}
                courseId={course.courseId}
            />

            {/* Published Users Dialog */}
            <PublishedUsersDialog
                open={showPublishedUsersDialog}
                onClose={() => setShowPublishedUsersDialog(false)}
                courseId={course.courseId}
            />
        </div>
    );
}

export default CourseCard; 