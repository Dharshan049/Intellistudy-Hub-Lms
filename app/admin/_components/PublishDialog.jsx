"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import axios from 'axios';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

function PublishDialog({ open, onClose, courseId }) {
    const { user } = useUser();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [publishing, setPublishing] = useState(false);

    useEffect(() => {
        if (open) {
            fetchAssignedUsers();
        }
    }, [open]);

    const fetchAssignedUsers = async () => {
        try {
            const adminEmail = user?.primaryEmailAddress?.emailAddress;
            console.log('Current admin email:', adminEmail);

            const response = await axios.get('/api/users', {
                params: {
                    adminEmail: adminEmail,
                    onlyAssigned: true
                }
            });
            console.log('Full API response:', response.data);
            
            // Show all assigned users regardless of role
            const assignedUsers = response.data.users;
            console.log('Assigned users:', assignedUsers);
            setUsers(assignedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedUsers(filteredUsers.map(user => user.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleUserSelect = (userId) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const handlePublish = async () => {
        if (selectedUsers.length === 0) {
            toast.error('Please select users to publish to');
            return;
        }

        setPublishing(true);
        try {
            const response = await axios.post('/api/admin/publish-course', {
                courseId,
                userIds: selectedUsers,
                publisherEmail: user?.primaryEmailAddress?.emailAddress
            });
            console.log('Publish response:', response.data);
            toast.success(`Course published successfully to ${response.data.publishedTo} users`);
            onClose();
        } catch (error) {
            console.error('Error publishing course:', error);
            const errorMessage = error.response?.data?.details || error.message;
            toast.error(`Failed to publish course: ${errorMessage}`);
        } finally {
            setPublishing(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Publish Course to Users</DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Select All Checkbox */}
                    <div className="flex items-center space-x-2 mb-4">
                        <Checkbox
                            id="select-all"
                            checked={filteredUsers.length > 0 && filteredUsers.every(user => selectedUsers.includes(user.id))}
                            onCheckedChange={handleSelectAll}
                        />
                        <label htmlFor="select-all">Select All</label>
                    </div>

                    {/* User List */}
                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {loading ? (
                            <div>Loading users...</div>
                        ) : (
                            filteredUsers.map(user => (
                                <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                                    <Checkbox
                                        id={`user-${user.id}`}
                                        checked={selectedUsers.includes(user.id)}
                                        onCheckedChange={() => handleUserSelect(user.id)}
                                    />
                                    <label htmlFor={`user-${user.id}`} className="flex-1">
                                        <div>{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </label>
                                </div>
                            ))
                        )}
                    </div>

                    <Button
                        className="w-full mt-4"
                        onClick={handlePublish}
                        disabled={publishing || selectedUsers.length === 0}
                    >
                        {publishing ? 'Publishing...' : 'Publish Course'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default PublishDialog; 