import { db } from "@/configs/db";
import { CHAPTER_NOTES_TABLE, STUDY_TYPE_CONTENT_TABLE } from "@/configs/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { courseId, studyType } = await req.json();
        console.log('printing courseId', courseId);

        if (studyType === 'ALL') {
            // Get notes
            const notes = await db
                .select()
                .from(CHAPTER_NOTES_TABLE)
                .where(eq(CHAPTER_NOTES_TABLE.courseId, courseId));

            // Get all study type content
            const contentList = await db
                .select()
                .from(STUDY_TYPE_CONTENT_TABLE)
                .where(eq(STUDY_TYPE_CONTENT_TABLE.courseId, courseId));

            const result = {
                notes: notes,
                flashcard: contentList?.find(item => item.type === 'Flashcard') || null,
                quiz: contentList?.find(item => item.type === 'Quiz') || null,
                qa: contentList?.find(item => item.type === 'Question/Answer') || null
            };

            return NextResponse.json(result);
        } 
        else if (studyType === 'notes') {
            const notes = await db
                .select()
                .from(CHAPTER_NOTES_TABLE)
                .where(eq(CHAPTER_NOTES_TABLE.courseId, courseId));

            return NextResponse.json(notes);
        }else {
            const result = await db
                .select()
                .from(STUDY_TYPE_CONTENT_TABLE)
                .where(and(eq(STUDY_TYPE_CONTENT_TABLE.courseId, courseId),eq(STUDY_TYPE_CONTENT_TABLE.type, studyType)));


            return NextResponse.json(result[0]);
        }
    } catch (error) {
        console.error('Error in study-type API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}