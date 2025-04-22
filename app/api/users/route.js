import { db } from "@/configs/db";
import { USER_TABLE } from "@/configs/schema";
import { eq, and, or } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET all users
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const adminEmail = searchParams.get('adminEmail');
        const onlyAssigned = searchParams.get('onlyAssigned') === 'true';

        console.log('API received params:', { adminEmail, onlyAssigned });

        // First get the admin's ID using their email
        let adminUser = null;
        if (adminEmail) {
            const adminResult = await db
                .select()
                .from(USER_TABLE)
                .where(eq(USER_TABLE.email, adminEmail));
            
            adminUser = adminResult[0];
            console.log('Found admin:', adminUser);
        }

        let query = db.select().from(USER_TABLE);

        // If requesting only assigned users, filter by assignedTo using admin's ID
        if (onlyAssigned && adminUser) {
            console.log('Filtering by assignedTo:', adminUser.id);
            query = query.where(
                and(
                    eq(USER_TABLE.assignedTo, adminUser.id.toString()),
                    // Include all roles (user, admin, metaadmin)
                    or(
                        eq(USER_TABLE.role, 'user'),
                        eq(USER_TABLE.role, 'admin'),
                        eq(USER_TABLE.role, 'metaadmin')
                    )
                )
            );
        }

        const users = await query;
        console.log('Found users:', users);
        
        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users', details: error.message },
            { status: 500 }
        );
    }
}

// POST to update user role
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