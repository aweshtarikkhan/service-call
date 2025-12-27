
import { createClient } from '@supabase/supabase-js';
import { INITIAL_USERS, INITIAL_BOOKINGS, INITIAL_REGISTRATIONS } from '../constants';
import type { User, BookingDetails, RegistrationForm, CategoryType } from '../types';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * We access these via process.env which is replaced by Vite's define config.
 * We use a helper to prevent crashing if process.env is missing in certain environments.
 */
const getEnvVar = (key: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'): string => {
  try {
    // Vite's 'define' replaces these literal strings
    if (key === 'VITE_SUPABASE_URL') return process.env.VITE_SUPABASE_URL || '';
    if (key === 'VITE_SUPABASE_ANON_KEY') return process.env.VITE_SUPABASE_ANON_KEY || '';
    return '';
  } catch (e) {
    console.warn(`Could not access environment variable: ${key}`);
    return '';
  }
};

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Checks if the user has actually set the keys
export const isSupabaseConfigured = 
  !!SUPABASE_URL && 
  !!SUPABASE_ANON_KEY && 
  SUPABASE_URL.startsWith('https://');

// Create the client
export const supabase = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (!isSupabaseConfigured) {
  console.warn("⚠️ Supabase Credentials missing or invalid. Check your vite.config.ts.");
}

// ============================================================================
// DATA MAPPERS (Snake Case to Camel Case)
// ============================================================================

const mapBooking = (b: any): BookingDetails => ({
  id: b.id.toString(),
  serviceId: b.service_id,
  serviceName: b.service_name,
  category: b.category as CategoryType,
  date: b.date,
  time: b.time,
  address: b.address,
  customerName: b.customer_name,
  customerPhone: b.customer_phone,
  price: Number(b.price),
  status: b.status,
  providerId: b.provider_id,
  createdAt: b.created_at
});

const mapReg = (r: any): RegistrationForm => ({
  id: r.id.toString(),
  fullName: r.full_name,
  phone: r.phone,
  category: r.category,
  experience: r.experience,
  city: r.city,
  submittedAt: r.submitted_at
});

// ============================================================================
// DATA API
// ============================================================================

// Local memory storage (fallback if no DB connected)
let localUsers = [...INITIAL_USERS];
let localBookings = [...INITIAL_BOOKINGS];
let localRegistrations = [...INITIAL_REGISTRATIONS];

export const api = {
  
  fetchAllData: async () => {
    if (!supabase) {
      return {
        users: localUsers,
        bookings: localBookings,
        registrations: localRegistrations
      };
    }

    try {
      const [usersRes, bookingsRes, regRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('registrations').select('*').order('submitted_at', { ascending: false })
      ]);

      if (usersRes.error) throw usersRes.error;
      if (bookingsRes.error) throw bookingsRes.error;
      if (regRes.error) throw regRes.error;

      return {
        users: (usersRes.data || []) as User[],
        bookings: (bookingsRes.data || []).map(mapBooking),
        registrations: (regRes.data || []).map(mapReg)
      };

    } catch (error) {
      console.error("Supabase fetch error:", error);
      return { users: localUsers, bookings: localBookings, registrations: localRegistrations };
    }
  },

  createBooking: async (booking: Omit<BookingDetails, 'id' | 'createdAt' | 'status'>) => {
    if (!supabase) {
      const localNewBooking: BookingDetails = {
        ...booking,
        id: `local-${Date.now()}`,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      localBookings = [localNewBooking, ...localBookings];
      return localNewBooking;
    }

    const { data, error } = await supabase.from('bookings').insert([{
      service_id: booking.serviceId,
      service_name: booking.serviceName,
      category: booking.category,
      date: booking.date,
      time: booking.time,
      address: booking.address,
      customer_name: booking.customerName,
      customer_phone: booking.customerPhone,
      price: booking.price,
      status: 'PENDING'
    }]).select();
    
    if (error) throw error;
    return mapBooking(data[0]);
  },

  updateBooking: async (bookingId: string, updates: Partial<BookingDetails>) => {
    if (!supabase) {
      localBookings = localBookings.map(b => b.id === bookingId ? { ...b, ...updates } : b);
      return;
    }

    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.providerId !== undefined) dbUpdates.provider_id = updates.providerId;

    const { error } = await supabase.from('bookings').update(dbUpdates).eq('id', bookingId);
    if (error) throw error;
  },

  createRegistration: async (reg: Omit<RegistrationForm, 'id' | 'submittedAt'>) => {
    if (!supabase) {
      const localNewReg: RegistrationForm = {
        ...reg,
        id: `reg-${Date.now()}`,
        submittedAt: new Date().toISOString()
      };
      localRegistrations = [localNewReg, ...localRegistrations];
      return localNewReg;
    }

    const { data, error } = await supabase.from('registrations').insert([{
      full_name: reg.fullName,
      phone: reg.phone,
      category: reg.category,
      experience: reg.experience,
      city: reg.city
    }]).select();

    if (error) throw error;
    return mapReg(data[0]);
  },

  createUser: async (user: User) => {
    if (!supabase) {
      localUsers = [...localUsers, user];
      return;
    }

    const { error } = await supabase.from('users').insert([{
      username: user.username,
      password: user.password,
      role: user.role,
      name: user.name,
      category: user.category
    }]);
    
    if (error) throw error;
  },

  deleteUser: async (username: string) => {
    if (!supabase) {
      localUsers = localUsers.filter(u => u.username !== username);
      return;
    }

    const { error } = await supabase.from('users').delete().eq('username', username);
    if (error) throw error;
  }
};
