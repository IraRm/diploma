export type Show = {
  id: string;
  title: string;
  theatre: string;
  date: string;     // ISO или человекочитаемая дата
  genre: string;
  images: string[];
};

export const mockShows: Show[] = [
  {
    id: "1",
    title: "Ревизор",
    theatre: "Городской драматический театр",
    date: "2025-12-01 19:00",
    genre: "комедия",
    images: [
      "https://images.unsplash.com/photo-1515165562835-c4c9e0737eaa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1485567702529-2b76d104e58f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512427691650-1e0c2f9a81b3?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "2",
    title: "Чайка",
    theatre: "Театр им. Чехова",
    date: "2025-12-02 18:30",
    genre: "драма",
    images: [
      "https://images.unsplash.com/photo-1438109491414-7198515b166b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "3",
    title: "Щелкунчик",
    theatre: "Музыкальный театр",
    date: "2025-12-03 19:00",
    genre: "балет",
    images: [
      "https://images.unsplash.com/photo-1461782290329-3f723aa707a4?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512427691650-1e0c2f9a81b3?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "4",
    title: "Город. Ночной трамвай",
    theatre: "Новый экспериментальный театр",
    date: "2025-12-04 20:00",
    genre: "современная драма",
    images: [
      "https://images.unsplash.com/photo-1512427691650-1e0c2f9a81b3?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1485567724416-0a3c7a5b2e8c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1485567702492-837c97c1be0e?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "5",
    title: "Маленький принц",
    theatre: "Театр юного зрителя",
    date: "2025-12-05 12:00",
    genre: "сказка",
    images: [
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512427691650-1e0c2f9a81b3?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  {
    id: "6",
    title: "Ромео и Джульетта",
    theatre: "Классический театр на Набережной",
    date: "2025-12-06 19:30",
    genre: "трагедия",
    images: [
      "https://images.unsplash.com/photo-1515165562835-c4c9e0737eaa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1438109491414-7198515b166b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=1200&auto=format&fit=crop"
    ]
  }
];
