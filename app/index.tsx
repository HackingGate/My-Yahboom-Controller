import { StyleSheet } from "react-native";
import VideoScreen from "@/components/VideoScreen";
import { ThemedView } from "@/components/ThemedView";

export default function MainScreen() {
  return (
    <ThemedView style={styles.container}>
      <VideoScreen />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
