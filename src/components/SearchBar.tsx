import { FC } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  value: string;
  onChange: (text: string) => void;
  onFocus?: () => void;
};

export const SearchBar: FC<Props> = ({ value, onChange, onFocus }) => {
  return (
    <View style={styles.wrap}>
      <TextInput
        placeholder="Поиск спектаклей…"
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChange}
        onFocus={onFocus}
        returnKeyType="search"
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4
  },
  input: {
    backgroundColor: colors.panel,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.line
  }
});
