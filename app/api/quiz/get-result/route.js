import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { QUIZ_RESULTS_TABLE } from '@/configs/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function POST(req) {
    try {
        const { courseId, userId } = await req.json();
        console.log('Fetching quiz result for:', { courseId, userId });

        if (!userId) {
            console.log('Missing required parameters');
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Build the query based on whether courseId is provided
        const query = courseId 
            ? and(
                eq(QUIZ_RESULTS_TABLE.courseId, courseId),
                eq(QUIZ_RESULTS_TABLE.userId, userId)
              )
            : eq(QUIZ_RESULTS_TABLE.userId, userId);

        // Fetch quiz results
        const result = await db
            .select()
            .from(QUIZ_RESULTS_TABLE)
            .where(query)
            .orderBy(desc(QUIZ_RESULTS_TABLE.completedAt));

        // If courseId is provided, return only the latest result
        // Otherwise, return all results
        return NextResponse.json({ 
            result: courseId ? (result.length > 0 ? result[0] : null) : result
        });
    } catch (error) {
        console.error('Error fetching quiz result:', error);
        return NextResponse.json(
            { error: 'Failed to fetch quiz result', details: error.message },
            { status: 500 }
        );
    }
} 