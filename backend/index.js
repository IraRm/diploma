const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Заглушечные данные спектаклей (та же структура, что в src/data/mockShows.ts)
const shows = [
  {
    id: "1",
    title: "Ревизор",
    theatre: "Драматический театр",
    date: "2025-12-01 19:00",
    genre: "комедия",
    images: [
      "https://images.unsplash.com/photo-1515165562835-c4c9e0737eaa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1485567702529-2b76d104e58f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1485567724416-0a3c7a5b2e8c?q=80&w=1200&auto=format&fit=crop"
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
      "https://images.unsplash.com/photo-1515165562835-c4c9e0737eaa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=1200&auto=format&fit=crop"
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
  }
];

// список всех спектаклей
app.get("/shows", (req, res) => {
  res.json(shows);
});

// один спектакль по id
app.get("/shows/:id", (req, res) => {
  const show = shows.find((s) => s.id === req.params.id);
  if (!show) {
    return res.status(404).json({ error: "Show not found" });
  }
  res.json(show);
});

// заглушки для театров и жанров (на будущее)
app.get("/theatres", (req, res) => {
  const theatres = [...new Set(shows.map((s) => s.theatre))];
  res.json(theatres);
});

app.get("/genres", (req, res) => {
  const genres = [...new Set(shows.map((s) => s.genre))];
  res.json(genres);
});

app.listen(PORT, () => {
  console.log(`API server is running on http://localhost:${PORT}`);
});
