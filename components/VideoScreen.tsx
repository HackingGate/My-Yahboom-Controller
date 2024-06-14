import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Image } from "react-native";
// @ts-ignore
import ROSLIB from "roslib";
import { useRos } from "@/context/RosContext";

export default function VideoScreen() {
  const [status, setStatus] = useState("Not connected");
  const [imageData, setImageData] = useState<string | null>(null);
  const rosRef = useRef<ROSLIB.Ros | null>(null);
  const topicRef = useRef<ROSLIB.Topic | null>(null);
  const { rosUrl, setRosUrl } = useRos(); // Use the ROS URL from context

  useEffect(() => {
    const ros = new ROSLIB.Ros();
    rosRef.current = ros;

    ros.on("connection", () => {
      console.log("Connected to ROS.");
      setStatus("Connected");

      const topic = new ROSLIB.Topic({
        ros,
        name: "/compressed_video/webp",
        messageType: "sensor_msgs/CompressedImage",
      });

      topic.subscribe((message: any) => {
        const imageData = "data:image/webp;base64," + message.data;
        setImageData(imageData);
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

  return (
    <View style={styles.contentContainer}>
      {imageData && (
        <Image
          source={{ uri: imageData }}
          style={styles.video}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
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
  textInput: {
    padding: 10,
  },
});
