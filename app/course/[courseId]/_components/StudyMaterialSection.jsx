import React, { useEffect, useState } from 'react';
import MaterialCardItem from './MaterialCardItem';
import axios from 'axios';
import Link from 'next/link';
import { Book, Layers, BrainCircuit } from 'lucide-react';

function StudyMaterialSection({ courseId, course }) {
    const [studyTypeContent, setStudyTypeContent] = useState();

    const MaterialList = [
        {
            name: 'Notes/Chapters',
            desc: 'Read notes',
            icon: '/reading.svg',
            path: '/notes',
            type: 'notes'
        },
        {
            name: 'Flashcard',
            desc: 'Flashcard help to remember the concepts',
            icon: '/card.svg',
            path: '/flashcard',
            type: 'flashcard'
        },
        {
            name: 'Quiz',
            desc: 'Great way to test your knowledge',
            icon: '/quiz1.svg',
            path: '/quiz',
            type: 'quiz'
        }
    ];

    useEffect(() => {
        GetStudyMaterial();
    }, []);

    const GetStudyMaterial = async () => {
        const result = await axios.post('/api/study-type', {
            courseId: courseId,
            studyType: 'ALL'
        });
        console.log(result?.data);
        setStudyTypeContent(result.data);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Header Section with Gradient Background */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#CAD5FF] via-[#D8CAFF] to-[#F0D5FF] dark:from-[#2C2C6D] dark:via-[#3B3B8F] dark:to-[#4F4F99] p-8">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                        Study Material
                    </h2>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">
                        Choose your preferred way to learn and master the content
                    </p>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Cards Grid with Modern Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-white dark:bg-gray-800">
                {MaterialList.map((item, index) => (
                    <div 
                        key={index} 
                        className="relative group transform transition-all duration-300 hover:scale-[1.02]"
                    >
                        {/* Card Background Gradient */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                        
                        {/* Card Content */}
                        <div className="relative h-full">
                            <MaterialCardItem  
                                item={item}
                                studyTypeContent={studyTypeContent}
                                course={course}
                                refreshData={GetStudyMaterial}
                            />
                        </div>

                        {/* Decorative Corner Elements */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tl from-white/5 to-transparent rounded-bl-xl"></div>
                    </div>
                ))}
            </div>

            {/* Additional Decorative Elements */}
            <div className="absolute -bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-[#E5DBFF]/20 to-[#F7E6FF]/20 dark:from-[#4B47B3]/20 dark:to-[#8E5AED]/20 rounded-full blur-xl"></div>
            <div className="absolute -top-4 left-4 w-24 h-24 bg-gradient-to-tl from-[#E5DBFF]/20 to-[#F7E6FF]/20 dark:from-[#4B47B3]/20 dark:to-[#8E5AED]/20 rounded-full blur-xl"></div>
        </div>
    );
}

export default StudyMaterialSection;