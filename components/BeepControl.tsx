import React, { useEffect, useRef, useCallback } from "react";
import { View, Text } from "react-native";
import {
  TapGestureHandler,
  State,
  GestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
// @ts-ignore
import ROSLIB from "roslib";
import { useRos } from "@/context/RosContext";

function BeepControl() {
  const rosRef = useRef<ROSLIB.Ros | null>(null);
  const beepTopicRef = useRef<ROSLIB.Topic | null>(null);
  const { rosUrl } = useRos(); // Use the ROS URL from context

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

  const onHandlerStateChange = useCallback(
    ({ nativeEvent }: GestureHandlerStateChangeEvent) => {
      if (nativeEvent.state === State.BEGAN) {
        handleBeep(1);
      } else if (
        nativeEvent.state === State.END ||
        nativeEvent.state === State.CANCELLED ||
        nativeEvent.state === State.FAILED
      ) {
        handleBeep(0);
      }
    },
    [handleBeep],
  );

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TapGestureHandler onHandlerStateChange={onHandlerStateChange}>
        <View style={{ padding: 20, backgroundColor: "blue" }}>
          <Text style={{ color: "white" }}>Beep</Text>
        </View>
      </TapGestureHandler>
    </View>
  );
}

export default BeepControl;
