
import React, { useState } from 'react';
import type { Service, BookingDetails, CategoryType } from '../types';
import { X, Calendar, Clock, MapPin, User, Phone, CheckCircle } from 'lucide-react';

interface BookingModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (details: Omit<BookingDetails, 'id' | 'createdAt' | 'status'>) => Promise<void>;
}

const BookingModal: React.FC<BookingModalProps> = ({ service, isOpen, onClose, onConfirmBooking }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    address: '',
    name: '',
    phone: ''
  });

  if (!isOpen) return null;

  // Get today's date in YYYY-MM-DD format for the 'min' attribute
  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onConfirmBooking({
        serviceId: service.id,
        serviceName: service.name,
        category: service.category as CategoryType,
        date: formData.date,
        time: formData.time,
        address: formData.address,
        customerName: formData.name,
        customerPhone: formData.phone,
        price: service.price
      });
      setStep(3); // Success state
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setFormData({ date: '', time: '', address: '', name: '', phone: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        {step < 3 && (
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X size={24} />
            </button>
        )}

        {/* Step 1: Slot Selection */}
        {step === 1 && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-primary mb-1">Book {service.name}</h2>
            <p className="text-sm text-gray-500 mb-6">Step 1 of 2: Select Date & Time</p>
            
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Calendar size={16} /> Date
                  </label>
                  <input 
                    type="date" 
                    name="date"
                    required
                    min={today}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                    onChange={handleChange}
                    value={formData.date}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Clock size={16} /> Time
                  </label>
                  <select 
                    name="time" 
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none bg-white"
                    onChange={handleChange}
                    value={formData.time}
                  >
                    <option value="">Select a time slot</option>
                    <option value="09:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="11:00 AM">11:00 AM - 12:00 PM</option>
                    <option value="02:00 PM">02:00 PM - 03:00 PM</option>
                    <option value="05:00 PM">05:00 PM - 06:00 PM</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button type="submit" className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-semibold w-full">
                  Next Details
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Address & Contact */}
        {step === 2 && (
          <div className="p-6">
             <h2 className="text-xl font-bold text-primary mb-1">Confirm Details</h2>
             <p className="text-sm text-gray-500 mb-6">Step 2 of 2: Your Information</p>

             <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <User size={16} /> Name
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    placeholder="Enter your full name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                    onChange={handleChange}
                    value={formData.name}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Phone size={16} /> Phone Number
                  </label>
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    placeholder="Mobile number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                    onChange={handleChange}
                    value={formData.phone}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <MapPin size={16} /> Address
                  </label>
                  <input 
                    type="text"
                    name="address"
                    required
                    placeholder="House No, Street, Landmark"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                    onChange={handleChange}
                    value={formData.address}
                  />
                </div>
              </div>

              <div className="mt-4 bg-blue-50 p-3 rounded-md text-sm text-blue-800">
                <p className="font-semibold">Estimated Total: ₹{service.price}</p>
                <p className="text-xs mt-1">Pay via Cash/UPI after service completion.</p>
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  disabled={loading}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex justify-center items-center"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : 'Confirm Booking'}
                </button>
              </div>
             </form>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Received!</h2>
            <p className="text-gray-600 mb-6 text-sm">
              We have received your booking request. We will assign a professional agent to you as soon as possible. You will receive a confirmation call shortly.
            </p>

            <button 
              onClick={resetAndClose}
              className="bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-lg font-semibold w-full shadow-lg"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
