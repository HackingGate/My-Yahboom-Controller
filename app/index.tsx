import { StyleSheet, View } from "react-native";
import VideoScreen from "@/components/VideoScreen";
import ScanScreen from "@/components/ScanScreen";
import { ThemedView } from "@/components/ThemedView";
import CameraControl from "@/components/CameraControl";
import SpeedControl from "@/components/SpeedControl";
import { RosProvider } from "@/context/RosContext";
import BeepControl from "@/components/BeepControl";

export default function MainScreen() {
  return (
    <RosProvider>
      <ThemedView style={styles.container}>
        <VideoScreen />
        <ScanScreen />
        <View style={styles.cameraControl}>
          <CameraControl />
        </View>
        <View style={styles.speedControl}>
          <SpeedControl />
        </View>
        <View style={styles.beepControl}>
          <BeepControl />
        </View>
      </ThemedView>
    </RosProvider>
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
  beepControl: {
    opacity: 0.5,
    position: "absolute",
    alignSelf: "center",
    bottom: 100,
  },
});
