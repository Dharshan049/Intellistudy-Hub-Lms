"use client";
import React from 'react';
import DashBoardHeader from "@/app/dashboard/_components/DashBoardHeader";

export default function AdminLayout({ children }) {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <DashBoardHeader />
      <div className="p-5 md:p-10">
        {children}
      </div>
    </div>
  );
} 