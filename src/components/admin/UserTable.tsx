import React, { useState } from 'react';
import { User } from '@/store/authStore';
import { 
  MoreHorizontal, 
  UserMinus, 
  TrendingUp, 
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface UserTableProps {
  users: User[];
  onDeactivate: (userId: number) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, onDeactivate }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const userList = Array.isArray(users) ? users : [];
  const filteredUsers = userList.filter((u) => {
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'instructor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-250 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
        />
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-slate-500">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-700 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">User Name</th>
              <th scope="col" className="px-6 py-4 font-semibold">Email</th>
              <th scope="col" className="px-6 py-4 font-semibold">Role</th>
              <th scope="col" className="px-6 py-4 font-semibold">Date Joined</th>
              <th scope="col" className="px-6 py-4 font-semibold">Status</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User';
                const formattedDate = user.date_joined 
                  ? new Date(user.date_joined).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'N/A';
                
                const isActive = user.is_active && !user.is_deleted;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors odd:bg-white even:bg-slate-50/10">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{fullName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                        {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>{formattedDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {isActive ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-emerald-700 font-semibold text-xs">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-red-700 font-semibold text-xs">Deactivated</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 shadow-lg rounded-xl p-1 z-50">
                          <DropdownMenuItem 
                            className="gap-2 cursor-pointer px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg focus:outline-none"
                            onClick={() => navigate(`/admin/progress/${user.id}`)}
                          >
                            <TrendingUp className="h-4 w-4 text-slate-500" />
                            View Progress
                          </DropdownMenuItem>
                          {isActive && user.id && (
                            <DropdownMenuItem 
                              className="gap-2 text-red-600 focus:text-red-700 hover:bg-red-50 focus:bg-red-50 rounded-lg cursor-pointer px-3 py-2 text-sm focus:outline-none"
                              onClick={() => onDeactivate(user.id!)}
                            >
                              <UserMinus className="h-4 w-4" />
                              Deactivate User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default UserTable;
