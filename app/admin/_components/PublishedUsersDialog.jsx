"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axios from 'axios';
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";

function PublishedUsersDialog({ open, onClose, courseId }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && courseId) {
            fetchPublishedUsers();
        }
        return () => {
            // Cleanup on dialog close
            setUsers([]);
            setLoading(true);
        };
    }, [open, courseId]);

    const fetchPublishedUsers = async () => {
        try {
            console.log('Fetching published users for course:', courseId);
            const response = await axios.get(`/api/admin/published-users/${courseId}`);
            console.log('Published users response:', response.data);
            
            // Remove any duplicate entries based on email
            const uniqueUsers = Array.from(new Map(
                response.data.users.map(user => [user.email, user])
            ).values());
            
            setUsers(uniqueUsers);
        } catch (error) {
            console.error('Error fetching published users:', error);
            toast.error('Failed to fetch published users');
        } finally {
            setLoading(false);
        }
    };

    const getProgressColor = (value) => {
        if (value >= 80) return "bg-green-500";
        if (value >= 60) return "bg-yellow-500";
        return "bg-red-500";
    };

    const calculateProgress = (user) => {
        const notesProgress = user.notesProgress ? Math.round((user.notesProgress.currentPosition / user.notesProgress.totalItems) * 100) : 0;
        const flashcardProgress = user.flashcardProgress ? Math.round((user.flashcardProgress.currentPosition / user.flashcardProgress.totalItems) * 100) : 0;
        const quizProgress = user.quizResult ? Math.round((user.quizResult.score / user.quizResult.totalQuestions) * 100) : 0;
        const overallProgress = Math.round((notesProgress + flashcardProgress + quizProgress) / 3);

        return {
            notes: notesProgress,
            flashcard: flashcardProgress,
            quiz: quizProgress,
            overall: overallProgress
        };
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Published Users</DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    {loading ? (
                        <div className="text-center py-4">Loading users...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">
                            No users have been published to yet
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                            {users.map((user) => {
                                const progress = calculateProgress(user);
                                return (
                                    <div 
                                        key={`${user.email}-${user.courseId}`}
                                        className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800"
                                    >
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {user.email}
                                        </div>
                                        {user.publishedBy && (
                                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                Published by: {user.publishedBy}
                                            </div>
                                        )}
                                        
                                        <div className="mt-4 space-y-3">
                                            {/* Overall Progress */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                                                    <span className="font-medium">{progress.overall}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                                        style={{ width: `${progress.overall}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Notes Progress */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-600 dark:text-gray-400">Notes</span>
                                                    <span className="font-medium">{progress.notes}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${getProgressColor(progress.notes)}`}
                                                        style={{ width: `${progress.notes}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Flashcard Progress */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-600 dark:text-gray-400">Flashcards</span>
                                                    <span className="font-medium">{progress.flashcard}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${getProgressColor(progress.flashcard)}`}
                                                        style={{ width: `${progress.flashcard}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Quiz Progress */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-600 dark:text-gray-400">Quiz</span>
                                                    <span className="font-medium">{progress.quiz}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${getProgressColor(progress.quiz)}`}
                                                        style={{ width: `${progress.quiz}%` }}
                                                    />
                                                </div>
                                                {user.quizResult && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        Completed: {new Date(user.quizResult.completedAt).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default PublishedUsersDialog; 