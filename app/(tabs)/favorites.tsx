import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchShows } from "../../src/api/shows";
import { ShowCard } from "../../src/components/ShowCard";
import { mockShows, type Show } from "../../src/data/mockShows";
import { useFavorites } from "../../src/state/FavoritesContext";
import { colors } from "../../src/theme/colors";

export default function FavoritesScreen() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendOk, setBackendOk] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setBackendOk(false);

        const data = await fetchShows();
        if (cancelled) return;

        setShows(data);
        setBackendOk(true);
      } catch (e) {
        if (cancelled) return;
        setShows(mockShows);
        setBackendOk(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const favoriteShows = useMemo(
    () => shows.filter((show) => favorites.includes(String(show.id))),
    [shows, favorites]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Любимые спектакли</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.emptyText}>Загружаем…</Text>
          </View>
        ) : favoriteShows.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              Пока ничего нет в любимом
              {!backendOk ? " (сервер недоступен — показаны моки)" : ""}
            </Text>
          </View>
        ) : (
          <FlatList
            data={favoriteShows}
            keyExtractor={(item) => String(item.id)}
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
  listContent: { paddingTop: 4, paddingBottom: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: colors.textMuted, textAlign: "center", paddingHorizontal: 24 }
});

