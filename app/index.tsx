import { StyleSheet, View } from "react-native";
import VideoScreen from "@/components/VideoScreen";
import { ThemedView } from "@/components/ThemedView";
import CameraControl from "@/components/CameraControl";

export default function MainScreen() {
  return (
    <ThemedView style={styles.container}>
      <VideoScreen />
      <View style={styles.cameraControl}>
        <CameraControl />
      </View>
      <View style={styles.speedControl}>
        <CameraControl />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraControl: {
    opacity: 0.5,
    flexDirection: "row",
    padding: 10,
    position: "absolute",
    left: 40,
    bottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  speedControl: {
    opacity: 0.5,
    flexDirection: "row",
    padding: 10,
    position: "absolute",
    right: 40,
    bottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
