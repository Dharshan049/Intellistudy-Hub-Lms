import { db } from "@/configs/db";
import { 
    STUDY_MATERIAL_TABLE, 
    CHAPTER_NOTES_TABLE, 
    STUDY_TYPE_CONTENT_TABLE,
    PUBLISHED_COURSES_TABLE,
    QUIZ_RESULTS_TABLE
} from "@/configs/schema";
import { eq, like } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { courseId } = await req.json();
        
        // Delete all related quiz results
        await db.delete(QUIZ_RESULTS_TABLE)
            .where(eq(QUIZ_RESULTS_TABLE.courseId, courseId));

        // Delete all published course records
        await db.delete(PUBLISHED_COURSES_TABLE)
            .where(eq(PUBLISHED_COURSES_TABLE.courseId, courseId));

        // Delete study content (flashcards, quiz, etc.)
        await db.delete(STUDY_TYPE_CONTENT_TABLE)
            .where(eq(STUDY_TYPE_CONTENT_TABLE.courseId, courseId));

        // Delete chapter notes
        await db.delete(CHAPTER_NOTES_TABLE)
            .where(eq(CHAPTER_NOTES_TABLE.courseId, courseId));

        // Delete the main course
        await db.delete(STUDY_MATERIAL_TABLE)
            .where(eq(STUDY_MATERIAL_TABLE.courseId, courseId));

        // Also delete any published versions of this course (courseId-userId format)
        await db.delete(STUDY_MATERIAL_TABLE)
            .where(like(STUDY_MATERIAL_TABLE.courseId, `${courseId}-%`));

        return NextResponse.json({ 
            message: 'Course and all associated data deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json(
            { error: 'Failed to delete course', details: error.message },
            { status: 500 }
        );
    }
} 