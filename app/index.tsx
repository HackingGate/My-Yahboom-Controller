import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function MainScreen() {
  return (
    <ThemedView style={styles.centerContainer}>
      <ThemedText>Hello World!</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
});
