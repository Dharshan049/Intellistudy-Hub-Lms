"use client";

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Trash2, Loader } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";

function CourseCardItem({ course, userRole, onDelete }) {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(course.isGenerating || false); // Set initial state based on course status
  const { user } = useUser();

  useEffect(() => {
    // Retrieve the selected language from localStorage
    const savedLanguage = localStorage.getItem("language") || "en";
    setSelectedLanguage(savedLanguage);

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
      setIsGenerating(false); // Set generating to false after fetching progress
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const getProgressColor = (value) => {
    if (value >= 80) return 'from-green-500 to-green-600';
    if (value >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const handleDelete = async () => {
    try {
      await axios.post('/api/delete-course', {
        courseId: course.courseId
      });
      toast.success('Course deleted successfully');
      if (onDelete) onDelete(course.courseId);
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
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

  return (
    <>
      <Link href={`/course/${course.courseId}`}>
        <div className={`relative group transform transition-all duration-300 hover:scale-[1.02] ${isGenerating ? 'animate-pulse' : ''}`}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative h-full bg-gradient-to-br from-white via-[#B3D4FF] to-[#D3A4FF] dark:from-[#2A2D64] dark:via-[#4B47B3] dark:to-[#6D3ACD] rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{getEmoji()}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-xl text-gray-900 dark:text-white">
                  {course?.courseLayout?.courseTitle}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                  {course?.courseLayout?.courseSummary}
                </p>
              </div>
            </div>

            {/* Progress Section */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Progress</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{progress}%</span>
              </div>
              <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`absolute h-full bg-gradient-to-r ${getProgressColor(progress)} transition-all duration-300`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {course?.difficultyLevel}
                </div>
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {course?.courseType}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                onClick={(e) => {
                  e.preventDefault();
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </Link>

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
    </>
  );
}

export default CourseCardItem;