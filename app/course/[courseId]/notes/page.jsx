"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Pause, Play, Download, ChevronLeft, CheckCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import html2pdf from 'html2pdf.js';
import { toast } from 'sonner';

function ViewNotes() {
    const { courseId } = useParams();
    const router = useRouter();
    const { user } = useUser();
    const [notes, setNotes] = useState([]);
    const [course, setCourse] = useState(null);
    const [isReading, setIsReading] = useState(false);
    const [currentChapter, setCurrentChapter] = useState(null);
    const [completedChapters, setCompletedChapters] = useState(new Set());
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    const [voices, setVoices] = useState([]);

    useEffect(() => {
        if (synth) {
            const loadVoices = () => setVoices(synth.getVoices());
            synth.addEventListener('voiceschanged', loadVoices);
            return () => synth.removeEventListener('voiceschanged', loadVoices);
        }
    }, []);

    useEffect(() => {
        GetNotes();
        GetCourse();
    }, []);

    const GetNotes = async () => {
        try {
            const result = await axios.post('/api/study-type', {
                courseId: courseId,
                studyType: 'notes'
            });
            // Clean the notes by removing ```html tags
            const cleanedNotes = result.data.map(note => ({
                ...note,
                notes: note.notes.replace(/```html|```/g, '')
            }));
            setNotes(cleanedNotes);
            updateProgress(0);
        } catch (error) {
            console.error('Error fetching notes:', error);
            toast.error('Failed to fetch notes');
        }
    };

    const GetCourse = async () => {
        try {
            const result = await axios.get(`/api/courses?courseId=${courseId}`);
            setCourse(result.data.result);
        } catch (error) {
            console.error('Error fetching course:', error);
            toast.error('Failed to fetch course details');
        }
    };

    const generatePDF = async () => {
        try {
            if (!course || !notes.length) {
                toast.error('Course data not available');
                return;
            }

            toast.loading('Generating PDF...');
            const element = document.createElement('div');
            element.style.padding = '20px';
            element.style.background = 'white';

            // Create a temporary container for each chapter
            notes.forEach((note, index) => {
                const chapterDiv = document.createElement('div');
                chapterDiv.style.pageBreakAfter = 'always';
                chapterDiv.style.marginBottom = '30px';

                // Add chapter title
                const titleDiv = document.createElement('h2');
                titleDiv.style.fontSize = '24px';
                titleDiv.style.marginBottom = '20px';
                titleDiv.style.color = '#000';
                titleDiv.textContent = `Chapter ${index + 1}: ${course?.courseLayout?.chapters[index]?.chapterTitle || ''}`;
                chapterDiv.appendChild(titleDiv);

                // Add chapter content
                const contentDiv = document.createElement('div');
                contentDiv.style.fontSize = '14px';
                contentDiv.style.lineHeight = '1.6';
                contentDiv.style.color = '#000';
                
                let cleanContent = note.notes;
                cleanContent = stripHtml(cleanContent);
                cleanContent = cleanContent.replace(/```/g, '');
                cleanContent = removeEmojis(cleanContent);
                
                contentDiv.textContent = cleanContent;
                chapterDiv.appendChild(contentDiv);
                
                element.appendChild(chapterDiv);
            });

            const opt = {
                margin: 20,
                filename: `${course?.courseLayout?.courseTitle || 'Course'}_Notes.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(element).save();
            toast.success('PDF generated successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF');
        }
    };

    const stripHtml = (htmlText) => {
        const doc = new DOMParser().parseFromString(htmlText, 'text/html');
        return doc.body.textContent || '';
    };

    const removeEmojis = (text) => {
        return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
    };

    const detectLanguage = (text) => {
        // Enhanced language detection based on character sets
        const hasTamil = /[\u0B80-\u0BFF]/.test(text);
        const hasMalayalam = /[\u0D00-\u0D7F]/.test(text);
        const hasJapanese = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text);
        const hasKorean = /[\uAC00-\uD7AF\u1100-\u11FF]/.test(text);
        const hasChinese = /[\u4E00-\u9FFF]/.test(text);
        const hasThai = /[\u0E00-\u0E7F]/.test(text);
        const hasArabic = /[\u0600-\u06FF]/.test(text);
        const hasHindi = /[\u0900-\u097F]/.test(text);
        
        if (hasTamil) return 'ta-IN';
        if (hasMalayalam) return 'ml-IN';
        if (hasJapanese) return 'ja-JP';
        if (hasKorean) return 'ko-KR';
        if (hasChinese) return 'zh-CN';
        if (hasThai) return 'th-TH';
        if (hasArabic) return 'ar-SA';
        if (hasHindi) return 'hi-IN';
        
        return 'en-US'; // Default to English
    };

    const readText = (text, chapterIndex) => {
        if (!text) return;
        
        // If already reading this chapter, stop it
        if (isReading && currentChapter === chapterIndex) {
            stopReading();
            return;
        }
        
        // Stop any ongoing speech
        stopReading();
        
        // Clean the text
        let cleanText = stripHtml(text);
        cleanText = cleanText.replace(/```/g, '');
        cleanText = removeEmojis(cleanText);
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Detect language
        const detectedLang = detectLanguage(cleanText);
        utterance.lang = detectedLang;
        
        // Find a voice that matches the detected language
        const voices = window.speechSynthesis.getVoices();
        let voice;
        
        // Try to find a voice for the specific language and region
        voice = voices.find(v => v.lang === detectedLang);
        
        // If no specific voice found, try to find a voice that starts with the language code
        if (!voice) {
            const langCode = detectedLang.split('-')[0];
            voice = voices.find(v => v.lang.startsWith(langCode));
        }
        
        // Fallback to any available voice if no matching voice found
        if (!voice) {
            voice = voices[0];
        }
        
        if (voice) {
            utterance.voice = voice;
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
        }
        
        utterance.onend = () => {
            setIsReading(false);
            setCurrentChapter(null);
        };
        
        setIsReading(true);
        setCurrentChapter(chapterIndex);
        window.speechSynthesis.speak(utterance);
    };

    const stopReading = () => {
        if (synth) {
            synth.cancel();
            setIsReading(false);
            setCurrentChapter(null);
        }
    };

    const handleCompleteChapter = async (index) => {
        const newCompletedChapters = new Set(completedChapters);
        newCompletedChapters.add(index);
        setCompletedChapters(newCompletedChapters);
        await updateProgress(newCompletedChapters.size);
        
        // Show next chapter if available
        if (index < notes.length - 1) {
            toast.success('Chapter completed! Moving to next chapter.');
        } else {
            toast.success('Congratulations! You\'ve completed all chapters.');
        }
    };

    const updateProgress = async (currentPosition) => {
        try {
            await axios.post('/api/study-progress', {
                courseId,
                userId: user?.primaryEmailAddress?.emailAddress,
                type: 'notes',
                currentPosition: currentPosition,
                totalItems: notes?.length || 0
            });
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#CAD5FF] via-[#D8CAFF] to-[#F0D5FF] dark:from-[#2C2C6D] dark:via-[#3B3B8F] dark:to-[#4F4F99] p-6 mb-8">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                            Course Notes
                        </h1>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">
                            Study and review your course materials
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={generatePDF}
                            className="relative group overflow-hidden bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white hover:shadow-lg transition-all duration-300"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-[#E5DBFF]/80 via-[#F0D5FF]/80 to-[#F7E6FF]/80 dark:from-[#4B47B3]/50 dark:via-[#635AE5]/50 dark:to-[#8E5AED]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <Download className="w-5 h-5 mr-2" />
                            <span className="relative">Generate PDF</span>
                        </Button>
                        <Button
                            onClick={() => router.push(`/course/${courseId}`)}
                            className="relative group overflow-hidden bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white hover:shadow-lg transition-all duration-300"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-[#E5DBFF]/80 via-[#F0D5FF]/80 to-[#F7E6FF]/80 dark:from-[#4B47B3]/50 dark:via-[#635AE5]/50 dark:to-[#8E5AED]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <ChevronLeft className="w-5 h-5 mr-2" />
                            <span className="relative">Back to Course</span>
                        </Button>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Notes Content */}
            <div id="notes-content" className="space-y-6">
                {notes?.map((note, index) => (
                    <div
                        key={index}
                        className={`relative group transform transition-all duration-300 hover:scale-[1.01] ${
                            index > completedChapters.size ? 'opacity-50 pointer-events-none' : ''
                        }`}
                        style={{ pageBreakAfter: 'always' }}
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                        <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                            {/* Chapter Header */}
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Chapter {index + 1}
                                </h2>
                                {/* Action Buttons - Now with class for PDF exclusion */}
                                <div className="action-buttons flex gap-2">
                                    <Button
                                        onClick={() => readText(note.notes, index)}
                                        className={`relative group overflow-hidden ${
                                            isReading && currentChapter === index
                                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                                : 'bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-gray-900 dark:text-white'
                                        } hover:shadow-lg transition-all duration-300`}
                                    >
                                        <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <span className="relative flex items-center">
                                            {isReading && currentChapter === index ? (
                                                <>
                                                    <Pause className="w-4 h-4 mr-2" />
                                                    Stop Reading
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-4 h-4 mr-2" />
                                                    Read Text
                                                </>
                                            )}
                                        </span>
                                    </Button>
                                    {!completedChapters.has(index) && index <= completedChapters.size && (
                                        <Button
                                            onClick={() => handleCompleteChapter(index)}
                                            className="relative group overflow-hidden bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transition-all duration-300"
                                        >
                                            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <span className="relative flex items-center">
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Complete Chapter
                                            </span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Notes Content - Added class for PDF styling */}
                            <div 
                                className="prose dark:prose-invert max-w-none chapter-content"
                                dangerouslySetInnerHTML={{ __html: note.notes }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ViewNotes;