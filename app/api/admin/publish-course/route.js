import { db } from "@/configs/db";
import { 
    PUBLISHED_COURSES_TABLE, 
    STUDY_MATERIAL_TABLE,
    CHAPTER_NOTES_TABLE,
    STUDY_TYPE_CONTENT_TABLE,
    USER_TABLE 
} from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { courseId, userIds, publisherEmail } = await req.json();
        console.log('Publishing course:', { courseId, userIds, publisherEmail });

        // First, get all the course content
        const courseData = await db
            .select()
            .from(STUDY_MATERIAL_TABLE)
            .where(eq(STUDY_MATERIAL_TABLE.courseId, courseId));

        if (!courseData || courseData.length === 0) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        const chapterNotes = await db
            .select()
            .from(CHAPTER_NOTES_TABLE)
            .where(eq(CHAPTER_NOTES_TABLE.courseId, courseId));

        const studyContent = await db
            .select()
            .from(STUDY_TYPE_CONTENT_TABLE)
            .where(eq(STUDY_TYPE_CONTENT_TABLE.courseId, courseId));

        // Create published course records for each selected user
        for (const userId of userIds) {
            try {
                // Get user's email from USER_TABLE
                const userResult = await db
                    .select()
                    .from(USER_TABLE)
                    .where(eq(USER_TABLE.id, userId));

                if (!userResult || userResult.length === 0) {
                    throw new Error(`User with ID ${userId} not found`);
                }

                const userEmail = userResult[0].email;
                const userCourseId = `${courseId}-${userId}`;

                // Copy the main course data with publishedBy information
                await db.insert(STUDY_MATERIAL_TABLE).values({
                    courseId: userCourseId,
                    courseType: courseData[0].courseType,
                    topic: courseData[0].topic,
                    difficultyLevel: courseData[0].difficultyLevel,
                    courseLayout: courseData[0].courseLayout,
                    createdBy: userEmail,
                    publishedBy: publisherEmail,
                    status: 'Ready'
                });

                // 2. Copy chapter notes
                if (chapterNotes.length > 0) {
                    for (const note of chapterNotes) {
                        await db.insert(CHAPTER_NOTES_TABLE).values({
                            courseId: userCourseId,
                            chapterId: note.chapterId,
                            notes: note.notes
                        });
                    }
                }

                // 3. Copy study content (flashcards, quiz, etc)
                if (studyContent.length > 0) {
                    for (const content of studyContent) {
                        await db.insert(STUDY_TYPE_CONTENT_TABLE).values({
                            courseId: userCourseId,
                            content: content.content,
                            type: content.type,
                            status: 'Ready'
                        });
                    }
                }

                // 4. Create the published record
                await db.insert(PUBLISHED_COURSES_TABLE).values({
                    courseId: userCourseId,
                    userId: userId.toString(),
                    publishedAt: new Date(),
                });

                console.log(`Successfully published course ${userCourseId} from ${publisherEmail} to ${userEmail}`);
            } catch (error) {
                console.error(`Error publishing course to user ${userId}:`, error);
                throw new Error(`Failed to publish course to user ${userId}: ${error.message}`);
            }
        }

        return NextResponse.json({ 
            message: 'Course published successfully',
            publishedTo: userIds.length
        });
    } catch (error) {
        console.error('Error in publish-course API:', error);
        return NextResponse.json(
            { 
                error: 'Failed to publish course', 
                details: error.message,
                stack: error.stack 
            },
            { status: 500 }
        );
    }
} 