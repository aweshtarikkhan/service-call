
import { CategoryType, type Service, type Testimonial, type Provider, type User, type BookingDetails, type RegistrationForm } from './types';

export const CATEGORIES = Object.values(CategoryType);

export const SERVICES: Service[] = [
  // AC & Appliance Repair
  {
    id: 'ac1',
    name: 'Split AC Gas Charging',
    description: 'Complete gas refill with leak testing and pressure check.',
    price: 2499,
    rating: 4.8,
    reviews: 1250,
    image: 'https://images.unsplash.com/photo-1590756254933-2873d72a83b6?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.AC_APPLIANCE,
    duration: '1.5 Hours'
  },
  {
    id: 'ac2',
    name: 'Washing Machine Checkup',
    description: 'Repair for drain issues, drum noise, or electrical faults.',
    price: 299,
    rating: 4.7,
    reviews: 890,
    image: 'https://images.unsplash.com/photo-1582733711316-f4d0484ebf1b?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.AC_APPLIANCE,
    duration: '45 mins'
  },
  {
    id: 'ac3',
    name: 'Microwave/Oven Repair',
    description: 'Heating issues, keypad repair, or power supply faults.',
    price: 399,
    rating: 4.6,
    reviews: 420,
    image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.AC_APPLIANCE,
    duration: '1 Hour'
  },

  // Home Cleaning
  {
    id: 'cl1',
    name: 'Full Home Deep Cleaning',
    description: 'Intense machine cleaning of all rooms, kitchen, and toilets.',
    price: 3499,
    rating: 4.9,
    reviews: 2100,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.CLEANING,
    duration: '5-6 Hours'
  },
  {
    id: 'cl2',
    name: 'Sofa/Carpet Spa',
    description: 'Dry vacuuming and wet shampooing for deep stain removal.',
    price: 599,
    rating: 4.8,
    reviews: 430,
    image: 'https://images.unsplash.com/photo-1556911220-e15595b6a781?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.CLEANING,
    duration: '2 Hours'
  },

  // Pest Control
  {
    id: 'pc1',
    name: 'General Pest Control',
    description: 'Spray treatment for cockroaches, ants, and spiders.',
    price: 799,
    rating: 4.8,
    reviews: 650,
    image: 'https://images.unsplash.com/photo-1583244532610-2ca22111b285?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.PEST_CONTROL,
    duration: '1 Hour'
  },
  {
    id: 'pc2',
    name: 'Termite Protection (Warranty)',
    description: 'Drill-fill-seal treatment to protect all wooden fittings.',
    price: 2499,
    rating: 4.9,
    reviews: 320,
    image: 'https://images.unsplash.com/photo-1511174511562-5f7f185854c8?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.PEST_CONTROL,
    duration: '3 Hours'
  },
  {
    id: 'pc3',
    name: 'Mosquito Fogging Service',
    description: 'Fogging for outdoors and gardens to prevent malaria/dengue.',
    price: 499,
    rating: 4.5,
    reviews: 150,
    image: 'https://images.unsplash.com/photo-1584622781564-27928b577000?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.PEST_CONTROL,
    duration: '30 mins'
  },

  // Carpentry
  {
    id: 'cp1',
    name: 'Furniture Repair',
    description: 'Fixing loose hinges, drawer sliders, or broken handles.',
    price: 249,
    rating: 4.8,
    reviews: 890,
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.CARPENTRY,
    duration: '45 mins'
  },
  {
    id: 'cp2',
    name: 'New Wardrobe Making',
    description: 'Customized plywood wardrobes with sunmica finish.',
    price: 12000,
    rating: 4.9,
    reviews: 430,
    image: 'https://images.unsplash.com/photo-1551000100-33671239c0d3?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.CARPENTRY,
    duration: '3-5 Days'
  },
  {
    id: 'cp3',
    name: 'Door/Window Fitting',
    description: 'Installation of new wooden doors, frames, or mesh screens.',
    price: 800,
    rating: 4.7,
    reviews: 560,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.CARPENTRY,
    duration: '2 Hours'
  },

  // House Helper (Bai)
  {
    id: 'hh1',
    name: 'Regular House Cleaning (Bai)',
    description: 'Sweeping, mopping, and dusting helper for your home.',
    price: 499,
    rating: 4.6,
    reviews: 1200,
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.HOUSE_HELPER,
    duration: '8 Hours'
  },
  {
    id: 'hh2',
    name: 'Utensil/Dish Cleaning',
    description: 'Dedicated helper for cleaning kitchen vessels and dishes.',
    price: 199,
    rating: 4.8,
    reviews: 870,
    image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.HOUSE_HELPER,
    duration: '1 Hour'
  },
  {
    id: 'hh3',
    name: 'Cooking Assistance',
    description: 'Helper to cut vegetables and assist in daily meal prep.',
    price: 599,
    rating: 4.5,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.HOUSE_HELPER,
    duration: '4 Hours'
  },

  // Plumbing
  {
    id: 'pl1',
    name: 'Water Tank Deep Cleaning',
    description: 'High-pressure cleaning for overhead or underground tanks.',
    price: 999,
    rating: 4.8,
    reviews: 450,
    image: 'https://images.unsplash.com/photo-1605333396915-47ed6b68a00e?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.PLUMBING,
    duration: '2 Hours'
  },
  {
    id: 'pl2',
    name: 'Tap & Leakage Repair',
    description: 'Fixing leaking faucets, pipes, or new tap installation.',
    price: 149,
    rating: 4.7,
    reviews: 3100,
    image: 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.PLUMBING,
    duration: '30 mins'
  },

  // Electrician
  {
    id: 'el1',
    name: 'Inverter Repair/Setup',
    description: 'Fixing backup issues or installing new inverter batteries.',
    price: 499,
    rating: 4.9,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.ELECTRICIAN,
    duration: '1 Hour'
  },

  // Painting & Renovation
  {
    id: 'pt1',
    name: 'Interior Wall Painting',
    description: 'Putty, primer, and top-coat painting for home interiors.',
    price: 15000,
    rating: 4.9,
    reviews: 340,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.PAINTING,
    duration: '5 Days'
  },
  {
    id: 'pt2',
    name: 'Waterproofing Service',
    description: 'Roof or wall treatment to stop seepage and dampness.',
    price: 5000,
    rating: 4.8,
    reviews: 120,
    image: 'https://images.unsplash.com/photo-1595844730298-b960ff98fee0?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.PAINTING,
    duration: '2 Days'
  },

  // Mistri (Mason)
  {
    id: 'ms1',
    name: 'Floor Tile Fitting',
    description: 'Precision tile installation for bedrooms, kitchen, or halls.',
    price: 45,
    rating: 4.8,
    reviews: 190,
    image: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.MISTRI,
    duration: 'Per Sq Ft'
  },

  // Welding
  {
    id: 'wd1',
    name: 'Iron Gate/Grill Repair',
    description: 'Welding and fixing of iron gates, shutters, or window grills.',
    price: 450,
    rating: 4.8,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=400',
    category: CategoryType.WELDING,
    duration: 'Per Job'
  }
];

export const PROVIDERS: Provider[] = [
  {
    id: 'p1',
    name: 'Vikram Singh',
    rating: 4.9,
    bio: 'Expert electrician with over 8 years of experience in residential wiring.',
    image: 'https://picsum.photos/200/200?random=50',
    categories: [CategoryType.ELECTRICIAN, CategoryType.AC_APPLIANCE],
    completedJobs: 1240,
    experience: '8 Years'
  },
  {
    id: 'p2',
    name: 'Sunita Sharma',
    rating: 4.8,
    bio: 'Certified beautician specializing in bridal makeup and skin treatments.',
    image: 'https://picsum.photos/200/200?random=55',
    categories: [CategoryType.BEAUTY_WOMEN],
    completedJobs: 890,
    experience: '5 Years'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "Local Shop Owner",
    content: "Service on Call is a blessing for our town. The welder fixed my shop's shutter perfectly.",
    image: "https://picsum.photos/100/100?random=20"
  }
];

export const INITIAL_USERS: User[] = [
    { username: 'admin', password: 'password', role: 'ADMIN', name: 'Super Admin' }
];

export const INITIAL_BOOKINGS: BookingDetails[] = [];
export const INITIAL_REGISTRATIONS: RegistrationForm[] = [];
