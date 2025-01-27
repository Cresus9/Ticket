export const mockNotifications = [
  {
    id: '1',
    title: 'Welcome to AfriTix',
    message: 'Thank you for joining our platform!',
    type: 'SUCCESS',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'New Event Alert',
    message: 'A new event has been added in your area',
    type: 'INFO',
    read: false,
    createdAt: new Date().toISOString()
  }
];

export const mockLocations = [
  'Accra',
  'Lagos',
  'Nairobi',
  'Cape Town',
  'Johannesburg',
  'Dar es Salaam'
];

export const mockCategories = [
  'Music',
  'Sports',
  'Arts',
  'Cultural',
  'Business',
  'Technology'
];

export const mockEvents = [
  {
    id: '1',
    title: 'Afro Nation Ghana 2024',
    description: 'The biggest Afrobeats festival in Africa',
    date: '2024-12-15',
    time: '18:00',
    location: 'Accra Sports Stadium',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
    price: 150,
    currency: 'GHS',
    capacity: 20000,
    ticketsSold: 15000,
    status: 'PUBLISHED',
    categories: ['Music', 'Festival']
  },
  {
    id: '2',
    title: 'Lagos Jazz Festival',
    description: 'A celebration of jazz music',
    date: '2024-11-20',
    time: '19:30',
    location: 'Eko Hotel & Suites',
    imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae',
    price: 25000,
    currency: 'NGN',
    capacity: 5000,
    ticketsSold: 3500,
    status: 'PUBLISHED',
    categories: ['Music', 'Jazz']
  }
];