"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import AdminDashboard from './_components/AdminDashboard';
import CourseManagement from './_components/CourseManagement';
import AccessDenied from './_components/AccessDenied';
import axios from 'axios';

function AdminPage() {
    const { user } = useUser();
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserRole = async () => {
            if (user?.primaryEmailAddress?.emailAddress) {
                try {
                    const response = await axios.post('/api/get-user-role', {
                        email: user.primaryEmailAddress.emailAddress
                    });
                    console.log('User role from DB:', response.data.role);
                    setUserRole(response.data.role.toLowerCase());
                } catch (error) {
                    console.error('Error fetching user role:', error);
                    setUserRole('user');
                }
                setLoading(false);
            }
        };

        getUserRole();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    if (userRole === 'user') {
        return <AccessDenied />;
    }

    return (
        <div className="space-y-8">
            {userRole === 'metaadmin' && <AdminDashboard />}
            {(userRole === 'admin' || userRole === 'metaadmin') && <CourseManagement />}
        </div>
    );
}

export default AdminPage; 