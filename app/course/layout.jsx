import React from 'react';
import DashBoardHeader from '../dashboard/_components/DashBoardHeader';

function CourseViewLayout({ children }) {
  return (
    <div className="bg-white text-black dark:bg-gray-900 dark:text-white min-h-screen">
      <DashBoardHeader />
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}

export default CourseViewLayout;