import { FC } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  onPressDate: () => void;
  onPressGenre: () => void;
  onPressTheatre: () => void;
};

const Chip: FC<{ label: string; onPress: () => void }> = ({ label, onPress }) => (
  <Pressable style={styles.chip} onPress={onPress}>
    <Text style={styles.chipText}>{label}</Text>
  </Pressable>
);

export const FilterChips: FC<Props> = ({ onPressDate, onPressGenre, onPressTheatre }) => (
  <View style={styles.row}>
    <Chip label="Дата" onPress={onPressDate} />
    <Chip label="Жанры" onPress={onPressGenre} />
    <Chip label="Театр" onPress={onPressTheatre} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 8
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line
  },
  chipText: {
    color: colors.text,
    fontSize: 14
  }
});
