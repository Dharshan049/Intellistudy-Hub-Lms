import { db } from "@/configs/db";
import { QUIZ_RESULTS_TABLE } from "@/configs/schema";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { courseId, userId, score, totalQuestions } = await req.json();
        console.log('Saving quiz result:', { courseId, userId, score, totalQuestions });

        // Save the quiz result
        await db.insert(QUIZ_RESULTS_TABLE).values({
            courseId,
            userId,
            score,
            totalQuestions,
            completedAt: new Date()
        });

        return NextResponse.json({ 
            message: 'Quiz result saved successfully',
            result: { courseId, userId, score, totalQuestions }
        });
    } catch (error) {
        console.error('Error saving quiz result:', error);
        return NextResponse.json(
            { error: 'Failed to save quiz result', details: error.message },
            { status: 500 }
        );
    }
} 