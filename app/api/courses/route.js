import { db } from "@/configs/db";
import { STUDY_MATERIAL_TABLE, PUBLISHED_COURSES_TABLE, CHAPTER_NOTES_TABLE, STUDY_TYPE_CONTENT_TABLE } from "@/configs/schema";
import { eq, or, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get('courseId');

        if (!courseId) {
            return NextResponse.json(
                { error: 'Course ID is required' },
                { status: 400 }
            );
        }

        const course = await db
            .select()
            .from(STUDY_MATERIAL_TABLE)
            .where(eq(STUDY_MATERIAL_TABLE.courseId, courseId));

        if (!course || course.length === 0) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ result: course[0] });
    } catch (error) {
        console.error('Error fetching course:', error);
        return NextResponse.json(
            { error: 'Failed to fetch course' },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const { createdBy, userId, role } = await req.json();
        console.log('API received:', { createdBy, userId, role });

        // If user is admin or metaadmin, return their created courses
        if (role === 'admin' || role === 'metaadmin') {
            const courses = await db
                .select()
                .from(STUDY_MATERIAL_TABLE)
                .where(eq(STUDY_MATERIAL_TABLE.createdBy, createdBy));
            return NextResponse.json({ result: courses });
        }
        
        // For regular users, get both their created courses and courses published to them
        const userCourses = await db
            .select()
            .from(STUDY_MATERIAL_TABLE)
            .where(
                or(
                    eq(STUDY_MATERIAL_TABLE.createdBy, userId.toString()),
                    eq(STUDY_MATERIAL_TABLE.createdBy, createdBy)
                )
            );

        return NextResponse.json({ result: userCourses });
    } catch (error) {
        console.error('Error in courses API:', error);
        return NextResponse.json(
            { error: 'Failed to fetch courses', details: error.message },
            { status: 500 }
        );
    }
} 