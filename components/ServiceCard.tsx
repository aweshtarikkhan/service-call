
import React from 'react';
import type { Service } from '../types';
import { Star, Clock, Info } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBook }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col h-full group">
      <div className="relative h-52 w-full overflow-hidden">
        <img 
          src={service.image} 
          alt={service.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
          <Info size={10} /> Professional Service
        </div>
        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur px-2 py-1 rounded-lg text-[11px] font-bold text-white flex items-center gap-1">
          <Clock size={12} className="text-blue-400" /> {service.duration}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-slate-800 line-clamp-1 group-hover:text-accent transition-colors">{service.name}</h3>
            <div className="flex items-center bg-green-50 px-2 py-0.5 rounded-lg text-green-700 text-xs font-bold border border-green-100">
                <Star size={10} className="fill-current mr-1" />
                {service.rating}
            </div>
        </div>
        
        <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{service.description}</p>
        
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Price starting at</span>
            <span className="font-extrabold text-xl text-slate-900">₹{service.price}</span>
          </div>
          <button 
            onClick={() => onBook(service)}
            className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-accent/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
