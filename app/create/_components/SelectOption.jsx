"use client";

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

function SelectOption({selectedStudyType, setStep}) {
    const Options = [
        {
            name: 'Academic Assessment',
            description: 'Comprehensive preparation for academic examinations and scholarly evaluations',
            icon: '/exam.svg',
        },
        {
            name: 'Professional Interview',
            description: 'Strategic preparation for career advancement opportunities',
            icon: '/job.svg',
        },
        {
            name: 'Skill Enhancement',
            description: 'Systematic approach to mastering new competencies',
            icon: '/note.svg',
        },
        {
            name: 'Technical Proficiency',
            description: 'Advanced preparation for software development and technical assessments',
            icon: '/code.svg',
        },
        {
            name: 'Specialized Learning',
            description: 'Customized learning paths for specific domains',
            icon: '/knowledge.svg',
        },
    ];
    const [selectedOption, setSelectedOption] = useState(null);

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
        selectedStudyType(option);
    };

    return (
        <div className="p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <div className="flex flex-col items-center space-y-6">
                <h2 className="text-center text-2xl font-semibold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                    Select Your Learning Pathway
                </h2>
                
                {/* Next Button */}
                <Button 
                    onClick={() => selectedOption && setStep(prevStep => prevStep + 1)}
                    disabled={!selectedOption}
                    className={`relative group overflow-hidden px-8 py-6 rounded-xl transition-all duration-300 transform
                        ${selectedOption 
                            ? 'hover:scale-105 hover:shadow-xl cursor-pointer' 
                            : 'opacity-50 cursor-not-allowed'
                        }
                        bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] 
                        dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED]
                        hover:from-[#D1C6FF] hover:via-[#E5C6FF] hover:to-[#F0D1FF]
                        dark:hover:from-[#5B57C3] dark:hover:via-[#736AF5] dark:hover:to-[#9E6AFD]
                        border border-white/20 dark:border-white/10`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center gap-2 font-semibold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-white dark:group-hover:to-gray-300">
                        Next Step
                        <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {Options.map((option, index) => (
                    <div
                        key={index}
                        className={`relative group overflow-hidden rounded-xl transition-all duration-300 cursor-pointer
                            ${option.name === selectedOption
                                ? 'ring-2 ring-offset-2 ring-violet-500 dark:ring-violet-400 scale-105'
                                : 'hover:scale-105'
                            }`}
                        onClick={() => handleOptionSelect(option.name)}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className={`relative p-6 rounded-xl transition-all duration-300 backdrop-blur-sm
                            ${option.name === selectedOption
                                ? 'bg-gradient-to-r from-[#F5F3FF] via-[#E0E7FF] to-[#FCE7F3] dark:from-blue-900/80 dark:via-indigo-900/80 dark:to-pink-900/80'
                                : 'bg-gradient-to-r from-[#F5F3FF]/50 via-[#E0E7FF]/50 to-[#FCE7F3]/50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-pink-900/20'
                            }
                            border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl
                            group-hover:bg-gradient-to-r group-hover:from-[#F5F3FF] group-hover:via-[#E0E7FF] group-hover:to-[#FCE7F3] 
                            dark:group-hover:from-blue-900/60 dark:group-hover:via-indigo-900/60 dark:group-hover:to-pink-900/60`}
                        >
                            <div className="flex flex-col items-center space-y-4">
                                <div className="p-4 rounded-full bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] shadow-lg group-hover:shadow-xl transition-all duration-300">
                                    <Image 
                                        src={option.icon} 
                                        alt={option.name} 
                                        width={32} 
                                        height={32}
                                        className="transform group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-white dark:group-hover:to-gray-300">
                                    {option.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                                    {option.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SelectOption;