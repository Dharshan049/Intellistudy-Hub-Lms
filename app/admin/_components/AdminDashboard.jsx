"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UserPlus, Users, RefreshCw, UserMinus, Shield, ShieldCheck, ShieldAlert, Search } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function AdminDashboard() {
    const { user } = useUser();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedAdminId, setSelectedAdminId] = useState(null);
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [selectedAssignedUsers, setSelectedAssignedUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogSearchQuery, setDialogSearchQuery] = useState('');
    const [showManageUsersDialog, setShowManageUsersDialog] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [user]);

    const fetchUsers = async () => {
        try {
            setRefreshing(true);
            const response = await axios.get('/api/users');
            const sortedUsers = sortUsers(response.data.users);
            setUsers(sortedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.post('/api/update-user-role', { userId, newRole });
            toast.success('Role updated successfully');
            fetchUsers();
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update role');
        }
    };

    const handleUserSelect = (userId) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            }
            return [...prev, userId];
        });
    };

    const handleSelectAllAssignable = (checked) => {
        if (checked) {
            const availableUsers = users
                .filter(user => !assignedUsers.some(assigned => assigned.id === user.id))
                .map(user => user.id);
            setSelectedUsers(availableUsers);
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectAllAssigned = (checked) => {
        if (checked) {
            setSelectedAssignedUsers(assignedUsers.map(user => user.id));
        } else {
            setSelectedAssignedUsers([]);
        }
    };

    const handleAssignUsers = async (adminId) => {
        if (selectedUsers.length === 0) {
            toast.error('Please select users to assign');
            return;
        }

        try {
            await Promise.all(selectedUsers.map(userId => 
                axios.post('/api/assign-user-to-admin', {
                    userId,
                    adminId
                })
            ));
            toast.success('Users assigned successfully');
            
            // Update the assigned users list immediately
            const newlyAssignedUsers = users.filter(user => selectedUsers.includes(user.id));
            setAssignedUsers(prev => [...prev, ...newlyAssignedUsers]);
            
            // Clear selected users
            setSelectedUsers([]);
            
            // Refresh the full list
            fetchUsers();
        } catch (error) {
            console.error('Error assigning users:', error);
            toast.error('Failed to assign users');
        }
    };

    const handleRemoveAssignedUsers = async (adminId) => {
        if (selectedAssignedUsers.length === 0) {
            toast.error('Please select users to remove');
            return;
        }

        try {
            await Promise.all(selectedAssignedUsers.map(userId => 
                axios.post('/api/assign-user-to-admin', {
                    userId,
                    adminId: null
                })
            ));
            toast.success('Users removed successfully');
            
            // Update the assigned users list by removing the selected users
            setAssignedUsers(prev => prev.filter(user => !selectedAssignedUsers.includes(user.id)));
            setSelectedAssignedUsers([]);
            
            // Refresh the full list
            fetchUsers();
        } catch (error) {
            console.error('Error removing users:', error);
            toast.error('Failed to remove users');
        }
    };

    const handleManageUsers = async (adminId) => {
        try {
            const response = await axios.get(`/api/assigned-users/${adminId}`);
            setAssignedUsers(response.data.users || []);
            setSelectedAdminId(adminId);
            setShowManageUsersDialog(true);
        } catch (error) {
            console.error('Error fetching assigned users:', error);
            toast.error('Failed to fetch assigned users');
        }
    };

    const sortUsers = (users) => {
        return users.sort((a, b) => {
            const roleOrder = {
                'metaadmin': 0,
                'admin': 1,
                'user': 2
            };
            if (roleOrder[a.role] !== roleOrder[b.role]) {
                return roleOrder[a.role] - roleOrder[b.role];
            }
            return a.name.localeCompare(b.name);
        });
    };

    const filterUsers = (users, query) => {
        if (!query) return users;
        return users.filter(user =>
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase()) ||
            user.role.toLowerCase().includes(query.toLowerCase())
        );
    };

    const getRoleIcon = (role) => {
        switch (role.toLowerCase()) {
            case 'metaadmin':
                return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
            case 'admin':
                return <Shield className="w-5 h-5 text-blue-500" />;
            default:
                return <ShieldAlert className="w-5 h-5 text-gray-500" />;
        }
    };

    const filteredUsers = filterUsers(users, searchQuery);
    const filteredAvailableUsers = filterUsers(
        users.filter(u => !assignedUsers.some(assigned => assigned.id === u.id)),
        dialogSearchQuery
    );
    const filteredAssignedUsers = filterUsers(assignedUsers, dialogSearchQuery);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#CAD5FF] via-[#D8CAFF] to-[#F0D5FF] dark:from-[#2C2C6D] dark:via-[#3B3B8F] dark:to-[#4F4F99] rounded-xl p-8 shadow-lg">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                        User Management
                    </h2>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">
                        Manage user roles and assignments
                    </p>
                </div>
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4">
                    <Button
                        onClick={fetchUsers}
                        disabled={refreshing}
                        className="relative group overflow-hidden bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-gray-900 dark:text-white hover:shadow-lg transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-300'}`} />
                        <span className="relative">Refresh List</span>
                    </Button>
                </div>
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#635AE5] dark:focus:ring-[#8E5AED] transition-all duration-300"
                        />
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#2C2C6D] dark:via-[#3B3B8F] dark:to-[#4F4F99]">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Role</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.map((user) => (
                                <tr 
                                    key={user.id}
                                    className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getRoleIcon(user.role)}
                                            <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className="px-3 py-1 rounded-full text-sm bg-gradient-to-r from-[#E5DBFF] via-[#F0D5FF] to-[#F7E6FF] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-[#635AE5] dark:focus:ring-[#8E5AED] cursor-pointer"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            <option value="metaadmin">Meta Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        {(user.role === 'admin' || user.role === 'metaadmin') && (
                                            <Dialog open={showManageUsersDialog && selectedAdminId === user.id} onOpenChange={setShowManageUsersDialog}>
                                                <Button
                                                    onClick={() => handleManageUsers(user.id)}
                                                    className="relative group overflow-hidden bg-gradient-to-r from-[#635AE5] via-[#8257E5] to-[#8E5AED] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-white hover:shadow-lg transition-all duration-300"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                    <span className="relative flex items-center gap-2">
                                                        <Users className="h-4 w-4" />
                                                        Manage Users
                                                    </span>
                                                </Button>
                                                <DialogContent className="max-w-2xl bg-white dark:bg-gray-800">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                                                            Manage Users for {user.name}
                                                        </DialogTitle>
                                                    </DialogHeader>

                                                    {/* Dialog Search */}
                                                    <div className="relative mb-6">
                                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search users..."
                                                            value={dialogSearchQuery}
                                                            onChange={(e) => setDialogSearchQuery(e.target.value)}
                                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#635AE5] dark:focus:ring-[#8E5AED] transition-all duration-300"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-6">
                                                        {/* Available Users */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                                    Available Users
                                                                </h3>
                                                                <Checkbox
                                                                    checked={filteredAvailableUsers.length > 0 && filteredAvailableUsers.every(u => selectedUsers.includes(u.id))}
                                                                    onCheckedChange={handleSelectAllAssignable}
                                                                />
                                                            </div>
                                                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                                                {filteredAvailableUsers.map(availableUser => (
                                                                    <div key={availableUser.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                        <div className="flex items-center gap-2">
                                                                            {getRoleIcon(availableUser.role)}
                                                                            <span className="text-gray-900 dark:text-white">
                                                                                {availableUser.name}
                                                                            </span>
                                                                        </div>
                                                                        <Checkbox
                                                                            checked={selectedUsers.includes(availableUser.id)}
                                                                            onCheckedChange={() => handleUserSelect(availableUser.id)}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <Button
                                                                onClick={() => handleAssignUsers(user.id)}
                                                                disabled={selectedUsers.length === 0}
                                                                className="w-full relative group overflow-hidden bg-gradient-to-r from-[#635AE5] via-[#8257E5] to-[#8E5AED] dark:from-[#4B47B3] dark:via-[#635AE5] dark:to-[#8E5AED] text-white hover:shadow-lg transition-all duration-300"
                                                            >
                                                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                                <span className="relative flex items-center gap-2">
                                                                    <UserPlus className="h-4 w-4" />
                                                                    Assign Selected
                                                                </span>
                                                            </Button>
                                                        </div>

                                                        {/* Assigned Users */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                                    Assigned Users
                                                                </h3>
                                                                <Checkbox
                                                                    checked={filteredAssignedUsers.length > 0 && filteredAssignedUsers.every(u => selectedAssignedUsers.includes(u.id))}
                                                                    onCheckedChange={handleSelectAllAssigned}
                                                                />
                                                            </div>
                                                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                                                {filteredAssignedUsers.map(assignedUser => (
                                                                    <div key={assignedUser.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                        <div className="flex items-center gap-2">
                                                                            {getRoleIcon(assignedUser.role)}
                                                                            <span className="text-gray-900 dark:text-white">
                                                                                {assignedUser.name}
                                                                            </span>
                                                                        </div>
                                                                        <Checkbox
                                                                            checked={selectedAssignedUsers.includes(assignedUser.id)}
                                                                            onCheckedChange={() => {
                                                                                setSelectedAssignedUsers(prev => {
                                                                                    if (prev.includes(assignedUser.id)) {
                                                                                        return prev.filter(id => id !== assignedUser.id);
                                                                                    } else {
                                                                                        return [...prev, assignedUser.id];
                                                                                    }
                                                                                });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <Button
                                                                onClick={() => handleRemoveAssignedUsers(user.id)}
                                                                disabled={selectedAssignedUsers.length === 0}
                                                                className="w-full relative group overflow-hidden bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white hover:shadow-lg transition-all duration-300"
                                                            >
                                                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                                <span className="relative flex items-center gap-2">
                                                                    <UserMinus className="h-4 w-4" />
                                                                    Remove Selected
                                                                </span>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard; 