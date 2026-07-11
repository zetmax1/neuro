import React from 'react';
import Header from '@/components/layout/Header';
import UserTable from '@/components/admin/UserTable';
import { useUsers } from '@/hooks/useUsers';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Users, Loader2 } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { users, isLoading, error, refetch } = useUsers();
  const { user, isLoading: loadingAuth } = useAuthStore();

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleDeactivate = async (userId: number) => {
    if (!window.confirm("Are you sure you want to deactivate/soft-delete this user? They will no longer be able to log in.")) {
      return;
    }

    try {
      await authApi.deactivateUser(userId);
      toast.success("User account deactivated successfully");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to deactivate user");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 border-b border-slate-200/80 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-500" />
              User Management
            </h1>
            <p className="text-slate-500 text-sm">
              Manage student, instructor, and administrative credentials, track active statuses, and configure access roles.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6 font-semibold">
            {error.message || "Failed to fetch user accounts. Please verify your administrative permissions."}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <UserTable users={users} onDeactivate={handleDeactivate} />
          </div>
        )}
      </main>
    </div>
  );
};
export default UserManagement;
