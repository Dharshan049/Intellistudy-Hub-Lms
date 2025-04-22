"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import StepProgress from "../_components/StepProgress";
import QuizCardItem from "./_components/QuizCardItem";
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Quiz() {
  const { courseId } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [quiz, setQuiz] = useState();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    GetQuiz();
  }, []);

  useEffect(() => {
    if (!showResult && quiz) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 0) {
            nextStep();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showResult, quiz, currentQuestionIndex]);

  const GetQuiz = async () => {
    try {
      const result = await axios.post('/api/study-type', {
        courseId: courseId,
        studyType: 'Quiz',
      });
      if (result.data?.content?.questions) {
        setQuiz(result.data.content);
      } else {
        console.error('Invalid quiz data structure:', result.data);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    }
  };

  const checkAnswer = (userAnswer, currentQuestion) => {
    setSelectedAnswer(userAnswer);
    setIsAnswered(true);
    if (userAnswer === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleTimeout = () => {
    nextStep();
    setTimeLeft(30);
  };

  const resetSelection = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const saveQuizResults = async () => {
    try {
      await axios.post('/api/quiz/save-result', {
        courseId,
        userId: user?.primaryEmailAddress?.emailAddress,
        score,
        totalQuestions: quiz?.questions?.length,
      });
      toast.success('Quiz results saved successfully!');
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast.error('Failed to save quiz results');
    }
  };

  const nextStep = () => {
    if (currentQuestionIndex < quiz?.questions?.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetSelection();
      setTimeLeft(30);
    } else {
      setShowResult(true);
      saveQuizResults();
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    resetSelection();
    setTimeLeft(30);
  };

  const goBackToCourse = () => {
    router.push(`/course/${courseId}`);
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-white dark:bg-gray-900">
      {!showResult ? (
        <div className="max-w-4xl mx-auto">
          {/* Progress and Timer Section */}
          <div className="mb-8 space-y-4">
            {/* Quiz Progress */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Question {currentQuestionIndex + 1} of {quiz?.questions?.length}
              </span>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {timeLeft}s
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] rounded-full blur opacity-75"></div>
              <div
                className="relative h-full bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / quiz?.questions?.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Quiz Card */}
          <QuizCardItem
            quiz={quiz?.questions[currentQuestionIndex]}
            userSelectedOption={(option) =>
              checkAnswer(option, quiz?.questions[currentQuestionIndex])
            }
            isAnswered={isAnswered}
          />

          {/* Navigation Button */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={nextStep}
              disabled={!isAnswered}
              className="relative group overflow-hidden px-8 py-3 rounded-xl bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-gray-900 dark:text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">
                {currentQuestionIndex === quiz?.questions?.length - 1
                  ? 'Finish Quiz'
                  : 'Next Question'}
              </span>
            </Button>
          </div>
        </div>
      ) : (
        // Quiz Completion Screen
        <div className="max-w-2xl mx-auto mt-10">
          <div className="relative transform transition-all duration-300">
            {/* Background gradient effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] rounded-2xl blur opacity-75"></div>
            
            {/* Content container */}
            <div className="relative bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl">
              {/* Success icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Score display */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                  Quiz Completed!
                </h2>
                <div className="inline-block bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] p-6 rounded-2xl">
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {Math.round((score / quiz?.questions?.length) * 100)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {score} out of {quiz?.questions?.length} correct
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={restartQuiz}
                  className="relative group overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-gray-900 dark:text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative">Try Again</span>
                </Button>
                <Button
                  onClick={goBackToCourse}
                  className="relative group overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-gray-900 dark:text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Course
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quiz;