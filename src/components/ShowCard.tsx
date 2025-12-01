import { FC } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  GestureResponderEvent
} from "react-native";
import { colors } from "../theme/colors";
import type { Show } from "../data/mockShows";

type Props = {
  show: Show;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress?: () => void;
};

export const ShowCard: FC<Props> = ({ show, isFavorite, onToggleFavorite, onPress }) => {
  const handleHeartPress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{show.title}</Text>
        <Pressable onPress={handleHeartPress} hitSlop={10}>
          <Text style={[styles.heart, isFavorite && styles.heartActive]}>
            ♥
          </Text>
        </Pressable>
      </View>

      <Text style={styles.theatre}>{show.theatre}</Text>
      <Text style={styles.date}>{show.date}</Text>

      {show.images && show.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          style={styles.imagesRow}
          contentContainerStyle={styles.imagesContent}
        >
          {show.images.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.image} />
          ))}
        </ScrollView>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
    paddingRight: 8
  },
  heart: {
    fontSize: 20,
    color: colors.textMuted
  },
  heartActive: {
    color: "#ef4444"
  },
  theatre: { color: colors.textMuted, marginBottom: 2 },
  date: { color: colors.text, fontSize: 14, marginBottom: 6 },
  imagesRow: {
    marginTop: 6
  },
  imagesContent: {
    gap: 8
  },
  image: {
    width: 180,
    height: 120,
    borderRadius: 10
  }
});
