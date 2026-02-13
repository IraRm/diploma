// src/components/ShowCard.tsx
import { FC } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import { colors } from "../theme/colors";
import { formatShowDateTime } from "../utils/formatShowDateTime";

// date — ближайшая дата (для превью в списке), sessions — все показы
type ShowSession = {
  id: string;
  date: string;
};

type ApiShow = {
  id: string;
  title: string;
  theatre: string;
  genre?: string;
  images?: string[];
  date?: string;
  sessions?: ShowSession[];
};

type Props = {
  show: ApiShow;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress?: () => void;
};

export const ShowCard: FC<Props> = ({ show, isFavorite, onToggleFavorite, onPress }) => {
  const handleHeartPress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  const nextDate = show.date ?? show.sessions?.[0]?.date;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{show.title}</Text>

        <Pressable onPress={handleHeartPress} hitSlop={10}>
          <Text style={[styles.heart, isFavorite && styles.heartActive]}>♥</Text>
        </Pressable>
      </View>

      <Text style={styles.theatre}>{show.theatre}</Text>

      <Text style={styles.date}>
        {nextDate ? formatShowDateTime(nextDate) : "Нет дат"}
      </Text>

      {/* Можно (по желанию) показать количество показов */}
      {show.sessions?.length ? (
        <Text style={styles.sessionsCount}>
          Показов: {show.sessions.length}
        </Text>
      ) : null}

       
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
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
    fontSize: 18,
    color: colors.textMuted
  },
  heartActive: {
    color: colors.accent
  },

  theatre: {
    color: colors.textMuted,
    marginBottom: 2
  },
  date: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6
  },

  sessionsCount: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 6
  },
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
