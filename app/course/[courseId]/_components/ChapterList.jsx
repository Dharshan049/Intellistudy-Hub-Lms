import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function ChapterList({ course }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const CHAPTERS = course?.courseLayout?.chapters;
    const chapterListRef = useRef(null);

    const handleExpand = () => {
        setIsExpanded(!isExpanded);
        // If expanding, scroll after a small delay to allow animation to start
        if (!isExpanded) {
            setTimeout(() => {
                chapterListRef.current?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    };

    return (
        <div className='relative mt-5' ref={chapterListRef}>
            {/* Gradient Button to Toggle Chapter List */}
            <button
                onClick={handleExpand}
                className="w-full relative group overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02]"
            >
                {/* Button Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#CAD5FF] via-[#D8CAFF] to-[#F0D5FF] dark:from-[#2C2C6D] dark:via-[#3B3B8F] dark:to-[#4F4F99] opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Button Content */}
                <div className="relative px-6 py-4 flex items-center justify-between">
                    <h2 className='font-medium text-xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent'>
                        Chapters
                    </h2>
                    <div className="transform transition-transform duration-300">
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        )}
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </button>

            {/* Chapter List */}
            <div className={`mt-3 transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#CAD5FF] via-[#D8CAFF] to-[#F0D5FF] dark:from-[#2C2C6D] dark:via-[#3B3B8F] dark:to-[#4F4F99]"></div>

                    {CHAPTERS?.map((chapter, index) => (
                        <div 
                            key={index}
                            className={`relative flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} mb-8`}
                        >
                            {/* Timeline Dot */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-[#CAD5FF] to-[#F0D5FF] dark:from-[#4B47B3] dark:to-[#8E5AED] shadow-lg z-10"></div>

                            {/* Chapter Card */}
                            <div 
                                className={`relative group transform transition-all duration-300 hover:scale-[1.02] cursor-pointer w-[calc(50%-40px)]`}
                            >
                                {/* Card Background Gradient */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                
                                {/* Card Content */}
                                <div className="relative flex gap-5 items-center p-5 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
                                    <div className="text-2xl transform group-hover:scale-110 transition-transform duration-300">
                                        {chapter?.emoji}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="font-medium text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:via-gray-800 group-hover:to-gray-900 dark:group-hover:from-white dark:group-hover:via-gray-200 dark:group-hover:to-white">
                                            {chapter?.chapterTitle}
                                        </h2>
                                        <p className="text-gray-500 dark:text-gray-300 text-sm mt-1">
                                            {chapter?.chapterSummary}
                                        </p>
                                    </div>

                                    {/* Decorative Corner Elements */}
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-tr-xl"></div>
                                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tl from-white/5 to-transparent rounded-bl-xl"></div>
                                </div>

                                {/* Connection Line */}
                                <div className={`absolute top-1/2 ${index % 2 === 0 ? 'right-0 translate-x-[40px]' : 'left-0 -translate-x-[40px]'} -translate-y-1/2 w-[40px] h-0.5 bg-gradient-to-${index % 2 === 0 ? 'r' : 'l'} from-[#CAD5FF] to-[#F0D5FF] dark:from-[#4B47B3] dark:to-[#8E5AED]`}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ChapterList;