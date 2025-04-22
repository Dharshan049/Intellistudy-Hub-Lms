import { db } from "@/configs/db";
import { USER_TABLE } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { userId, adminId } = await req.json();
        
        await db.update(USER_TABLE)
            .set({ assignedTo: adminId })
            .where(eq(USER_TABLE.id, userId));

        return NextResponse.json({ message: 'User assigned successfully' });
    } catch (error) {
        console.error('Error assigning user:', error);
        return NextResponse.json({ error: 'Failed to assign user' }, { status: 500 });
    }
} 