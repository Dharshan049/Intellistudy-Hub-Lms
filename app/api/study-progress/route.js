import { db } from "@/configs/db";
import { STUDY_PROGRESS_TABLE } from "@/configs/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET progress
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get('courseId');
        const userId = searchParams.get('userId');
        
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // If courseId is provided, get progress for specific course
        // Otherwise, get all progress for the user
        const query = courseId 
            ? and(
                eq(STUDY_PROGRESS_TABLE.courseId, courseId),
                eq(STUDY_PROGRESS_TABLE.userId, userId)
              )
            : eq(STUDY_PROGRESS_TABLE.userId, userId);

        const progress = await db
            .select()
            .from(STUDY_PROGRESS_TABLE)
            .where(query);

        return NextResponse.json({ progress });
    } catch (error) {
        console.error('Error fetching progress:', error);
        return NextResponse.json(
            { error: 'Failed to fetch progress' },
            { status: 500 }
        );
    }
}

// Update progress
export async function POST(req) {
    try {
        const { courseId, userId, type, currentPosition, totalItems } = await req.json();

        // Check if progress record exists
        const existingProgress = await db
            .select()
            .from(STUDY_PROGRESS_TABLE)
            .where(
                and(
                    eq(STUDY_PROGRESS_TABLE.courseId, courseId),
                    eq(STUDY_PROGRESS_TABLE.userId, userId),
                    eq(STUDY_PROGRESS_TABLE.type, type)
                )
            );

        if (existingProgress.length > 0) {
            // Update existing record
            await db
                .update(STUDY_PROGRESS_TABLE)
                .set({
                    currentPosition,
                    totalItems,
                    lastUpdated: new Date()
                })
                .where(
                    and(
                        eq(STUDY_PROGRESS_TABLE.courseId, courseId),
                        eq(STUDY_PROGRESS_TABLE.userId, userId),
                        eq(STUDY_PROGRESS_TABLE.type, type)
                    )
                );
        } else {
            // Create new record
            await db.insert(STUDY_PROGRESS_TABLE).values({
                courseId,
                userId,
                type,
                currentPosition,
                totalItems,
                lastUpdated: new Date()
            });
        }

        return NextResponse.json({ 
            message: 'Progress updated successfully',
            progress: Math.round((currentPosition / totalItems) * 100)
        });
    } catch (error) {
        console.error('Error updating progress:', error);
        return NextResponse.json(
            { error: 'Failed to update progress' },
            { status: 500 }
        );
    }
} 