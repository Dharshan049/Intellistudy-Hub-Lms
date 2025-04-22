import { db } from "@/configs/db";
import { USER_TABLE } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { userId, newRole } = await req.json();
        
        await db.update(USER_TABLE)
            .set({ role: newRole })
            .where(eq(USER_TABLE.id, userId));

        return NextResponse.json({ message: 'Role updated successfully' });
    } catch (error) {
        console.error('Error updating role:', error);
        return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }
}