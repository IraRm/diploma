import { View, Text, StyleSheet, Image, Pressable, Alert, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";

const DEV_EMAIL = "developer@example.com"; // можешь поменять на свой

export default function ProfileScreen() {
  const handleLoginPress = () => {
    Alert.alert("Войти", "Здесь позже появится авторизация (по телефону, почте или через госуслуги).");
  };

  const handleSectionPress = (section: string) => {
    Alert.alert(section, "Заглушка раздела. Можно будет добавить экраны позже.");
  };

  const handleWriteDeveloper = async () => {
    const subject = encodeURIComponent("Отзыв о приложении театров Рязани");
    const body = encodeURIComponent("Здравствуйте! Пишу из приложения театров Рязани...");
    const url = `mailto:${DEV_EMAIL}?subject=${subject}&body=${body}`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert(
        "Не удалось открыть почту",
        `Напишите разработчику: ${DEV_EMAIL}`
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <Image
              // временная заглушка-аватар, можно заменить на своё фото
              source={require("../../assets/images/logo.png")}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.name}>Гость</Text>

          <Pressable style={styles.loginButton} onPress={handleLoginPress}>
            <Text style={styles.loginText}>Войти</Text>
          </Pressable>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Разделы</Text>

          <Pressable
            style={styles.row}
            onPress={() => handleSectionPress("О приложении")}
          >
            <Text style={styles.rowText}>О приложении</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>

          <Pressable
            style={styles.row}
            onPress={() => handleSectionPress("Настройки уведомлений")}
          >
            <Text style={styles.rowText}>Настройки уведомлений</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>

          <Pressable
            style={styles.row}
            onPress={() => handleSectionPress("Политика конфиденциальности")}
          >
            <Text style={styles.rowText}>Политика конфиденциальности</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Обратная связь</Text>

          <Pressable style={styles.row} onPress={handleWriteDeveloper}>
            <Text style={styles.rowText}>Написать разработчику</Text>
            <Text style={styles.chevron}>✉</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32
  },
  header: {
    alignItems: "center",
    marginBottom: 24
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.accent,
    marginBottom: 12
  },
  avatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12
  },
  loginButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.accent
  },
  loginText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16
  },
  sectionBlock: {
    backgroundColor: colors.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 4
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    justifyContent: "space-between"
  },
  rowText: {
    color: colors.text,
    fontSize: 16
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 18,
    marginLeft: 8
  }
});
