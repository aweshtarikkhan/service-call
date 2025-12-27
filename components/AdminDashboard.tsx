
import React, { useState } from 'react';
import { type BookingDetails, type RegistrationForm, type User, CategoryType } from '../types';
import { CATEGORIES } from '../constants';
import { UserPlus, ClipboardList, Briefcase, Plus, Trash2, ArrowRightLeft, Database, Calendar, Clock, CreditCard } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface AdminDashboardProps {
  bookings: BookingDetails[];
  registrations: RegistrationForm[];
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (username: string) => void;
  onAssignBooking: (bookingId: string, providerId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ bookings, registrations, users, onAddUser, onDeleteUser, onAssignBooking }) => {
  const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'REGISTRATIONS' | 'USERS'>('BOOKINGS');
  
  // User Creation State
  const [newUser, setNewUser] = useState<User>({
    name: '',
    username: '',
    password: '',
    role: 'PROVIDER',
    category: CategoryType.ELECTRICIAN
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser(newUser);
    setNewUser({ name: '', username: '', password: '', role: 'PROVIDER', category: CategoryType.ELECTRICIAN });
    alert('User created successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${isSupabaseConfigured ? 'bg-green-50 border-green-200 text-green-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                <Database size={12} />
                {isSupabaseConfigured ? 'ONLINE DB CONNECTED' : 'USING LOCAL DEMO DATA'}
            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-slate-500 text-sm font-medium">Total Bookings</h3>
                <p className="text-3xl font-bold text-slate-800 mt-2">{bookings.length}</p>
                <p className="text-green-600 text-sm mt-1">{bookings.filter(b => b.status === 'PENDING').length} Pending</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-slate-500 text-sm font-medium">Professional Applications</h3>
                <p className="text-3xl font-bold text-slate-800 mt-2">{registrations.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-slate-500 text-sm font-medium">Active Providers</h3>
                <p className="text-3xl font-bold text-slate-800 mt-2">{users.filter(u => u.role === 'PROVIDER').length}</p>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-slate-200">
            <button 
                onClick={() => setActiveTab('BOOKINGS')}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'BOOKINGS' ? 'bg-white border border-b-0 text-accent' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <span className="flex items-center gap-2"><ClipboardList size={16}/> All Bookings</span>
            </button>
            <button 
                onClick={() => setActiveTab('REGISTRATIONS')}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'REGISTRATIONS' ? 'bg-white border border-b-0 text-accent' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <span className="flex items-center gap-2"><Briefcase size={16}/> Registrations</span>
            </button>
            <button 
                onClick={() => setActiveTab('USERS')}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'USERS' ? 'bg-white border border-b-0 text-accent' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <span className="flex items-center gap-2"><UserPlus size={16}/> User Management</span>
            </button>
        </div>

        {/* Tab Content: Bookings */}
        {activeTab === 'BOOKINGS' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Customer Details</th>
                                <th className="p-4">Service & Price</th>
                                <th className="p-4">Schedule</th>
                                <th className="p-4">Assigned To</th>
                                <th className="p-4">Quick Assign</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length > 0 ? bookings.map((booking) => (
                                <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-4 font-mono text-[10px] text-slate-400">#{booking.id.slice(-6)}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900">{booking.customerName}</div>
                                        <div className="text-xs text-slate-500 font-mono">{booking.customerPhone}</div>
                                        <div className="text-[10px] text-slate-400 truncate max-w-[150px] mt-1">{booking.address}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-slate-800">{booking.serviceName}</div>
                                        <div className="flex items-center gap-1 text-accent font-bold mt-0.5">
                                            <CreditCard size={12}/>
                                            <span>₹{booking.price}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 italic">{booking.category}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5 text-slate-700">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span className="font-medium">{booking.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                                            <Clock size={14} className="text-slate-400" />
                                            <span className="text-xs">{booking.time}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {booking.providerId ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                    {booking.providerId.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-slate-700">{booking.providerId}</span>
                                            </div>
                                        ) : (
                                            <span className="text-orange-500 italic text-xs flex items-center gap-1 font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                                                Unassigned
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="relative flex items-center gap-2">
                                            <ArrowRightLeft size={14} className="text-slate-400" />
                                            <select 
                                                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs w-32 outline-none focus:border-accent"
                                                value={booking.providerId || ''}
                                                onChange={(e) => onAssignBooking(booking.id, e.target.value)}
                                            >
                                                <option value="">Select Provider</option>
                                                {users
                                                    .filter(u => u.role === 'PROVIDER' && u.category === booking.category)
                                                    .map(u => (
                                                        <option key={u.username} value={u.username}>{u.name}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                            booking.status === 'ASSIGNED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-slate-500 bg-slate-50/50">
                                        <div className="flex flex-col items-center">
                                            <ClipboardList size={40} className="text-slate-200 mb-2"/>
                                            <p>No bookings found in the system.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Tab Content: Registrations */}
        {activeTab === 'REGISTRATIONS' && (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Phone</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Exp (Yrs)</th>
                                <th className="p-4">City</th>
                                <th className="p-4 text-right">Submitted At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrations.length > 0 ? registrations.map((reg) => (
                                <tr key={reg.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-4 font-bold text-slate-900">{reg.fullName}</td>
                                    <td className="p-4 font-mono">{reg.phone}</td>
                                    <td className="p-4">
                                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">{reg.category}</span>
                                    </td>
                                    <td className="p-4 text-center font-medium">{reg.experience}</td>
                                    <td className="p-4">{reg.city}</td>
                                    <td className="p-4 text-xs text-slate-400 text-right">{new Date(reg.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-500">No applications yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
             </div>
        )}

        {/* Tab Content: User Management */}
        {activeTab === 'USERS' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create User Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Plus size={20} className="text-accent"/> Create New Provider ID
                    </h3>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input 
                                type="text" 
                                required
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-accent outline-none"
                                value={newUser.name}
                                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-accent outline-none"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-accent outline-none"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                />
                             </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category (for Providers)</label>
                            <select 
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-accent outline-none bg-white"
                                value={newUser.category}
                                onChange={(e) => setNewUser({...newUser, category: e.target.value as CategoryType})}
                            >
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800">
                            Create Account
                        </button>
                    </form>
                </div>

                {/* Existing Users List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Existing Accounts</h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {users.map((user, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                                <div>
                                    <div className="font-bold text-sm text-slate-800">{user.name}</div>
                                    <div className="text-xs text-slate-500">@{user.username}</div>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                    <div className="flex flex-col items-end">
                                        <span className={`text-xs px-2 py-1 rounded ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.role}
                                        </span>
                                        {user.category && <div className="text-[10px] text-slate-400 mt-1">{user.category}</div>}
                                    </div>
                                    {user.role !== 'ADMIN' && (
                                        <button 
                                            onClick={() => onDeleteUser(user.username)}
                                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
