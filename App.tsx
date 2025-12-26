import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Search, MapPin, Phone, ShieldCheck, Star, Sparkles, LogIn, 
  User as UserIcon, LogOut, Loader2, Wind, Droplets, Zap, Palette, 
  Scissors, Flower2, Bug, Hammer, Car, Users, HardHat, UserCheck, 
  Construction, Layers 
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

const App: React.FC = () => {
  // --- STATE INITIALIZATION WITH PERSISTENCE ---
  
  // 1. Initialize View from LocalStorage (or default to 'HOME')
  const [view, setView] = useState<ViewState>(() => {
    const savedView = localStorage.getItem('service_on_call_view');
    return (savedView as ViewState) || 'HOME';
  });

  // 2. Initialize Category from LocalStorage
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(() => {
    const savedCat = localStorage.getItem('service_on_call_category');
    return savedCat ? (savedCat as CategoryType) : null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  // --- PERSISTENCE EFFECTS ---

  // Save View whenever it changes
  useEffect(() => {
    localStorage.setItem('service_on_call_view', view);
  }, [view]);

  // Save Category whenever it changes
  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem('service_on_call_category', selectedCategory);
      // Also restore the filtered services for this category
      setFilteredServices(SERVICES.filter(s => s.category === selectedCategory));
    } else {
      localStorage.removeItem('service_on_call_category');
    }
  }, [selectedCategory]);

  // Check for User Session (Updated to NOT force dashboard redirect)
  useEffect(() => {
    const savedUser = localStorage.getItem('service_on_call_auth');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        // We DO NOT force setView('DASHBOARD') here anymore.
        // The view state initialization above handles the location.
      } catch (e) {
        localStorage.removeItem('service_on_call_auth');
      }
    }
  }, []);

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
      localStorage.setItem('service_on_call_auth', JSON.stringify(user));
      setCurrentUser(user);
      // We manually set dashboard on explicit login action
      setView('DASHBOARD');
  };

  const handleLogout = () => {
      localStorage.removeItem('service_on_call_auth');
      localStorage.removeItem('service_on_call_view');
      localStorage.removeItem('service_on_call_category');
      setCurrentUser(null);
      setView('HOME');
  };

  const handleCategorySelect = (category: CategoryType) => {
    setSelectedCategory(category);
    // filteredServices will be updated by useEffect
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

  const navigateTo = (newView: ViewState) => {
    setView(newView);
    if (newView === 'HOME') setSelectedCategory(null);
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
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
                  <p className="text-slate-500 font-medium">Connecting to Database...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigateTo('HOME')}
          >
            <div className="bg-accent w-8 h-8 rounded-lg flex items-center justify-center text-white">
              <Phone size={18} fill="currentColor" />
            </div>
            <span className="font-bold text-xl tracking-tight text-primary">Service on Call</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigateTo('HOME')} className={`text-sm font-medium hover:text-accent ${view === 'HOME' ? 'text-accent' : 'text-slate-600'}`}>Home</button>
            <button onClick={() => navigateTo('ABOUT_US')} className={`text-sm font-medium hover:text-accent ${view === 'ABOUT_US' ? 'text-accent' : 'text-slate-600'}`}>About Us</button>
            <button onClick={() => navigateTo('REGISTER_PROFESSIONAL')} className={`text-sm font-medium hover:text-accent ${view === 'REGISTER_PROFESSIONAL' ? 'text-accent' : 'text-slate-600'}`}>Register as Professional</button>
            
            {currentUser ? (
                 <div className="flex items-center gap-4">
                     <button onClick={() => navigateTo('DASHBOARD')} className={`flex items-center gap-2 text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 ${view === 'DASHBOARD' ? 'text-accent' : 'text-slate-600'}`}>
                        <UserIcon size={16} /> {currentUser.name}
                     </button>
                     <button onClick={handleLogout} className="text-slate-500 hover:text-red-500" title="Logout">
                        <LogOut size={18} />
                     </button>
                 </div>
            ) : (
                <button 
                    onClick={() => setIsLoginOpen(true)}
                    className="flex items-center gap-2 text-sm font-bold text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <LogIn size={16} /> Login
                </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
           <div className="md:hidden bg-white border-t border-gray-100 p-4 absolute w-full shadow-lg z-50">
             <div className="flex flex-col gap-4">
               {currentUser && (
                   <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between">
                       <span className="font-bold text-slate-800">{currentUser.name}</span>
                       <button onClick={handleLogout} className="text-xs text-red-500 font-bold">LOGOUT</button>
                   </div>
               )}
               <button onClick={() => navigateTo('HOME')} className="text-left font-medium text-slate-800">Home</button>
               {currentUser && (
                    <button onClick={() => navigateTo('DASHBOARD')} className="text-left font-medium text-accent">Dashboard</button>
               )}
               <button onClick={() => navigateTo('ABOUT_US')} className="text-left font-medium text-slate-600">About Us</button>
               <button onClick={() => navigateTo('REGISTER_PROFESSIONAL')} className="text-left font-medium text-slate-600">Register as Partner</button>
               {!currentUser && (
                   <button onClick={() => { setIsLoginOpen(true); setMobileMenuOpen(false); }} className="text-left font-bold text-accent">Login</button>
               )}
             </div>
           </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        {/* Progress Overlay for DB Operations */}
        {isActionInProgress && (
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-slate-100 scale-110">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    <span className="font-bold text-slate-800">Processing...</span>
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

        {/* Search Hero Section (Only on Customer Views) */}
        {view !== 'ABOUT_US' && view !== 'REGISTER_PROFESSIONAL' && view !== 'DASHBOARD' && (
        <div className={`bg-primary text-white transition-all duration-300 ${view === 'HOME' ? 'py-16 md:py-24' : 'py-8'}`}>
          <div className="container mx-auto px-4 text-center">
            {view === 'HOME' && (
              <>
                <h1 className="text-3xl md:text-5xl font-bold mb-4">Quality Services at Your Doorstep</h1>
                <p className="text-slate-300 mb-8 text-lg max-w-2xl mx-auto">Verified professionals for cleaning, repairs, painting & more. Trusted by thousands in your local area.</p>
              </>
            )}
            
            <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
              <input 
                type="text" 
                placeholder="What are you looking for? (e.g., 'AC is not cooling')" 
                className="w-full h-14 pl-12 pr-4 rounded-xl text-slate-900 outline-none focus:ring-4 focus:ring-accent/30 shadow-lg placeholder-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <button 
                type="submit" 
                className="absolute right-2 top-2 bottom-2 bg-accent hover:bg-accent-hover text-white px-6 rounded-lg font-medium transition-colors"
              >
                {isSearching ? '...' : 'Search'}
              </button>
            </form>
            
            {view === 'HOME' && (
                 <div className="flex justify-center gap-6 mt-8 text-sm text-slate-300">
                    <span className="flex items-center gap-1"><ShieldCheck size={16} className="text-green-400"/> Verified Experts</span>
                    <span className="flex items-center gap-1"><Star size={16} className="text-yellow-400"/> 4.8+ Rated</span>
                 </div>
            )}
          </div>
        </div>
        )}

        {/* View: HOME */}
        {view === 'HOME' && (
          <>
            {/* Categories Grid */}
            <section className="py-12 container mx-auto px-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-8">All Services</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {CATEGORIES.map((cat, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleCategorySelect(cat)}
                    className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-accent transition-all cursor-pointer flex flex-col items-center text-center gap-3 group"
                  >
                     <div className="w-12 h-12 rounded-full bg-blue-50 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                        {getCategoryIcon(cat)}
                     </div>
                     <span className="font-medium text-slate-700 group-hover:text-accent">{cat}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Services */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-slate-800 mb-8">Most Booking Services</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {SERVICES.slice(0, 4).map(service => (
                            <ServiceCard key={service.id} service={service} onBook={handleBookService} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Providers Section */}
            <section className="py-12 bg-slate-50">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Meet Our Experts</h2>
                        <p className="text-slate-500 mt-1">Top rated professionals ready to help</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {getRelevantProviders().map(provider => (
                        <ProviderCard key={provider.id} provider={provider} />
                    ))}
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 bg-white border-t border-slate-200">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-slate-800 mb-10 text-center">What our customers say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {TESTIMONIALS.map(t => (
                            <div key={t.id} className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-100">
                                <p className="text-slate-600 mb-6 italic">"{t.content}"</p>
                                <div className="flex items-center gap-3">
                                    <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                                        <p className="text-xs text-slate-500">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
          </>
        )}

        {/* View: CATEGORY or SEARCH RESULTS */}
        {(view === 'CATEGORY' || view === 'SEARCH_RESULTS') && (
            <div className="container mx-auto px-4">
                <section className="py-12 min-h-[50vh]">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">
                                {view === 'SEARCH_RESULTS' ? `Search Results` : selectedCategory}
                            </h2>
                            {aiReasoning && (
                                <div className="mt-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm flex items-start gap-2 max-w-2xl">
                                    <Sparkles size={16} className="mt-1 flex-shrink-0" />
                                    <p>{aiReasoning}</p>
                                </div>
                            )}
                            <p className="text-slate-500 mt-1">
                                {filteredServices.length} service options available
                            </p>
                        </div>
                        {view === 'SEARCH_RESULTS' && (
                            <button onClick={() => setView('HOME')} className="text-accent font-medium hover:underline">
                                View All Categories
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1">
                             {filteredServices.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredServices.map(service => (
                                        <ServiceCard key={service.id} service={service} onBook={handleBookService} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
                                    <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="text-slate-400" size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700">No services found</h3>
                                    <p className="text-slate-500 mt-2">Try adjusting your search or browse our categories.</p>
                                    <button 
                                        onClick={() => {setView('HOME'); setSearchQuery('');}} 
                                        className="mt-6 bg-accent text-white px-6 py-2 rounded-lg"
                                    >
                                        Back to Home
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {view === 'CATEGORY' && (
                    <section className="py-12 border-t border-slate-200">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Professionals in {selectedCategory}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                             {getRelevantProviders().length > 0 ? (
                                getRelevantProviders().map(provider => (
                                    <ProviderCard key={provider.id} provider={provider} />
                                ))
                             ) : (
                                 <p className="text-slate-500 col-span-4">We are currently onboarding partners for this category in your area.</p>
                             )}
                        </div>
                    </section>
                )}
            </div>
        )}

        {/* View: ABOUT US */}
        {view === 'ABOUT_US' && <AboutUs />}

        {/* View: REGISTER PROFESSIONAL */}
        {view === 'REGISTER_PROFESSIONAL' && (
            <RegisterProfessional onSubmit={handleRegistrationSubmit} />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
                <div className="flex items-center gap-2 mb-4 text-white">
                    <div className="bg-accent w-8 h-8 rounded-lg flex items-center justify-center">
                        <Phone size={18} fill="currentColor" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">Service on Call</span>
                </div>
                <p className="text-sm text-slate-400">
                    Your trusted partner for all home services. Fast, reliable, and verified experts at your doorstep.
                </p>
            </div>
            
            <div>
                <h4 className="font-bold text-white mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                    <li><button onClick={() => navigateTo('ABOUT_US')} className="hover:text-white">About Us</button></li>
                    <li><button onClick={() => navigateTo('HOME')} className="hover:text-white">Services</button></li>
                    <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-white mb-4">For Partners</h4>
                <ul className="space-y-2 text-sm">
                    <li><button onClick={() => navigateTo('REGISTER_PROFESSIONAL')} className="hover:text-white">Register as a Professional</button></li>
                    <li><a href="#" className="hover:text-white">Partner Support</a></li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-white mb-4">Contact</h4>
                <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><MapPin size={16}/> Karnal, Haryana</li>
                    <li className="flex items-center gap-2"><Phone size={16}/> +91 98765 43210</li>
                </ul>
            </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            © 2024 Service on Call. All rights reserved.
        </div>
      </footer>

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