
import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Search, MapPin, Phone, ShieldCheck, Star, Sparkles, LogIn, 
  User as UserIcon, LogOut, Loader2, Wind, Droplets, Zap, Palette, 
  Scissors, Flower2, Bug, Hammer, Car, Users, HardHat, UserCheck, 
  Construction, Layers, Bell
} from 'lucide-react';
import { CATEGORIES, SERVICES, TESTIMONIALS, PROVIDERS } from './constants';
import { CategoryType, type Service, type ViewState, type User, type BookingDetails, type RegistrationForm } from './types';
import { api } from './services/supabaseClient'; 
import ServiceCard from './components/ServiceCard';
import ProviderCard from './components/ProviderCard';
import BookingModal from './components/BookingModal';
import AboutUs from './components/AboutUs';
import RegisterProfessional from './components/RegisterProfessional';
import LoginModal from './components/LoginModal';
import AdminDashboard from './components/AdminDashboard';
import ProviderDashboard from './components/ProviderDashboard';
import { getServiceRecommendation } from './services/geminiService';
import MobileBottomNav from './components/MobileBottomNav';

const App: React.FC = () => {
  // Navigation & View State
  const [view, setView] = useState<ViewState>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationForm[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Booking Flow State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  // AI Search State
  const [isSearching, setIsSearching] = useState(false);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [filteredServices, setFilteredServices] = useState<Service[]>(SERVICES);

  // --- INITIAL DATA LOAD ---
  const refreshData = async () => {
    try {
      const data = await api.fetchAllData();
      setUsers(data.users);
      setBookings(data.bookings);
      setRegistrations(data.registrations);
    } catch (err) {
      console.error("Failed to refresh data", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // --- Helpers ---

  const getCategoryIcon = (category: CategoryType) => {
    switch (category) {
      case CategoryType.AC_APPLIANCE: return <Wind size={24} />;
      case CategoryType.CLEANING: return <Sparkles size={24} />;
      case CategoryType.PLUMBING: return <Droplets size={24} />;
      case CategoryType.ELECTRICIAN: return <Zap size={24} />;
      case CategoryType.PAINTING: return <Palette size={24} />;
      case CategoryType.BEAUTY_MEN: return <Scissors size={24} />;
      case CategoryType.BEAUTY_WOMEN: return <Flower2 size={24} />;
      case CategoryType.PEST_CONTROL: return <Bug size={24} />;
      case CategoryType.CARPENTRY: return <Hammer size={24} />;
      case CategoryType.CAR_RENTAL: return <Car size={24} />;
      case CategoryType.LABOUR: return <Users size={24} />;
      case CategoryType.MISTRI: return <HardHat size={24} />;
      case CategoryType.HOUSE_HELPER: return <UserCheck size={24} />;
      case CategoryType.WELDING: return <Construction size={24} />;
      case CategoryType.ROOF_PANEL: return <Layers size={24} />;
      default: return <Sparkles size={24} />;
    }
  };

  // --- Handlers ---

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = async (details: Omit<BookingDetails, 'id' | 'createdAt' | 'status'>) => {
      setIsActionInProgress(true);
      try {
        await api.createBooking(details);
        await refreshData();
      } catch (err) {
        alert("Booking failed. Please check your internet connection and try again.");
      } finally {
        setIsActionInProgress(false);
      }
  };

  const handleRegistrationSubmit = async (data: Omit<RegistrationForm, 'id' | 'submittedAt'>) => {
      setIsActionInProgress(true);
      try {
        await api.createRegistration(data);
        await refreshData();
      } catch (err) {
        alert("Registration failed. Please check your internet connection.");
      } finally {
        setIsActionInProgress(false);
      }
  };

  const handleAddUser = async (user: User) => {
      setIsActionInProgress(true);
      try {
        await api.createUser(user);
        await refreshData();
      } catch (err) {
        alert("Failed to create user. This username might already be taken.");
      } finally {
        setIsActionInProgress(false);
      }
  };

  const handleDeleteUser = async (username: string) => {
    if (window.confirm(`Are you sure you want to delete user ${username}?`)) {
        setIsActionInProgress(true);
        try {
            await api.deleteUser(username);
            if (currentUser?.username === username) {
                handleLogout();
            }
            await refreshData();
        } catch (err) {
            alert("Failed to delete user. Please try again.");
        } finally {
            setIsActionInProgress(false);
        }
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
      if (!currentUser) return;
      setIsActionInProgress(true);
      try {
        await api.updateBooking(bookingId, { status: 'ASSIGNED', providerId: currentUser.username });
        await refreshData();
      } catch (err) {
        alert("Failed to accept booking.");
      } finally {
        setIsActionInProgress(false);
      }
  };

  const handleAssignBooking = async (bookingId: string, providerUsername: string) => {
      setIsActionInProgress(true);
      try {
        await api.updateBooking(bookingId, { status: 'ASSIGNED', providerId: providerUsername || null as any });
        await refreshData();
      } catch (err) {
        alert("Failed to assign booking.");
      } finally {
        setIsActionInProgress(false);
      }
  };

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      setView('DASHBOARD');
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setView('HOME');
  };

  const handleCategorySelect = (category: CategoryType) => {
    setSelectedCategory(category);
    setFilteredServices(SERVICES.filter(s => s.category === category));
    setAiReasoning(null);
    setView('CATEGORY');
    window.scrollTo(0, 0);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
        setView('HOME');
        return;
    }

    setIsSearching(true);
    setView('SEARCH_RESULTS');
    const recommendation = await getServiceRecommendation(searchQuery);
    
    if (recommendation.suggestedServiceIds.length > 0) {
        const matchedServices = SERVICES.filter(s => recommendation.suggestedServiceIds.includes(s.id));
        setFilteredServices(matchedServices);
        setAiReasoning(recommendation.reasoning);
    } else if (recommendation.recommendedCategory) {
        const categoryMatch = Object.values(CategoryType).find(c => c === recommendation.recommendedCategory);
        if (categoryMatch) {
             setFilteredServices(SERVICES.filter(s => s.category === categoryMatch));
        } else {
             const lowerQ = searchQuery.toLowerCase();
             setFilteredServices(SERVICES.filter(s => 
                s.name.toLowerCase().includes(lowerQ) || 
                s.description.toLowerCase().includes(lowerQ) ||
                s.category.toLowerCase().includes(lowerQ)
             ));
        }
        setAiReasoning(recommendation.reasoning);
    } else {
        const lowerQ = searchQuery.toLowerCase();
        const fallback = SERVICES.filter(s => 
            s.name.toLowerCase().includes(lowerQ) || 
            s.description.toLowerCase().includes(lowerQ)
        );
        setFilteredServices(fallback);
        setAiReasoning("Here is what we found matching your search.");
    }
    
    setIsSearching(false);
  };

  const handleBottomNavNavigate = (newView: ViewState) => {
    if (newView === 'DASHBOARD' && !currentUser) {
      setIsLoginOpen(true);
    } else {
      setView(newView);
      window.scrollTo(0, 0);
    }
  };

  const getRelevantProviders = () => {
    if (view === 'CATEGORY' && selectedCategory) {
      return PROVIDERS.filter(p => p.categories.includes(selectedCategory));
    }
    return PROVIDERS.slice(0, 4);
  };

  if (isLoadingData) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Launching Service on Call...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      {/* 
         Black Spacer / Safe Area Line: 
         This ensures the app starts below the system status bar (time/tower).
      */}
      <div className="bg-black h-safe-top sticky top-0 z-50 w-full" />
      
      {/* App Header / Top Bar (Native Mobile Style) */}
      <header className="bg-white sticky top-[env(safe-area-inset-top)] z-40 px-4 h-14 flex items-center justify-between border-b border-slate-100">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => { setView('HOME'); setSelectedCategory(null); setSearchQuery(''); }}
        >
          <div className="bg-accent w-7 h-7 rounded-lg flex items-center justify-center text-white">
            <Phone size={14} fill="currentColor" />
          </div>
          <span className="font-bold text-lg tracking-tight text-primary">Service on Call</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-slate-500 p-1"><Bell size={20} /></button>
          {currentUser && (
            <button onClick={handleLogout} className="text-red-500 p-1" title="Logout">
              <LogOut size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 relative">
        {/* Progress Overlay for DB Operations */}
        {isActionInProgress && (
            <div className="fixed inset-0 bg-white/40 backdrop-blur-[1px] z-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-slate-100 animate-in fade-in zoom-in duration-200">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    <span className="font-bold text-slate-800">Please wait...</span>
                </div>
            </div>
        )}
        
        {/* DASHBOARD VIEW */}
        {view === 'DASHBOARD' && currentUser && (
            currentUser.role === 'ADMIN' ? (
                <AdminDashboard 
                    bookings={bookings} 
                    registrations={registrations} 
                    users={users} 
                    onAddUser={handleAddUser}
                    onDeleteUser={handleDeleteUser}
                    onAssignBooking={handleAssignBooking}
                />
            ) : (
                <ProviderDashboard 
                    user={currentUser} 
                    bookings={bookings} 
                    onAcceptBooking={handleAcceptBooking}
                />
            )
        )}

        {/* Search Hero Section (Always visible or contextual) */}
        {view !== 'ABOUT_US' && view !== 'REGISTER_PROFESSIONAL' && view !== 'DASHBOARD' && (
        <div className={`bg-primary text-white transition-all duration-300 ${view === 'HOME' ? 'pt-8 pb-12' : 'py-6'}`}>
          <div className="container mx-auto px-4">
            {view === 'HOME' && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold leading-tight">Home services at the tap of a button.</h1>
              </div>
            )}
            
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="Search for 'Plumber' or 'Cleaner'..." 
                className="w-full h-12 pl-11 pr-4 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-accent/50 shadow-md placeholder-slate-400 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <button 
                type="submit" 
                className="absolute right-1 top-1 bottom-1 bg-accent text-white px-4 rounded-lg text-xs font-bold"
              >
                {isSearching ? '...' : 'Search'}
              </button>
            </form>
          </div>
        </div>
        )}

        {/* View: HOME */}
        {view === 'HOME' && (
          <div className="animate-in slide-in-from-bottom-2 duration-300">
            {/* Categories Grid - Mobile Optimized (3 columns) */}
            <section className="py-8 container mx-auto px-4">
              <h2 className="text-lg font-extrabold text-slate-800 mb-5">Browse Categories</h2>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map((cat, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleCategorySelect(cat)}
                    className="bg-slate-50 p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center gap-2 border border-slate-100 active:scale-95"
                  >
                     <div className="text-accent flex items-center justify-center">
                        {getCategoryIcon(cat)}
                     </div>
                     <span className="text-[10px] font-bold text-slate-700 leading-tight line-clamp-2">{cat}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Services (Horizontal Scroll on Mobile) */}
            <section className="py-8 bg-slate-50 overflow-hidden">
                <div className="container mx-auto px-4">
                    <h2 className="text-lg font-extrabold text-slate-800 mb-5">Popular Services</h2>
                    <div className="flex overflow-x-auto gap-4 no-scrollbar pb-4 -mx-4 px-4">
                        {SERVICES.slice(0, 6).map(service => (
                            <div key={service.id} className="min-w-[280px] max-w-[280px]">
                                <ServiceCard service={service} onBook={handleBookService} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Expert Providers */}
            <section className="py-8 bg-white">
              <div className="container mx-auto px-4">
                <h2 className="text-lg font-extrabold text-slate-800 mb-5">Top Professionals</h2>
                <div className="flex overflow-x-auto gap-4 no-scrollbar -mx-4 px-4 pb-2">
                    {getRelevantProviders().map(provider => (
                        <div key={provider.id} className="min-w-[200px]">
                          <ProviderCard provider={provider} />
                        </div>
                    ))}
                </div>
              </div>
            </section>

            {/* Registration Banner */}
            <section className="py-8 px-4">
               <div className="bg-slate-900 rounded-3xl p-6 text-white text-center shadow-xl">
                  <h3 className="text-xl font-bold mb-2">Want to work with us?</h3>
                  <p className="text-slate-400 text-sm mb-5">Join 500+ partners and earn more monthly.</p>
                  <button 
                    onClick={() => setView('REGISTER_PROFESSIONAL')}
                    className="bg-accent px-6 py-2.5 rounded-xl font-bold text-sm"
                  >
                    Register Now
                  </button>
               </div>
            </section>
          </div>
        )}

        {/* View: CATEGORY or SEARCH RESULTS */}
        {(view === 'CATEGORY' || view === 'SEARCH_RESULTS') && (
            <div className="container mx-auto px-4 animate-in slide-in-from-right-4 duration-300">
                <section className="py-8 min-h-[50vh]">
                    <div className="mb-6">
                        <h2 className="text-xl font-extrabold text-slate-800">
                            {view === 'SEARCH_RESULTS' ? `Search Results` : selectedCategory}
                        </h2>
                        {aiReasoning && (
                            <div className="mt-3 bg-blue-50 text-blue-800 px-4 py-3 rounded-xl text-xs leading-relaxed border border-blue-100">
                                <Sparkles size={14} className="inline mr-1 text-accent" />
                                {aiReasoning}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                        {filteredServices.length > 0 ? (
                            filteredServices.map(service => (
                                <ServiceCard key={service.id} service={service} onBook={handleBookService} />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-slate-50 rounded-2xl">
                                <Search className="text-slate-300 mx-auto mb-3" size={40} />
                                <h3 className="font-bold text-slate-600">No services found</h3>
                                <button 
                                    onClick={() => setView('HOME')} 
                                    className="mt-4 text-accent font-bold text-sm"
                                >
                                    Browse All Services
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        )}

        {/* View: REGISTER PROFESSIONAL */}
        {view === 'REGISTER_PROFESSIONAL' && (
            <RegisterProfessional onSubmit={handleRegistrationSubmit} />
        )}

      </main>

      {/* Footer / Bottom Nav Bar */}
      <MobileBottomNav 
        currentView={view} 
        onNavigate={handleBottomNavNavigate} 
        isLoggedIn={!!currentUser} 
      />

      {/* Modals */}
      {selectedService && (
        <BookingModal 
          service={selectedService} 
          isOpen={isBookingOpen} 
          onClose={() => {setIsBookingOpen(false); setSelectedService(null);}} 
          onConfirmBooking={handleConfirmBooking}
        />
      )}
      
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={handleLogin}
        users={users}
      />
    </div>
  );
};

export default App;