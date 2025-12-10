import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  price: string;
  image: string;
  category: string;
  description: string;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class EventsComponent {
  categories = [
    {
      id: 1,
      name: 'Theatre',
      icon: '🎭',
      bgImage: 'https://img.freepik.com/vecteurs-libre/rideaux-cinema-theatre-illustration-vectorielle-lumiere-mise-au-point_1017-38346.jpg',
      bgGradient: ''
    },
    {
      id: 2,
      name: 'Music',
      icon: '🎵',
      bgImage: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500',
      bgGradient: 'linear-gradient(135deg, rgba(75, 0, 130, 0.7) 0%, rgba(147, 112, 219, 0.7) 100%)'
    },
    {
      id: 3,
      name: 'Cinema',
      icon: '🎬',
      bgImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500',
      bgGradient: 'linear-gradient(135deg, rgba(26, 26, 46, 0.7) 0%, rgba(22, 33, 62, 0.7) 100%)'
    },
    {
      id: 4,
      name: 'Opera',
      icon: '🎼',
      bgImage: 'https://images.unsplash.com/photo-1580809361436-42a7ec204889?w=500',
      bgGradient: 'linear-gradient(135deg, rgba(15, 32, 39, 0.7) 0%, rgba(32, 58, 67, 0.7) 50%, rgba(44, 83, 100, 0.7) 100%)'
    }
  ];

  events: Event[] = [
    { id: 1, title: 'Romeo and Juliet', date: 'SEP 18', location: 'Grand Theatre, Paris', price: '$45.00', image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=500', category: 'Theatre', description: 'A timeless tale of forbidden love and tragedy that has captivated audiences for centuries.' },
     { id: 2, title: 'Hamlet', date: 'SEP 20', location: 'Royal Theatre, London', price: '$50.00', image: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=500', category: 'Theatre', description: 'Shakespeare\'s masterpiece about revenge, madness, and the human condition.' },
    { id: 3, title: 'The Lion King', date: 'SEP 22', location: 'Broadway Theatre, NYC', price: '$85.00', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500', category: 'Theatre', description: 'An unforgettable musical journey through the African savanna with stunning visuals.' },
  { id: 4, title: 'Swan Lake', date: 'SEP 25', location: 'Bolshoi Theatre, Moscow', price: '$70.00', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500', category: 'Theatre', description: 'A breathtaking ballet performance that blends elegance, emotion, and timeless artistry.' },

{ id: 5, title: 'Phantom of the Opera', date: 'SEP 27', location: 'Majestic Theatre, NYC', price: '$90.00', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500', category: 'Theatre', description: 'A haunting love story brought to life with powerful vocals and mesmerizing visuals.' },

{ id: 6, title: 'Coldplay Live', date: 'OCT 01', location: 'Wembley Stadium, London', price: '$120.00', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500', category: 'Music', description: 'An electrifying concert filled with lights, emotion, and unforgettable live performances.' },

{ id: 7, title: 'Jazz Nights', date: 'OCT 03', location: 'Blue Note, Paris', price: '$35.00', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500', category: 'Music', description: 'A warm and intimate jazz session featuring world-class musicians and soulful melodies.' },

{ id: 8, title: 'Symphony No. 9', date: 'OCT 05', location: 'Vienna Concert Hall', price: '$65.00', image: 'https://images.unsplash.com/photo-1485561428449-fb0f661b2837?w=500', category: 'Music', description: 'A powerful orchestral masterpiece performed by one of Europe’s finest ensembles.' },

{ id: 9, title: 'Inception', date: 'OCT 07', location: 'CinéMax, Berlin', price: '$12.00', image: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=500', category: 'Cinema', description: 'A mind-bending sci-fi thriller that blurs the line between dream and reality.' },

{ id: 10, title: 'Interstellar', date: 'OCT 10', location: 'Galaxy Cinema, Dubai', price: '$14.00', image: 'https://images.unsplash.com/photo-1505685296765-3a2736de412f?w=500', category: 'Cinema', description: 'A visually stunning space odyssey exploring love, time, and the survival of humanity.' },

{ id: 11, title: 'La La Land', date: 'OCT 12', location: 'Sunset Theatre, LA', price: '$11.00', image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=500', category: 'Cinema', description: 'A romantic musical film that blends jazz, dreams, and heartwarming storytelling.' },

{ id: 12, title: 'Carmen', date: 'OCT 15', location: 'Opera Bastille, Paris', price: '$80.00', image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500', category: 'Opera', description: 'A dramatic opera filled with passion, tension, and world-famous melodies.' },

{ id: 13, title: 'The Magic Flute', date: 'OCT 18', location: 'Royal Opera House, London', price: '$95.00', image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=500', category: 'Opera', description: 'Mozart’s enchanting masterpiece blending fantasy, music, and captivating symbolism.' },

{ id: 14, title: 'Madame Butterfly', date: 'OCT 20', location: 'Metropolitan Opera, NYC', price: '$110.00', image: 'https://images.unsplash.com/photo-1497032205916-ac775f0649ae?w=500', category: 'Opera', description: 'A tragic love story brought to life with exquisite vocals and dramatic staging.' },

{ id: 15, title: 'Bohemian Rhapsody Tribute', date: 'OCT 23', location: 'Rock Arena, Toronto', price: '$45.00', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500', category: 'Music', description: 'A thrilling tribute concert honoring the legendary sound and energy of Queen.' },

    { id: 4, title: 'Jazz Night', date: 'SEP 19', location: 'Blue Note, NYC', price: '$35.00', image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=500', category: 'Music', description: 'An intimate evening of smooth jazz with world-renowned musicians in a legendary venue.' },
    { id: 5, title: 'Rock Festival', date: 'SEP 21', location: 'Central Park, NYC', price: '$60.00', image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500', category: 'Music', description: 'A high-energy outdoor festival featuring the biggest names in rock music.' },
    { id: 6, title: 'Classical Symphony', date: 'SEP 23', location: 'Carnegie Hall, NYC', price: '$70.00', image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500', category: 'Music', description: 'Experience the beauty of classical music performed by a world-class orchestra.' },
    { id: 7, title: 'Movie Premiere Night', date: 'SEP 24', location: 'Cinema Grand, LA', price: '$25.00', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500', category: 'Cinema', description: 'Be among the first to watch the most anticipated blockbuster of the year.' },
    { id: 8, title: 'Film Festival', date: 'SEP 25', location: 'Cannes Theatre, France', price: '$40.00', image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500', category: 'Cinema', description: 'A showcase of independent films from talented directors around the globe.' },
    { id: 9, title: 'Classic Movies Night', date: 'SEP 26', location: 'Retro Cinema, Berlin', price: '$20.00', image: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=500', category: 'Cinema', description: 'Relive the golden age of cinema with restored classic films on the big screen.' },
    { id: 10, title: 'La Traviata', date: 'SEP 27', location: 'Opera House, Vienna', price: '$95.00', image: 'https://images.unsplash.com/photo-1580809361436-42a7ec204889?w=500', category: 'Opera', description: 'Verdi\'s tragic love story brought to life with powerful vocals and stunning sets.' },
    { id: 11, title: 'The Magic Flute', date: 'SEP 28', location: 'Metropolitan Opera, NYC', price: '$100.00', image: 'https://images.unsplash.com/photo-1519149466976-7b6734e16549?w=500', category: 'Opera', description: 'Mozart\'s enchanting fairy tale opera filled with magic, mystery, and beautiful arias.' },
    { id: 12, title: 'Carmen', date: 'SEP 29', location: 'Sydney Opera House', price: '$90.00', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500', category: 'Opera', description: 'A passionate tale of love, jealousy, and freedom set to Bizet\'s unforgettable score.' }
  ];

  selectedCategory: string | null = null;
  currentPage = 0;
  itemsPerPage = 6;

  get filteredEvents(): Event[] {
    if (!this.selectedCategory) return [];
    return this.events.filter(e => e.category === this.selectedCategory);
  }

  get paginatedEvents(): Event[] {
    const start = this.currentPage * this.itemsPerPage;
    return this.filteredEvents.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredEvents.length / this.itemsPerPage);
  }

  selectCategory(category: string) {
    console.log('Category clicked:', category);
    console.log('Current selected:', this.selectedCategory);
    
    if (this.selectedCategory === category) {
      this.selectedCategory = null;
    } else {
      this.selectedCategory = category;
      this.currentPage = 0;
    }
    
    console.log('New selected:', this.selectedCategory);
    console.log('Filtered events:', this.filteredEvents.length);
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
}