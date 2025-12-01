import { FC } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
  ScrollView
} from "react-native";
import { colors } from "../theme/colors";

type Props = {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
  onClose: () => void;
  withReset?: boolean;
};

export const FilterModal: FC<Props> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  withReset = true
}) => {
  const handleSelect = (value: string | null) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.centerWrap}>
        <View style={styles.panel}>
          <Text style={styles.title}>{title}</Text>

          <ScrollView style={styles.optionsList}>
            {withReset && (
              <Pressable
                style={styles.option}
                onPress={() => handleSelect(null)}
              >
                <Text style={styles.optionReset}>
                  Без фильтра
                </Text>
              </Pressable>
            )}

            {options.map((opt) => {
              const isActive = selectedValue === opt;
              return (
                <Pressable
                  key={opt}
                  style={[styles.option, isActive && styles.optionActive]}
                  onPress={() => handleSelect(opt)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isActive && styles.optionTextActive
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Закрыть</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)"
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24
  },
  panel: {
    backgroundColor: colors.panel,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: colors.line,
    maxHeight: "70%"
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8
  },
  optionsList: {
    marginVertical: 4
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10
  },
  optionActive: {
    backgroundColor: "#0f172a"
  },
  optionText: {
    color: colors.text,
    fontSize: 16
  },
  optionTextActive: {
    color: colors.accent,
    fontWeight: "600"
  },
  optionReset: {
    color: colors.textMuted,
    fontSize: 14
  },
  closeBtn: {
    marginTop: 8,
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 10
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 14
  }
});
