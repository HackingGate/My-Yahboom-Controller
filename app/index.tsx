import { StyleSheet } from "react-native";
import SendMessage from "@/components/SendMessage";
import { ThemedView } from "@/components/ThemedView";

export default function MainScreen() {
  return (
    <ThemedView style={styles.container}>
      <SendMessage />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 80,
    paddingHorizontal: 10,
  },
});
