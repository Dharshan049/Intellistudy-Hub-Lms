import { db } from "@/configs/db";
import { STUDY_TYPE_CONTENT_TABLE } from "@/configs/schema";
import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const { chapters, courseId, type } = body;
        
        if (!chapters || !courseId || !type) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const PROMPT = type == 'Flashcard' ?
        `Generate the flashcard on topic: ${chapters} in JSON format with front back content, Maximum 15`:
        'Generate Quiz on topic : '+chapters+' with Question and Options along with correct answer in JSON format, (Max 10)';

        // Insert to DB and update status to generating
        const result = await db.insert(STUDY_TYPE_CONTENT_TABLE).values({
            courseId: courseId,
            type: type,
        }).returning({ id: STUDY_TYPE_CONTENT_TABLE.id });

        // Trigger Inngest Function
        await inngest.send({
            name: 'studyType.content',
            data: {
                courseId: courseId,
                recordId: result[0].id,
                prompt: PROMPT,
                studyType: type
            }
        });

        return NextResponse.json({ id: result[0].id });
    } catch (error) {
        console.error('Error in study-type-content API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}