"use client";

import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import FlashcardItem from './_components/FlashcardItem';
import { useUser } from '@clerk/nextjs';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

function Flashcard() {
  const { courseId } = useParams();
  const { user } = useUser();
  const [flashCards, setFlashCards] = useState([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [api, setApi] = useState();
  const [currentCard, setCurrentCard] = useState(0);

  useEffect(() => {
    GetFlashCards();
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on('select', () => {
      setIsFlipped(false);
      setCurrentCard(api.selectedScrollSnap());
      updateProgress(api.selectedScrollSnap());
    });
  }, [api]);

  const updateProgress = async (currentIndex) => {
    try {
      if (flashCards?.content?.length > 0) {
        await axios.post('/api/study-progress', {
          courseId,
          userId: user?.primaryEmailAddress?.emailAddress,
          type: 'flashcard',
          currentPosition: currentIndex + 1,
          totalItems: flashCards.content.length
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const GetFlashCards = async () => {
    try {
      const result = await axios.post('/api/study-type', {
        courseId: courseId,
        studyType: 'Flashcard'
      });

      if (result?.data?.content) {
        setFlashCards(result.data);
        // Initialize progress when flashcards are loaded
        updateProgress(0);
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    }
  };

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="container mx-auto p-4 bg-white dark:bg-gray-900 text-black dark:text-white">
      <h2 className="font-bold text-2xl">Flashcards</h2>
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
        Flashcards are a great way to test your knowledge. They are short, simple questions that test your understanding of a concept. They are also a great way to review material and reinforce what you have learned.
      </p>

      <div className="mt-6">
        {flashCards?.content?.length > 0 ? (
          <Carousel setApi={setApi}>
            <CarouselContent>
              {flashCards.content.map((flashcard, index) => (
                <CarouselItem key={index} className="flex items-center justify-center mt-10">
                  <div 
                    className={`p-6 rounded-lg shadow-md transition-all ${isFlipped ? 'bg-gray-600' : 'bg-gray-800'} text-white`} 
                    onClick={handleClick}
                  >
                    <FlashcardItem
                      handleClick={handleClick}
                      isFlipped={isFlipped}
                      flashcard={flashcard}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="text-black dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" />
            <CarouselNext className="text-black dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" />
          </Carousel>
        ) : (
          <div className="text-center py-10">No flashcards available for this course.</div>
        )}
      </div>
    </div>
  );
}

export default Flashcard;