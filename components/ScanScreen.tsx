import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Button, Dimensions, Text } from "react-native";
// @ts-ignore
import ROSLIB from "roslib";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { useRos } from "@/context/RosContext";
import { PinchGestureHandler, State } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

export default function ScanScreen() {
  const [status, setStatus] = useState("Not connected");
  const [scanData, setScanData] = useState<number[]>([]);
  const [scale, setScale] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const rosRef = useRef<ROSLIB.Ros | null>(null);
  const topicRef = useRef<ROSLIB.Topic | null>(null);
  const { rosUrl, setRosUrl } = useRos();

  useEffect(() => {
    const ros = new ROSLIB.Ros();
    rosRef.current = ros;

    ros.on("connection", () => {
      console.log("Connected to ROS.");
      setStatus("Connected");

      const topic = new ROSLIB.Topic({
        ros,
        name: "/scan",
        messageType: "sensor_msgs/LaserScan",
      });

      topic.subscribe((message: any) => {
        setScanData(message.ranges);
      });

      topicRef.current = topic;
    });

    ros.on("error", (error: any) => {
      console.log("Error connecting to ROS:", error);
      setStatus("Error");
    });

    ros.on("close", () => {
      console.log("Connection to ROS closed.");
      setStatus("Disconnected");
    });

    ros.connect(rosUrl);

    return () => {
      if (topicRef.current) {
        topicRef.current.unsubscribe();
      }
      if (rosRef.current) {
        rosRef.current.close();
      }
    };
  }, [rosUrl]);

  const handlePinch = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      setScale(event.nativeEvent.scale);
      setIsZoomed(true);
    }
  };

  const resetZoom = () => {
    setScale(1);
    setIsZoomed(false);
  };

  const renderScanData = () => {
    if (scanData.length === 0) return null;
    return scanData.map((distance, index) => {
      const angle = (index * 2 * Math.PI) / scanData.length - Math.PI / 2;
      const x = width / 2 + distance * 100 * Math.cos(angle) * scale;
      const y = height / 2 - distance * 100 * Math.sin(angle) * scale; // Flipped vertically
      return (
        <View key={index} style={[styles.scanPoint, { left: x, top: y }]} />
      );
    });
  };

  return (
    <PinchGestureHandler onGestureEvent={handlePinch}>
      <View style={styles.overlay}>
        {renderScanData()}
        <View style={styles.carArrowContainer}>
          <Text style={styles.carArrow}>⬆️</Text>
        </View>
        {isZoomed && (
          <View style={styles.resetZoomButtonContainer}>
            <Button title="Reset Zoom" onPress={resetZoom} />
          </View>
        )}
        {status !== "Connected" && (
          <View style={styles.placeholder}>
            <ThemedTextInput
              style={styles.textInput}
              value={rosUrl}
              onChangeText={setRosUrl}
            />
            <Button
              title="Connect"
              onPress={() => {
                if (rosRef.current && status !== "Connected") {
                  rosRef.current.connect(rosUrl);
                }
              }}
            />
            <Button
              title="Disconnect"
              onPress={() => {
                if (rosRef.current && status === "Connected") {
                  rosRef.current.close();
                }
              }}
            />
          </View>
        )}
      </View>
    </PinchGestureHandler>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.5,
  },
  scanPoint: {
    position: "absolute",
    width: 5,
    height: 5,
    backgroundColor: "red",
    borderRadius: 2.5,
  },
  carArrowContainer: {
    position: "absolute",
    left: width / 2 - 10,
    top: height / 2 - 10,
    justifyContent: "center",
    alignItems: "center",
  },
  carArrow: {
    fontSize: 20,
    color: "blue",
  },
  resetZoomButtonContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  placeholder: {
    width: 350,
    height: 275,
    alignItems: "center",
  },
  textInput: {
    padding: 10,
  },
});
