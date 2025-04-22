import { courseOutline } from "@/configs/AiModel"; // Import the courseOutline
import { db } from "@/configs/db";
import { STUDY_MATERIAL_TABLE } from "@/configs/schema";
import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { courseId, topic, studyType, difficultyLevel, language, createdBy } = await req.json();
    const PROMPT = `Generate a study material for ${topic} for ${studyType} and level of difficulty will be ${difficultyLevel} with summary of course, List of Chapters along with summary and Emoji icon for each chapter, Topic list in each chapter in JSON format. The language should be ${language}.`;

    // Generate course outline using AI
    const aiResp = await courseOutline.sendMessage(PROMPT);
    const aiResult = JSON.parse(aiResp.response.text());
    console.log('prompt', PROMPT);

    // Save course outline to database
    const dbResult = await db.insert(STUDY_MATERIAL_TABLE).values({
        courseId: courseId,
        courseType: studyType,
        createdBy: createdBy,
        topic: topic,
        courseLayout: aiResult,
        difficultyLevel: difficultyLevel,
    }).returning({ resp: STUDY_MATERIAL_TABLE });

    // Trigger the Inngest function to generate chapter notes
    const result = await inngest.send({
        name: "notes.generate",
        data: {
            course: dbResult[0].resp,
        },
    });

    return NextResponse.json({
        courseOutline: dbResult[0],
    });
}