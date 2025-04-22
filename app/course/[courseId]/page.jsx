"use client"

import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import CourseIntroCard from './_components/CourseIntroCard';
import StudyMaterialSection from './_components/StudyMaterialSection';
import ChapterList from './_components/ChapterList';
import StudyProgress from './_components/StudyProgress';

function Course() {
    const {courseId} = useParams();
    const [course, setCourse] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        GetCourse();
    }, [])

    const GetCourse = async () => {
        try {
            const result = await axios.get(`/api/courses?courseId=${courseId}`);
            setCourse(result.data.result);
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600 dark:text-gray-400">Course not found</div>
            </div>
        );
    }

    return (
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-8">
            {/* Top Section: Course Intro and Study Material side by side */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-10">
                {/* Course Intro Card */}
                <div>
                    <CourseIntroCard course={course} />
                </div>

                {/* Study Material Section */}
                <div>
                    <StudyMaterialSection courseId={courseId} course={course} />
                </div>
            </div>

            {/* Middle Section: Study Progress */}
            <div className="mb-10">
                <StudyProgress courseId={courseId} />
            </div>

            {/* Bottom Section: Chapter List */}
            <div>
                <ChapterList course={course} />
            </div>
        </div>
    );
}

export default Course;