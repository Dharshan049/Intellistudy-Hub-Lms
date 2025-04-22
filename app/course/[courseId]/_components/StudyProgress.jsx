"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Book, Layers, BrainCircuit } from 'lucide-react';

function StudyProgress({ courseId }) {
    const { user } = useUser();
    const [progress, setProgress] = useState({
        notes: 0,
        flashcard: 0,
        quiz: 0
    });
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (user?.primaryEmailAddress?.emailAddress) {
            fetchProgress();
        }
    }, [user, courseId]);

    const fetchProgress = async () => {
        try {
            setLoading(true);
            const userId = user?.primaryEmailAddress?.emailAddress;
            const progressResponse = await axios.get(`/api/study-progress?courseId=${courseId}&userId=${userId}`);
            const progressData = progressResponse.data.progress || [];

            const quizResponse = await axios.post('/api/quiz/get-result', {
                courseId,
                userId
            });
            const quizResult = quizResponse.data.result;

            const notesProgress = progressData.find(p => p.type === 'notes');
            const flashcardProgress = progressData.find(p => p.type === 'flashcard');
            
            const newProgress = {
                notes: notesProgress ? Math.round((notesProgress.currentPosition / notesProgress.totalItems) * 100) : 0,
                flashcard: flashcardProgress ? Math.round((flashcardProgress.currentPosition / flashcardProgress.totalItems) * 100) : 0,
                quiz: quizResult ? Math.round((quizResult.score / quizResult.totalQuestions) * 100) : 0
            };
            
            setProgress(newProgress);
            
            // Create data points with independent curves
            const dataPoints = [
                {
                    name: 'Start',
                    notes: 0,
                    flashcards: 0,
                    quiz: 0
                },
                {
                    name: 'Progress 1',
                    notes: Math.round(newProgress.notes * 0.4),
                    flashcards: Math.round(newProgress.flashcard * 0.3),
                    quiz: Math.round(newProgress.quiz * 0.2)
                },
                {
                    name: 'Progress 2',
                    notes: Math.round(newProgress.notes * 0.7),
                    flashcards: Math.round(newProgress.flashcard * 0.5),
                    quiz: Math.round(newProgress.quiz * 0.6)
                },
                {
                    name: 'Progress 3',
                    notes: Math.round(newProgress.notes * 0.9),
                    flashcards: Math.round(newProgress.flashcard * 0.8),
                    quiz: Math.round(newProgress.quiz * 0.9)
                },
                {
                    name: 'Current',
                    notes: newProgress.notes,
                    flashcards: newProgress.flashcard,
                    quiz: newProgress.quiz
                }
            ];
            
            setChartData(dataPoints);
        } catch (error) {
            console.error('Error fetching progress:', error);
            toast.error('Failed to fetch progress');
        } finally {
            setLoading(false);
        }
    };

    const getProgressColor = (value) => {
        if (value >= 80) {
            return {
                fill: 'from-green-400 to-green-600',
                text: 'text-green-500',
                label: 'Excellent'
            };
        }
        if (value >= 60) {
            return {
                fill: 'from-yellow-400 to-yellow-600',
                text: 'text-yellow-500',
                label: 'Good'
            };
        }
        return {
            fill: 'from-red-400 to-red-600',
            text: 'text-red-500',
            label: 'Needs Improvement'
        };
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
        );
    }

    return (
        <div className="relative transform transition-all duration-300">
            {/* Background gradient effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] rounded-2xl blur opacity-75"></div>
            
            {/* Main content container */}
            <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                    Study Progress
                </h2>

                {/* Line Chart */}
                <div className="h-64 mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <XAxis 
                                dataKey="name" 
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis 
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}%`}
                                domain={[0, 100]}
                            />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                }}
                                labelStyle={{ color: '#666' }}
                            />
                            <Line
                                type="natural"
                                dataKey="notes"
                                stroke="#8B5CF6"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#8B5CF6' }}
                                activeDot={{ r: 8 }}
                                name="Notes"
                                connectNulls
                            />
                            <Line
                                type="natural"
                                dataKey="flashcards"
                                stroke="#3B82F6"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#3B82F6' }}
                                activeDot={{ r: 8 }}
                                name="Flashcards"
                                connectNulls
                            />
                            <Line
                                type="natural"
                                dataKey="quiz"
                                stroke="#10B981"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#10B981' }}
                                activeDot={{ r: 8 }}
                                name="Quiz"
                                connectNulls
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Progress Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Notes Progress */}
                    {progress.notes > 0 && (
                        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                                    <Book className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="font-medium">Notes</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className={getProgressColor(progress.notes).text}>{progress.notes}%</span>
                                    <span className="text-sm text-gray-500">{getProgressColor(progress.notes).label}</span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div 
                                        className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(progress.notes).fill}`}
                                        style={{ width: `${progress.notes}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Flashcard Progress */}
                    {progress.flashcard > 0 && (
                        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                    <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="font-medium">Flashcards</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className={getProgressColor(progress.flashcard).text}>{progress.flashcard}%</span>
                                    <span className="text-sm text-gray-500">{getProgressColor(progress.flashcard).label}</span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div 
                                        className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(progress.flashcard).fill}`}
                                        style={{ width: `${progress.flashcard}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quiz Progress */}
                    {progress.quiz > 0 && (
                        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                                    <BrainCircuit className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="font-medium">Quiz</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className={getProgressColor(progress.quiz).text}>{progress.quiz}%</span>
                                    <span className="text-sm text-gray-500">{getProgressColor(progress.quiz).label}</span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div 
                                        className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(progress.quiz).fill}`}
                                        style={{ width: `${progress.quiz}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* No Progress Message */}
                {!progress.notes && !progress.flashcard && !progress.quiz && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Start learning to see your progress!
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudyProgress; 