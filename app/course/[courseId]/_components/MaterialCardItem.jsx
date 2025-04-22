import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { RefreshCcw, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

const MaterialCardItem = ({ item, studyTypeContent, course, refreshData }) => {
  const [loading, setLoading] = useState(false);

  // Helper function to check if content exists
  const hasContent = () => {
    if (item.type === 'notes') {
      return studyTypeContent?.notes?.length > 0;
    }
    return studyTypeContent?.[item.type.toLowerCase()] !== null && studyTypeContent?.[item.type.toLowerCase()] !== undefined;
  };

  const GenerateContent = async (e) => {
    try {
      e.preventDefault(); // Prevent the link navigation
      e.stopPropagation(); // Prevent event bubbling
      
      setLoading(true);
      toast.loading('Generating content...');
      
      let chapters = '';
      course?.courseLayout?.chapters?.forEach(chapter => {
        chapters = (chapter.chapterTitle || chapter.chapter_title) + ',' + chapters;
      });
      
      const result = await axios.post('/api/study-type-content', {
        courseId: course?.courseId,
        type: item.name,
        chapters: chapters.slice(0, -1),
      });
      
      await refreshData();
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const CardContent = () => (
    <div className="relative h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 flex flex-col items-center">
      {!hasContent() ? (
        <h2 className="p-1 px-3 bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 text-white rounded-full text-[10px] mb-2">
          Generate
        </h2>
      ) : (
        <h2 className="p-1 px-3 bg-gradient-to-r from-green-400 to-green-500 dark:from-green-500 dark:to-green-600 text-white rounded-full text-[10px] mb-2">
          Ready
        </h2>
      )}

      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
        <div className="relative w-full h-full p-3 bg-white dark:bg-gray-800 rounded-full">
          <Image 
            src={item.icon} 
            alt={item.name} 
            width={40} 
            height={40} 
            className="transform group-hover:scale-110 transition-transform duration-300" 
          />
        </div>
      </div>

      <h2 className="font-medium text-lg text-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
        {item.name}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 text-center mt-2 mb-6">
        {item.desc}
      </p>

      <div className="mt-auto w-full">
        {!hasContent() ? (
          <Button 
            className="w-full relative group/btn overflow-hidden bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-gray-900 dark:text-white hover:shadow-lg transition-all duration-300" 
            onClick={GenerateContent}
            disabled={loading}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <RefreshCcw className="animate-spin h-4 w-4" />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </span>
          </Button>
        ) : (
          <Button className="w-full relative group/btn overflow-hidden bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-gray-900 dark:text-white hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center justify-center gap-2">
              View
              <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
            </span>
          </Button>
        )}
      </div>
    </div>
  );

  return !hasContent() ? (
    <div className="relative group transform transition-all duration-300">
      <CardContent />
    </div>
  ) : (
    <Link href={'/course/' + course?.courseId + item.path}>
      <CardContent />
    </Link>
  );
};

export default MaterialCardItem;