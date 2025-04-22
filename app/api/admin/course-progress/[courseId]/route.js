import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { STUDY_PROGRESS_TABLE, QUIZ_RESULTS_TABLE } from '@/configs/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(req, { params }) {
    try {
        const { courseId } = params;
        
        if (!courseId) {
            return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
        }

        // Fetch study progress (notes and flashcards)
        const studyProgress = await db
            .select()
            .from(STUDY_PROGRESS_TABLE)
            .where(eq(STUDY_PROGRESS_TABLE.courseId, courseId));

        // Fetch quiz results
        const quizResults = await db
            .select()
            .from(QUIZ_RESULTS_TABLE)
            .where(eq(QUIZ_RESULTS_TABLE.courseId, courseId));

        // Combine and format the progress data
        const progressData = [
            ...studyProgress.map(item => ({
                type: item.type,
                currentPosition: item.currentPosition,
                totalItems: item.totalItems,
                userId: item.userId
            })),
            ...quizResults.map(item => ({
                type: 'quiz',
                score: item.score,
                totalQuestions: item.totalQuestions,
                userId: item.userId
            }))
        ];

        return NextResponse.json({ progress: progressData });
    } catch (error) {
        console.error('Error fetching course progress:', error);
        return NextResponse.json(
            { error: 'Failed to fetch course progress' },
            { status: 500 }
        );
    }
} 