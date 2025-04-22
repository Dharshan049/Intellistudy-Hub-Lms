import { db } from "@/configs/db";
import { USER_TABLE } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { email } = await req.json();
        console.log('Checking role for email:', email);
        
        const user = await db.select()
            .from(USER_TABLE)
            .where(eq(USER_TABLE.email, email));

        console.log('User from DB:', user);

        if (user && user[0]) {
            console.log('Found role:', user[0].role);
            return NextResponse.json({ role: user[0].role });
        }
        
        return NextResponse.json({ role: 'user' }); // Default role
    } catch (error) {
        console.error('Error fetching user role:', error);
        return NextResponse.json({ role: 'user' }, { status: 500 });
    }
} 