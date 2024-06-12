import React, { useEffect, useRef, useCallback, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  LongPressGestureHandler,
  State,
  GestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
// @ts-ignore
import ROSLIB from "roslib";
import { useRos } from "@/context/RosContext";
import { RESET_INTERVAL_MS } from "@/config";

function BeepControl() {
  const rosRef = useRef<ROSLIB.Ros | null>(null);
  const beepTopicRef = useRef<ROSLIB.Topic | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { rosUrl } = useRos(); // Use the ROS URL from context
  const [isPressed, setIsPressed] = useState(false); // State to track button press

  useEffect(() => {
    const ros = new ROSLIB.Ros();

    ros.on("connection", () => {
      console.log("Connected to ROS.");

      // Initialize beep topic after connection
      const beepTopic = new ROSLIB.Topic({
        ros,
        name: "/beep",
        messageType: "std_msgs/UInt16",
      });

      beepTopicRef.current = beepTopic;
    });

    ros.on("error", (error: any) => {
      console.log("Error connecting to ROS:", error);
    });

    ros.on("close", () => {
      console.log("Connection to ROS closed.");
    });

    ros.connect(rosUrl);
    rosRef.current = ros;

    return () => {
      if (rosRef.current) {
        rosRef.current.close();
      }
    };
  }, [rosUrl]);

  const handleBeep = useCallback((duration: number) => {
    if (!beepTopicRef.current) {
      console.log("ROS is not connected.");
      return;
    }

    const beepMessage = new ROSLIB.Message({
      data: duration,
    });
    beepTopicRef.current.publish(beepMessage);

    console.log(`Published to /beep: ${beepMessage.data}`);
  }, []);

  const startResetInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => handleBeep(0), RESET_INTERVAL_MS);
  }, [handleBeep]);

  const stopResetInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const onHandlerStateChange = useCallback(
    ({ nativeEvent }: GestureHandlerStateChangeEvent) => {
      if (nativeEvent.state === State.BEGAN) {
        setIsPressed(true);
        stopResetInterval();
        handleBeep(1);
      } else if (
        nativeEvent.state === State.END ||
        nativeEvent.state === State.CANCELLED ||
        nativeEvent.state === State.FAILED
      ) {
        setIsPressed(false);
        startResetInterval();
        handleBeep(0);
      }
    },
    [handleBeep, startResetInterval, stopResetInterval],
  );

  return (
    <View style={styles.container}>
      <LongPressGestureHandler onHandlerStateChange={onHandlerStateChange}>
        <View style={[styles.button, isPressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>Beep</Text>
        </View>
      </LongPressGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    padding: 20,
    backgroundColor: "blue",
    borderRadius: 10,
    elevation: 3,
  },
  buttonPressed: {
    backgroundColor: "darkblue",
    elevation: 0,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
});

export default BeepControl;
