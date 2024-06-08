import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Button, Image } from "react-native";
// @ts-ignore
import ROSLIB from "roslib";
import { ROS_URL } from "@/config";

export default function VideoScreen() {
  const [status, setStatus] = useState("Not connected");
  const [imageData, setImageData] = useState<string | null>(null);
  const rosRef = useRef<ROSLIB.Ros | null>(null);
  const topicRef = useRef<ROSLIB.Topic | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  useEffect(() => {
    const ros = new ROSLIB.Ros();
    rosRef.current = ros;

    ros.on("connection", () => {
      console.log("Connected to ROS.");
      setStatus("Connected");

      const topic = new ROSLIB.Topic({
        ros,
        name: "/usb_cam/image_raw/compressed",
        messageType: "sensor_msgs/CompressedImage",
      });

      topic.subscribe((message: any) => {
        const currentTime = Date.now();
        if (currentTime > lastFrameTimeRef.current) {
          lastFrameTimeRef.current = currentTime;
          const imageData = "data:image/jpeg;base64," + message.data;
          setImageData(imageData);
        }
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

    ros.connect(ROS_URL);

    return () => {
      if (topicRef.current) {
        topicRef.current.unsubscribe();
      }
      if (rosRef.current) {
        rosRef.current.close();
      }
    };
  }, []);

  return (
    <View style={styles.contentContainer}>
      {imageData ? (
        <Image
          source={{ uri: imageData }}
          style={styles.video}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.placeholder}>
          <Button
            title="Connect"
            onPress={() => {
              if (rosRef.current && status !== "Connected") {
                rosRef.current.connect(ROS_URL);
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
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: 350,
    height: 275,
    justifyContent: "center",
    alignItems: "center",
  },
});
