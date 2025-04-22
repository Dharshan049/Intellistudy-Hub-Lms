'use client';

import React, { useState, useEffect } from 'react';
import SelectOption from './_components/SelectOption';
import { Button } from '@/components/ui/button';
import TopicInput from './_components/TopicInput';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Chatbot from '../dashboard/_components/Chatbot';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Globe } from 'lucide-react';

function Create() {
    const [step, setStep] = useState(1);
    const [studyType, setStudyType] = useState();
    const [topic, setTopic] = useState();
    const [difficultyLevel, setDifficultyLevel] = useState();
    const [language, setLanguage] = useState('English');
    const { user } = useUser();
    const router = useRouter();
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.primaryEmailAddress?.emailAddress) {
            getUserRole();
        }
    }, [user]);

    const getUserRole = async () => {
        try {
            const response = await axios.post('/api/get-user-role', {
                email: user.primaryEmailAddress.emailAddress
            });
            setUserRole(response.data.role.toLowerCase());
        } catch (error) {
            console.error('Error fetching user role:', error);
            setUserRole('user');
        }
    };

    const handleUserInput = (fieldName, fieldValue) => {
        if (fieldName === 'studyType') setStudyType(fieldValue);
        if (fieldName === 'topic') setTopic(fieldValue);
        if (fieldName === 'difficultyLevel') setDifficultyLevel(fieldValue);
        if (fieldName === 'language') setLanguage(fieldValue);
    };

    const GenerateCourseOutline = async () => {
        try {
            const courseId = Math.random().toString(36).substring(7);
            
            // Set the course as generating
            setLoading(true);

            const result = await axios.post('/api/generate-course-outline', {
                courseId: courseId,
                topic: topic,
                studyType: studyType,
                difficultyLevel: difficultyLevel,
                language: language,
                createdBy: user?.primaryEmailAddress?.emailAddress
            });

            toast.success('Course created successfully!');

            // Redirect based on user role
            if (document.referrer.includes('/admin')) {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Error generating course:', error);
            toast.error('Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    const languages = [
        { label: "English", code: "en" },
        { label: "Tamil", code: "ta" },
        { label: "Malayalam", code: "ml" },
        { label: "Telugu", code: "te" },
        { label: "Kannada", code: "kn" },
        { label: "Hindi", code: "hi" },
        { label: "Spanish", code: "es" },
        { label: "French", code: "fr" },
        { label: "German", code: "de" },
        { label: "Chinese", code: "zh" }
    ];

    return (
        <div className="flex flex-col items-center p-5 md:px-24 lg:px-36 mt-20 bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
            <div className="w-full max-w-4xl">
                <h2 className="text-center text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent mb-4">
                    Start Building Your Personal Study Material
                </h2>
                <p className="text-center text-lg text-gray-600 dark:text-gray-300 mb-10">
                    Create customized learning content tailored to your needs
                </p>

                <div className="w-full">
                    {step === 1 ? (
                        <SelectOption 
                            selectedStudyType={(value) => handleUserInput('studyType', value)} 
                            setStep={setStep}
                        />
                    ) : (
                        <div className="space-y-8">
                            <TopicInput
                                setTopic={(value) => handleUserInput('topic', value)}
                                setDifficultyLevel={(value) => handleUserInput('difficultyLevel', value)}
                            />

                            {/* Language Selection */}
                            <div className="w-full max-w-3xl mx-auto p-8 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg border border-white/20 dark:border-white/10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Globe className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                                    <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                                        Select Language
                                    </h2>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                    Choose your preferred language for the study material
                                </p>
                                <Select 
                                    value={language}
                                    onValueChange={(value) => handleUserInput('language', value)}
                                >
                                    <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400">
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {languages.map((lang) => (
                                            <SelectItem 
                                                key={lang.code} 
                                                value={lang.label}
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                {lang.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Generate Button */}
                            <div className="flex justify-center mt-8">
                                <Button
                                    onClick={GenerateCourseOutline}
                                    disabled={!topic || !difficultyLevel}
                                    className={`relative group overflow-hidden px-8 py-6 rounded-xl transition-all duration-300 transform
                                        ${!topic || !difficultyLevel ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl cursor-pointer'}
                                        bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] 
                                        dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED]
                                        hover:from-[#D1C6FF] hover:via-[#E5C6FF] hover:to-[#F0D1FF]
                                        dark:hover:from-[#5B57C3] dark:hover:via-[#736AF5] dark:hover:to-[#9E6AFD]
                                        border border-white/20 dark:border-white/10`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <span className="relative flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                                        {loading ? (
                                            <>
                                                <Loader className="animate-spin h-5 w-5" />
                                                Generating...
                                            </>
                                        ) : (
                                            'Generate Course'
                                        )}
                                    </span>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Chatbot />
        </div>
    );
}

export default Create;