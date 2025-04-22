import { db } from "@/configs/db";
import { USER_TABLE } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Using segment config to handle params
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function GET(request) {
    try {
        // Get adminId from URL instead of params
        const adminId = request.url.split('/').pop();

        if (!adminId) {
            return NextResponse.json(
                { error: 'Admin ID is required' },
                { status: 400 }
            );
        }

        // Get users assigned to this admin
        const assignedUsers = await db
            .select({
                id: USER_TABLE.id,
                name: USER_TABLE.name,
                email: USER_TABLE.email,
                role: USER_TABLE.role
            })
            .from(USER_TABLE)
            .where(eq(USER_TABLE.assignedTo, adminId));

        return NextResponse.json({ users: assignedUsers });
    } catch (error) {
        console.error('Error fetching assigned users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assigned users' },
            { status: 500 }
        );
    }
} 