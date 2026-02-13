import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchShows } from "../../src/api/shows";
import { FilterChips } from "../../src/components/FilterChips";
import { FilterModal } from "../../src/components/FilterModal";
import { SearchBar } from "../../src/components/SearchBar";
import { ShowCard } from "../../src/components/ShowCard";
import type { Show } from "../../src/data/mockShows";
import { useFavorites } from "../../src/state/FavoritesContext";
import { colors } from "../../src/theme/colors";
import { filterShowsForCurrentMonth } from "../../src/utils/currentMonth";
import { parseShowDate } from "../../src/utils/formatShowDateTime";

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedTheatre, setSelectedTheatre] = useState<string | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendOk, setBackendOk] = useState(false);

  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [theatreModalVisible, setTheatreModalVisible] = useState(false);

  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setBackendOk(false);

        const data = await fetchShows();
        if (cancelled) return;

        console.log(">>> shows from backend:", data.length);
        setShows(data);
        setBackendOk(true);
      } catch (e) {
        if (cancelled) return;
        console.warn("Не удалось загрузить спектакли с сервера:", e);
        setShows([]);
        setBackendOk(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const theatreOptions = useMemo(() => {
  const set = new Set<string>();
  for (const s of shows) {
    if (s?.theatre) set.add(s.theatre);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "ru"));
}, [shows]);

const dateBounds = useMemo(() => {
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfDayAfterTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

  const startOfWeek = new Date(startOfToday);
  const day = (startOfWeek.getDay() + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - day);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return { startOfToday, startOfTomorrow, startOfDayAfterTomorrow, startOfWeek, endOfWeek, startOfMonth, startOfNextMonth };
}, []);



  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const startOfDayAfterTomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 2
    );

    const startOfWeek = new Date(startOfToday);
    const day = (startOfWeek.getDay() + 6) % 7; // 0 = понедельник
    startOfWeek.setDate(startOfWeek.getDate() - day);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

   const baseShows =
  selectedDateFilter === "В этом месяце"
    ? filterShowsForCurrentMonth(shows)
    : shows;

return baseShows.filter((show) => {


      const matchesQuery =
        !q ||
        show.title.toLowerCase().includes(q) ||
        show.theatre.toLowerCase().includes(q);

      const matchesGenre = !selectedGenre || show.genre === selectedGenre;
      const matchesTheatre = !selectedTheatre || show.theatre === selectedTheatre;

      let matchesDate = true;
      if (selectedDateFilter) {
        const showDate = parseShowDate(show.date);

if (!showDate) {
  matchesDate = false;
} else {
  switch (selectedDateFilter) {
    case "Сегодня":
      matchesDate =
        showDate >= startOfToday && showDate < startOfTomorrow;
      break;

    case "Завтра":
      matchesDate =
        showDate >= startOfTomorrow &&
        showDate < startOfDayAfterTomorrow;
      break;

    case "На этой неделе":
      matchesDate =
        showDate >= startOfWeek && showDate < endOfWeek;
      break;

    case "В этом месяце":
      matchesDate =
        showDate >= startOfMonth && showDate < startOfNextMonth;
      break;

    default:
      matchesDate = true;
  }
}
      }

      return matchesQuery && matchesGenre && matchesTheatre && matchesDate;
    });
  }, [shows, query, selectedGenre, selectedTheatre, selectedDateFilter]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <Text style={styles.afisha}>Афиша</Text>
<Text style={styles.subtitle}>Найдено: {filtered.length}</Text>


{/*
<Text style={styles.debug}>
  Сейчас (устройство): {new Date().toISOString().slice(0, 10)}
</Text>
<Text style={styles.debug}>
  В этом месяце: {filterShowsForCurrentMonth(shows).length}
</Text>
<Text style={styles.debug}>
  После фильтров: {filtered.length}
</Text>
*/}

        <SearchBar value={query} onChange={setQuery} />

        <FilterChips
           onPressDate={() => setDateModalVisible(true)}
  onPressGenre={() => {
    // TODO: модалка жанров
  }}
  onPressTheatre={() => setTheatreModalVisible(true)}
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
      onPress={() => router.push(`/shows/${item.id}`)}
    />
  )}
/>

)}

        <FilterModal
          visible={dateModalVisible}
          title="Выбор даты"
          options={[
            "Сегодня",
            "Завтра",
            "На этой неделе",
            "В этом месяце"
          ]}
          selectedValue={selectedDateFilter}
          onSelect={(value) => setSelectedDateFilter(value)}
          onClose={() => setDateModalVisible(false)}
        />
        <FilterModal
  visible={theatreModalVisible}
  title="Выбор театра"
  options={["Все театры", ...theatreOptions]}
  selectedValue={selectedTheatre ? selectedTheatre : "Все театры"}
  onSelect={(value) => {
    if (value === "Все театры") setSelectedTheatre(null);
    else setSelectedTheatre(value);
  }}
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
  debug: {
    color: colors.textMuted,
    fontSize: 12,
    paddingHorizontal: 16,
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
  },
  subtitle: {
  color: colors.textMuted,
  fontSize: 13,
  paddingHorizontal: 16,
  paddingBottom: 8
},
afisha: {
  fontSize: 32,
  fontWeight: "800",
  color: colors.text,
  paddingHorizontal: 16,
  paddingTop: 12,
  paddingBottom: 4
},
});

