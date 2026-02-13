// app/shows/[id].tsx
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchShowById } from "../../src/api/shows";
import { colors } from "../../src/theme/colors";
import { formatShowDateTime } from "../../src/utils/formatShowDateTime";

type ShowSession = {
  id: string;
  date: string;
  buyUrl?: string | null;
};

type ApiShow = {
  id: string;
  title: string;
  theatre: string;
  genre?: string;
  images?: string[];
  description?: string | null;
  date?: string;
  sessions?: ShowSession[];
};

// ——— Группировка сеансов по дню ———
function groupSessionsByDay(sessions: ShowSession[]) {
  const map = new Map<string, ShowSession[]>();

  for (const s of sessions) {
    const dayKey = s.date?.split("T")?.[0] ?? "unknown";
    const arr = map.get(dayKey) ?? [];
    arr.push(s);
    map.set(dayKey, arr);
  }

  const days = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  for (const [, arr] of days) {
    arr.sort((x, y) => x.date.localeCompare(y.date));
  }

  return days; // [ [YYYY-MM-DD, sessions[]], ... ]
}

function formatDayTitle(isoDate: string) {
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}.${m}.${y}`;
}

async function openBuyUrl(url?: string | null) {
  if (!url) {
    Alert.alert(
      "Покупка билетов",
      "Ссылка на покупку для этого сеанса пока не добавлена."
    );
    return;
  }

  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert("Не удалось открыть ссылку", url);
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert("Ошибка", "Не удалось открыть ссылку.");
  }
}

// ————————————————————————————————
//          КОМПОНЕНТ ЭКРАНА
// ————————————————————————————————
export default function ShowDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [show, setShow] = useState<ApiShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setErrorText(null);

        if (!id) {
          setErrorText("Не передан id спектакля");
          return;
        }

        const data = (await fetchShowById(String(id))) as ApiShow;
        if (cancelled) return;

        setShow(data);
      } catch {
        if (cancelled) return;
        setErrorText("Не удалось загрузить спектакль");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ——— Группировка сеансов ———
  const sessionsByDay = useMemo(() => {
    const sessions = show?.sessions ?? [];
    return sessions.length ? groupSessionsByDay(sessions) : [];
  }, [show?.sessions]);

  // ——— Фильтрация плохих картинок ———
  const filteredImages = useMemo(() => {
    const imgs = show?.images ?? [];
    const badKeys = [
      "vnimanie",
      "logo",
      "banner",
      "icon",
      "sprite",
      "placeholder",
      "default",
      "noimage",
      "attention"
    ];

    return imgs
      .filter(Boolean)
      .filter((u) => {
        const s = String(u).toLowerCase();
        return !badKeys.some((k) => s.includes(k));
      });
  }, [show?.images]);

  // ——————————————————————————
  //              UI
  // ——————————————————————————
  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Спектакль",
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text
        }}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.muted}>Загружаем…</Text>
        </View>
      ) : errorText ? (
        <View style={styles.center}>
          <Text style={styles.error}>{errorText}</Text>
        </View>
      ) : !show ? (
        <View style={styles.center}>
          <Text style={styles.error}>Спектакль не найден</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{show.title}</Text>
          <Text style={styles.theatre}>{show.theatre}</Text>
          <View style={styles.divider} />

          {!!show.genre && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Жанр</Text>
              <Text style={styles.metaValue}>{show.genre}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Выберите дату и время</Text>

            {sessionsByDay.length ? (
              <View style={styles.daysBlock}>
                {sessionsByDay.map(([dayKey, sessions]) => (
                  <View key={dayKey} style={styles.dayGroup}>
                    <Text style={styles.dayTitle}>{formatDayTitle(dayKey)}</Text>

                    <View style={styles.sessionsList}>
                      {sessions.map((s) => {
                        const time = formatShowDateTime(s.date).slice(-5);
                        return (
                          <Pressable
                            key={s.id}
                            style={({ pressed }) => [
                              styles.sessionPill,
                              pressed && styles.sessionPillPressed
                            ]}
                            onPress={() => openBuyUrl(s.buyUrl)}
                          >
                            <Text style={styles.sessionText}>{time}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Нет ближайших дат</Text>
            )}

            <Text style={styles.hint}>Нажмите на время — откроется страница театра</Text>
          </View>

          {/* POSTERS */}
          {filteredImages.length ? (
            <View style={styles.imagesBlock}>
              {filteredImages.map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={styles.image} />
              ))}
            </View>
          ) : (
            <View style={styles.posterPlaceholder}>
              <Text style={styles.posterPlaceholderText}>Постер пока не найден</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ————————————————————————————————
//                СТИЛИ
// ————————————————————————————————
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  muted: { marginTop: 10, color: colors.textMuted },
  error: { color: colors.accent, textAlign: "center", fontWeight: "600" },

  content: { padding: 16, paddingBottom: 32 },

  title: { color: colors.text, fontSize: 24, fontWeight: "800", marginBottom: 6 },
  theatre: { color: colors.textMuted, fontSize: 14 },

  divider: {
    height: 2,
    width: 44,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginVertical: 12
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 8
  },
  metaLabel: { color: colors.textMuted, fontSize: 13 },
  metaValue: { color: colors.text, fontSize: 13, fontWeight: "600", flexShrink: 1, textAlign: "right" },

  section: { marginTop: 12 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "800", marginBottom: 10 },

  daysBlock: { gap: 14 },
  dayGroup: {
    backgroundColor: colors.panel,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line
  },
  dayTitle: { color: colors.text, fontSize: 14, fontWeight: "800", marginBottom: 10 },

  sessionsList: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  sessionPill: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent
  },
  sessionPillPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9
  },
  sessionText: {
    color: colors.accent,
    fontWeight: "800",
    fontSize: 13
  },

  hint: { marginTop: 10, color: colors.textMuted, fontSize: 12 },
  emptyText: { color: colors.textMuted },

  imagesBlock: { marginTop: 14, gap: 10 },

  image: { width: "100%", height: 220, borderRadius: 18 },

  posterPlaceholder: {
    marginTop: 14,
    height: 220,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center"
  },
  posterPlaceholderText: { color: colors.textMuted, fontWeight: "600" }
});
