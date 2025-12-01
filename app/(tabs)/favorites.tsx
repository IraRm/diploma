import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";
import { useFavorites } from "../../src/state/FavoritesContext";
import { mockShows } from "../../src/data/mockShows";
import { ShowCard } from "../../src/components/ShowCard";

export default function FavoritesScreen() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const favoriteShows = mockShows.filter((show) => favorites.includes(show.id));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Любимые спектакли</Text>

        {favoriteShows.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Пока ничего нет в любимом</Text>
          </View>
        ) : (
          <FlatList
            data={favoriteShows}
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
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyText: {
    color: colors.textMuted
  }
});
