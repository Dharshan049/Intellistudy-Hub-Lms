import React, { useState } from 'react'

function QuizCardItem({quiz, userSelectedOption, isAnswered}) {
    const [selectedOption, setSelectedOption] = useState()

    const handleOptionSelect = (option) => {
        if (isAnswered) return;
        setSelectedOption(option);
        userSelectedOption(option);
    };

    return quiz && (
        <div className='relative transform transition-all duration-300 max-w-2xl mx-auto p-6'>
            {/* Background gradient effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] rounded-2xl blur opacity-75"></div>
            
            {/* Main content container */}
            <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-24 h-24 bg-gradient-to-r from-[#E5DBFF]/50 via-[#F0D5FF]/50 to-[#F7E6FF]/50 dark:from-[#4B47B3]/30 dark:via-[#635AE5]/30 dark:to-[#8E5AED]/30 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-24 h-24 bg-gradient-to-r from-[#E5DBFF]/50 via-[#F0D5FF]/50 to-[#F7E6FF]/50 dark:from-[#4B47B3]/30 dark:via-[#635AE5]/30 dark:to-[#8E5AED]/30 rounded-full blur-2xl"></div>

                {/* Question text */}
                <h2 className='relative z-10 text-xl md:text-2xl font-medium text-center mb-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent'>
                    {quiz.question}
                </h2>

                {/* Options grid */}
                <div className='relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {quiz.options.map((option, index) => (
                        <div
                            key={index}
                            onClick={() => handleOptionSelect(option)}
                            className={`
                                relative group overflow-hidden rounded-xl p-4 cursor-pointer
                                transform transition-all duration-300 hover:scale-[1.02]
                                ${isAnswered && !selectedOption ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                                ${selectedOption === option 
                                    ? 'bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-gray-900 dark:text-white'
                                    : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }
                                border-2 border-transparent hover:border-[#E5DBFF] dark:hover:border-[#4B47B3]
                            `}
                        >
                            {/* Option background effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Option content */}
                            <div className="relative flex items-center gap-3">
                                <div className={`
                                    w-6 h-6 rounded-full flex items-center justify-center text-sm
                                    ${selectedOption === option 
                                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                                        : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                    }
                                `}>
                                    {String.fromCharCode(65 + index)}
                                </div>
                                <span className={`
                                    flex-1 text-base
                                    ${selectedOption === option 
                                        ? 'text-gray-900 dark:text-white font-medium'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }
                                `}>
                                    {option}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default QuizCardItem;