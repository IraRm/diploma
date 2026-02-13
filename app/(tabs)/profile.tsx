import * as Linking from "expo-linking";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";

export default function ProfileScreen() {
  const handleLogin = () => {
    Alert.alert(
      "Вход",
      "Здесь позже появится настоящий экран авторизации."
    );
  };

  const handleContactDeveloper = () => {
    const email = "dev@example.com"; 
    const subject = encodeURIComponent("Обратная связь по приложению театров");
    const body = encodeURIComponent("Здравствуйте! Хочу предложить...");
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  const sections = [
    { id: "tickets", title: "Мои билеты" },
    { id: "notifications", title: "Настройки уведомлений" },
    { id: "about", title: "О приложении" }
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop"
            }}
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.name}>Гость</Text>
            <Text style={styles.subtitle}>
              Войдите, чтобы сохранять любимые спектакли и билеты
            </Text>
          </View>
        </View>

        <Pressable style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Войти</Text>
        </Pressable>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Разделы</Text>
          {sections.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.sectionItem,
                pressed && styles.sectionItemPressed
              ]}
              onPress={() => {
                Alert.alert(item.title, "Эта секция пока заглушка.");
              }}
            >
              <Text style={styles.sectionText}>{item.title}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Связаться</Text>
          <Pressable
            style={styles.contactButton}
            onPress={handleContactDeveloper}
          >
            <Text style={styles.contactText}>Написать разработчику</Text>
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16
  },
  headerText: {
    flex: 1
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 24
  },
  loginText: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 16
  },
  sectionBlock: {
    marginBottom: 24
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8
  },
  sectionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 6
  },
  sectionItemPressed: {
    backgroundColor: "#020617"
  },
  sectionText: {
    color: colors.text,
    fontSize: 15
  },
  contactButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: "center"
  },
  contactText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: "500"
  }
});
