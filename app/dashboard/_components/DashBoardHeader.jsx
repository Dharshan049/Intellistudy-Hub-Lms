'use client'; // This directive marks the component as a client-side component

import React, { useEffect, useState } from 'react';

function DashboardHeader() {
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    // Add the animation class when the component is mounted
    setAnimationClass('animate-fadeIn');
  }, []);

  const fadeInKeyframes = `
    @keyframes fadeIn {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <>
      <style>{fadeInKeyframes}</style> {/* Inject keyframes into the page */}
      <div className="p-5 shadow-md flex justify-between items-center bg-white dark:bg-gray-900">
        <h2
          className={`text-xl font-bold uppercase tracking-wider ${animationClass}`}
          style={{
            color: 'inherit',
            animation: 'fadeIn 2s ease-out',
          }}
        >
          Intellistudy Hub
        </h2>
      </div>
    </>
  );
}

export default DashboardHeader;