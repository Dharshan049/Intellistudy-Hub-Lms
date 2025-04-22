import { db } from "@/configs/db";
import { STUDY_MATERIAL_TABLE, USER_TABLE, QUIZ_RESULTS_TABLE, STUDY_PROGRESS_TABLE } from "@/configs/schema";
import { eq, and, like, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const { courseId } = params;
        console.log('Fetching published users for course:', courseId);

        // First get all published users for this course
        const publishedUsers = await db
            .select({
                courseId: STUDY_MATERIAL_TABLE.courseId,
                createdBy: STUDY_MATERIAL_TABLE.createdBy,
                publishedBy: STUDY_MATERIAL_TABLE.publishedBy,
                name: USER_TABLE.name,
                email: USER_TABLE.email,
            })
            .from(STUDY_MATERIAL_TABLE)
            .innerJoin(
                USER_TABLE,
                eq(STUDY_MATERIAL_TABLE.createdBy, USER_TABLE.email)
            )
            .where(
                and(
                    like(STUDY_MATERIAL_TABLE.courseId, `${courseId}-%`),
                    isNotNull(STUDY_MATERIAL_TABLE.publishedBy)
                )
            );

        // For each user, fetch their progress data
        const usersWithProgress = await Promise.all(publishedUsers.map(async (user) => {
            // Get notes and flashcard progress
            const studyProgress = await db
                .select()
                .from(STUDY_PROGRESS_TABLE)
                .where(
                    and(
                        eq(STUDY_PROGRESS_TABLE.courseId, user.courseId),
                        eq(STUDY_PROGRESS_TABLE.userId, user.email)
                    )
                );

            // Get quiz results
            const quizResult = await db
                .select()
                .from(QUIZ_RESULTS_TABLE)
                .where(
                    and(
                        eq(QUIZ_RESULTS_TABLE.courseId, user.courseId),
                        eq(QUIZ_RESULTS_TABLE.userId, user.email)
                    )
                );

            return {
                ...user,
                notesProgress: studyProgress.find(p => p.type === 'notes'),
                flashcardProgress: studyProgress.find(p => p.type === 'flashcard'),
                quizResult: quizResult[0] || null
            };
        }));

        console.log('Found published users with progress:', usersWithProgress);

        return NextResponse.json({ users: usersWithProgress });
    } catch (error) {
        console.error('Error in published-users API:', error);
        return NextResponse.json(
            { 
                error: 'Failed to fetch published users', 
                details: error.message,
                stack: error.stack 
            },
            { status: 500 }
        );
    }
} 