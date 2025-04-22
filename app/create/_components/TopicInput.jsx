"use client";

import { Textarea } from '@/components/ui/textarea'
import React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Gauge } from 'lucide-react'
  

function TopicInput({setTopic, setDifficultyLevel}) {
  return (
    <div className='w-full max-w-3xl mx-auto p-8 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg border border-white/20 dark:border-white/10'>
        {/* Topic Section */}
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                    Enter Your Study Topic
                </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
                Describe the subject matter or paste the content you wish to study
            </p>
            <Textarea placeholder='Start writing here...' 
            className="min-h-[150px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 transition-all duration-300"
            onChange={(event)=>setTopic(event.target.value)} />
        </div>

        {/* Difficulty Level Section */}
        <div className="mt-8 space-y-4">
            <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                    Select Difficulty Level
                </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
                Choose the complexity level that best suits your learning goals
            </p>
            <Select onValueChange={(value)=>setDifficultyLevel(value)}>
                <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400">
                    <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Easy" className="cursor-pointer">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Easy
                        </span>
                    </SelectItem>
                    <SelectItem value="Medium" className="cursor-pointer">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            Medium
                        </span>
                    </SelectItem>
                    <SelectItem value="Hard" className="cursor-pointer">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Hard
                        </span>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    </div>
  )
}

export default TopicInput