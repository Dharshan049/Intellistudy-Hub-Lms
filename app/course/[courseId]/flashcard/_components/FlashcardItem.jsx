import React from 'react'
import ReactCardFlip from 'react-card-flip'

function FlashcardItem({ isFlipped, handleClick, flashcard }) {
  return (
    <div className='flex items-center justify-center w-full'>
      <ReactCardFlip isFlipped={isFlipped} flipDirection="vertical">
        {/* Front of the Flashcard */}
        <div 
          className='relative group transform transition-all duration-500 hover:scale-105 cursor-pointer'
          onClick={handleClick}
        >
          {/* Gradient background with blur effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
          
          {/* Main content */}
          <div className='relative h-[250px] w-[300px] md:h-[350px] md:w-[400px] p-8 rounded-xl bg-white dark:bg-gray-800 shadow-xl flex flex-col items-center justify-center'>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-24 h-24 bg-gradient-to-r from-[#E5DBFF]/50 via-[#F0D5FF]/50 to-[#F7E6FF]/50 dark:from-[#4B47B3]/30 dark:via-[#635AE5]/30 dark:to-[#8E5AED]/30 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-24 h-24 bg-gradient-to-r from-[#E5DBFF]/50 via-[#F0D5FF]/50 to-[#F7E6FF]/50 dark:from-[#4B47B3]/30 dark:via-[#635AE5]/30 dark:to-[#8E5AED]/30 rounded-full blur-2xl"></div>
            
            {/* Question text */}
            <div className="relative z-10 text-center">
              <h2 className="text-xl md:text-2xl font-medium bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                {flashcard?.front}
              </h2>
            </div>
            
            {/* Click hint */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                Click to flip
              </p>
            </div>
          </div>
        </div>

        {/* Back of the Flashcard */}
        <div 
          className='relative group transform transition-all duration-500 hover:scale-105 cursor-pointer'
          onClick={handleClick}
        >
          {/* Gradient background with blur effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#F0D5FF] via-[#E5DBFF] to-[#CAD5FF] dark:from-[#8E5AED] dark:via-[#635AE5] dark:to-[#4B47B3] rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
          
          {/* Main content */}
          <div className='relative h-[250px] w-[300px] md:h-[350px] md:w-[400px] p-8 rounded-xl bg-white dark:bg-gray-800 shadow-xl flex flex-col items-center justify-center'>
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 -translate-y-1/4 -translate-x-1/4 w-24 h-24 bg-gradient-to-r from-[#F0D5FF]/50 via-[#E5DBFF]/50 to-[#CAD5FF]/50 dark:from-[#8E5AED]/30 dark:via-[#635AE5]/30 dark:to-[#4B47B3]/30 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 w-24 h-24 bg-gradient-to-r from-[#F0D5FF]/50 via-[#E5DBFF]/50 to-[#CAD5FF]/50 dark:from-[#8E5AED]/30 dark:via-[#635AE5]/30 dark:to-[#4B47B3]/30 rounded-full blur-2xl"></div>
            
            {/* Answer text */}
            <div className="relative z-10 text-center">
              <h2 className="text-xl md:text-2xl font-medium bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                {flashcard?.back}
              </h2>
            </div>
            
            {/* Click hint */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                Click to flip back
              </p>
            </div>
          </div>
        </div>
      </ReactCardFlip>
    </div>
  )
}

export default FlashcardItem;