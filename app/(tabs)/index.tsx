import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";
import { SearchBar } from "../../src/components/SearchBar";
import { FilterChips } from "../../src/components/FilterChips";
import { ShowCard } from "../../src/components/ShowCard";
import { useFavorites } from "../../src/state/FavoritesContext";
import type { Show } from "../../src/data/mockShows";
import { FilterModal } from "../../src/components/FilterModal";

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedTheatre, setSelectedTheatre] = useState<string | null>(null);

  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendOk, setBackendOk] = useState(false);

  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [availableTheatres, setAvailableTheatres] = useState<string[]>([]);

  const [genreModalVisible, setGenreModalVisible] = useState(false);
  const [theatreModalVisible, setTheatreModalVisible] = useState(false);

  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setBackendOk(false);

        const res = await fetch("http://localhost:3000/shows");
        if (!res.ok) throw new Error("Bad status " + res.status);

        const data: Show[] = await res.json();
        if (cancelled) return;

        setShows(data);
        setBackendOk(true);

        // Заполняем список жанров и театров из пришедших спектаклей
        const genres = Array.from(new Set(data.map((s) => s.genre))).sort();
        const theatres = Array.from(new Set(data.map((s) => s.theatre))).sort();
        setAvailableGenres(genres);
        setAvailableTheatres(theatres);
      } catch (e) {
        if (cancelled) return;

        // Если бэк не ответил — очищаем список и очищаем фильтры
        setShows([]);
        setBackendOk(false);
        setAvailableGenres([]);
        setAvailableTheatres([]);
        setSelectedGenre(null);
        setSelectedTheatre(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shows.filter((show) => {
      const matchesQuery =
        !q ||
        show.title.toLowerCase().includes(q) ||
        show.theatre.toLowerCase().includes(q);
      const matchesGenre = !selectedGenre || show.genre === selectedGenre;
      const matchesTheatre = !selectedTheatre || show.theatre === selectedTheatre;
      return matchesQuery && matchesGenre && matchesTheatre;
    });
  }, [shows, query, selectedGenre, selectedTheatre]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Спектакли в вашем городе</Text>

        <SearchBar value={query} onChange={setQuery} />

        <FilterChips
          onPressDate={() => {
            // TODO: отдельное окно выбора даты
          }}
          onPressGenre={() => {
            if (availableGenres.length > 0) {
              setGenreModalVisible(true);
            }
          }}
          onPressTheatre={() => {
            if (availableTheatres.length > 0) {
              setTheatreModalVisible(true);
            }
          }}
        />

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Загружаем спектакли…</Text>
          </View>
        ) : !backendOk ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>
              Нет соединения с сервером. Спектакли временно недоступны.
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>По запросу ничего не найдено</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <ShowCard
                show={item}
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={() => toggleFavorite(item.id)}
              />
            )}
          />
        )}

        {/* Модальное окно выбора жанра */}
        <FilterModal
          visible={genreModalVisible}
          title="Выберите жанр"
          options={availableGenres}
          selectedValue={selectedGenre}
          onSelect={setSelectedGenre}
          onClose={() => setGenreModalVisible(false)}
        />

        {/* Модальное окно выбора театра */}
        <FilterModal
          visible={theatreModalVisible}
          title="Выберите театр"
          options={availableTheatres}
          selectedValue={selectedTheatre}
          onSelect={setSelectedTheatre}
          onClose={() => setTheatreModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingTop: 4 },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 24
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  loadingText: {
    marginTop: 12,
    color: colors.textMuted
  },
  errorText: {
    color: "#f87171",
    textAlign: "center"
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: "center"
  }
});
