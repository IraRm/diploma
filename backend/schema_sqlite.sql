-- ===============================
-- Полный ресет и создание БД SQLite
-- ===============================

DROP TABLE IF EXISTS shows;

CREATE TABLE shows (
  id      INTEGER PRIMARY KEY,
  title   TEXT    NOT NULL,
  theatre TEXT    NOT NULL,
  date    TEXT    NOT NULL,
  genre   TEXT    NOT NULL,
  images  TEXT    NOT NULL
);

INSERT INTO shows (id, title, theatre, date, genre, images) VALUES
(1, 'Ревизор', 'Городской драматический театр', '2025-12-01 19:00', 'комедия',
  '[
    "https://images.unsplash.com/photo-1515165562835-c4c9e0737eaa?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1485567702529-2b76d104e58f?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512427691650-1e0c2f9a81b3?q=80&w=1200&auto=format&fit=crop"
  ]'
),
(2, 'Чайка', 'Театр им. Чехова', '2025-12-02 18:30', 'драма',
  '[
    "https://images.unsplash.com/photo-1438109491414-7198515b166b?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1200&auto=format&fit=crop"
  ]'
),
(3, 'Щелкунчик', 'Музыкальный театр', '2025-12-03 19:00', 'балет',
  '[
    "https://images.unsplash.com/photo-1461782290329-3f723aa707a4?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512427691650-1e0c2f9a81b3?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1200&auto=format&fit=crop"
  ]'
);
