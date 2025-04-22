import React from 'react';
import { XCircle } from 'lucide-react';

function AccessDenied() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400">
                You do not have permission to access this page.
            </p>
        </div>
    );
}

export default AccessDenied; 