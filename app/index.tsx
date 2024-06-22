import { StyleSheet, View } from "react-native";
import VideoScreen from "@/components/VideoScreen";
import ScanScreen from "@/components/ScanScreen";
import { ThemedView } from "@/components/ThemedView";
import CameraControl from "@/components/CameraControl";
import SpeedControl from "@/components/SpeedControl";
import { RosProvider } from "@/context/RosContext";
import BeepControl from "@/components/BeepControl";
import GameController from "@/components/GameController";
import { useEffect, useState } from "react";

export default function MainScreen() {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    GameController.connectController();

    const checkConnection = async () => {
      const connected = await GameController.checkControllerConnected();
      setIsConnected(connected);
    };

    checkConnection();

    const connectionListener = GameController.gameControllerEmitter.addListener(
      "onGamepadValueChange",
      checkConnection,
    );

    return () => {
      GameController.disconnectController();
      connectionListener.remove(); // Clean up the event listener
    };
  }, []);

  return (
    <RosProvider>
      <ThemedView style={styles.container}>
        <VideoScreen />
        <ScanScreen />
        {!isConnected && (
          <>
            <View style={styles.cameraControl}>
              <CameraControl />
            </View>
            <View style={styles.speedControl}>
              <SpeedControl />
            </View>
            <View style={styles.beepControl}>
              <BeepControl />
            </View>
          </>
        )}
        <GameController.GameController />
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
    padding: 10,
    position: "absolute",
    left: 40,
    bottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  speedControl: {
    opacity: 0.5,
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
