export const CATEGORIES = [
  {
    id: 'music-concerts',
    name: 'Music Concerts',
    description: 'Live performances from top artists and bands',
    icon: 'music',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae',
    subcategories: ['Afrobeats', 'Jazz', 'Gospel', 'Traditional']
  },
  {
    id: 'cinema',
    name: 'Cinema',
    description: 'Movie premieres and film festivals',
    icon: 'film',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
    subcategories: ['Premieres', 'Film Festivals', 'Independent Films', 'Screenings']
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Major sporting events and tournaments',
    icon: 'trophy',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
    subcategories: ['Football', 'Basketball', 'Athletics', 'Boxing']
  },
  {
    id: 'festivals',
    name: 'Festivals',
    description: 'Cultural celebrations and festivals',
    icon: 'party',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
    subcategories: ['Cultural', 'Food', 'Art', 'Music']
  }
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];