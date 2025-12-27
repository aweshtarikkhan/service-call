
import React, { useState, useEffect } from 'react';
import { Signal, Wifi, BatteryMedium } from 'lucide-react';

const MobileStatusBar: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-primary text-white h-8 px-4 flex justify-between items-center text-[11px] font-medium sticky top-0 z-[60] select-none">
      <div className="flex items-center gap-1">
        <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Signal size={12} />
        <Wifi size={12} />
        <BatteryMedium size={14} className="rotate-0" />
      </div>
    </div>
  );
};

export default MobileStatusBar;
