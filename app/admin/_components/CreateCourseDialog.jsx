import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { BookOpen, Gauge, Sparkles } from 'lucide-react';

function CreateCourseDialog({ open, onClose, onSuccess }) {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        topic: '',
        studyType: '',
        difficultyLevel: '',
        language: 'English'
    });

    const handleSubmit = async () => {
        if (!formData.topic || !formData.studyType || !formData.difficultyLevel) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const courseId = uuidv4();
            await axios.post('/api/generate-course-outline', {
                courseId: courseId,
                ...formData,
                createdBy: user?.primaryEmailAddress?.emailAddress,
            });
            toast.success('Course creation started');
            onSuccess();
        } catch (error) {
            console.error('Error creating course:', error);
            toast.error('Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-gray-800 border-0 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-48 h-48 bg-gradient-to-br from-[#E5DBFF]/50 via-[#F0D5FF]/50 to-[#F7E6FF]/50 dark:from-[#4B47B3]/30 dark:via-[#635AE5]/30 dark:to-[#8E5AED]/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-48 h-48 bg-gradient-to-tr from-[#E5DBFF]/50 via-[#F0D5FF]/50 to-[#F7E6FF]/50 dark:from-[#4B47B3]/30 dark:via-[#635AE5]/30 dark:to-[#8E5AED]/30 rounded-full blur-3xl"></div>

                <DialogHeader className="relative z-10 text-center pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-6 h-6 text-gray-800 dark:text-white" />
                    </div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                        Create New Course
                    </DialogTitle>
                </DialogHeader>

                <div className="relative z-10 space-y-6 py-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <BookOpen className="w-4 h-4 text-[#635AE5] dark:text-[#8E5AED]" />
                                Course Topic
                            </label>
                            <Input
                                placeholder="Enter course topic"
                                value={formData.topic}
                                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#635AE5] dark:focus:ring-[#8E5AED] transition-all duration-300"
                            />
                            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] opacity-0 group-focus-within:opacity-20 rounded-lg transition-opacity duration-300" />
                        </div>

                        <div className="relative group">
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <BookOpen className="w-4 h-4 text-[#635AE5] dark:text-[#8E5AED]" />
                                Study Type
                            </label>
                            <Select
                                value={formData.studyType}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, studyType: value }))}
                            >
                                <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#635AE5] dark:focus:ring-[#8E5AED] transition-all duration-300">
                                    <SelectValue placeholder="Select study type" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <SelectItem value="Exam" className="hover:bg-gray-100 dark:hover:bg-gray-700">Exam</SelectItem>
                                    <SelectItem value="Job Interview" className="hover:bg-gray-100 dark:hover:bg-gray-700">Job Interview</SelectItem>
                                    <SelectItem value="Practice" className="hover:bg-gray-100 dark:hover:bg-gray-700">Practice</SelectItem>
                                    <SelectItem value="Other" className="hover:bg-gray-100 dark:hover:bg-gray-700">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="relative group">
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Gauge className="w-4 h-4 text-[#635AE5] dark:text-[#8E5AED]" />
                                Difficulty Level
                            </label>
                            <Select
                                value={formData.difficultyLevel}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, difficultyLevel: value }))}
                            >
                                <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#635AE5] dark:focus:ring-[#8E5AED] transition-all duration-300">
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <SelectItem value="Easy" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            Easy
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="Medium" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                            Medium
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="Hard" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            Hard
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button 
                        className="w-full relative group overflow-hidden bg-gradient-to-r from-[#635AE5] via-[#8257E5] to-[#8E5AED] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-white hover:scale-[1.02] transform transition-all duration-300"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative flex items-center gap-2">
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Create Course
                                </>
                            )}
                        </span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default CreateCourseDialog;