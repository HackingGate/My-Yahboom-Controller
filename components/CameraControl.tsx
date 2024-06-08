import React, { useEffect, useRef, useCallback } from "react";
import { ReactNativeJoystick } from "@korsolutions/react-native-joystick";
// @ts-ignore
import ROSLIB from "roslib";

const ROS_URL = "ws://microros-pi5:9090"; // Update with your ROS WebSocket URL

type MoveJoystickEvent = {
  type: "move" | "stop" | "start";
  position: {
    x: number;
    y: number;
  };
  force: number;
  angle: {
    radian: number;
    degree: number;
  };
};

function CameraControl() {
  const rosRef = useRef<ROSLIB.Ros | null>(null);
  const servoS1TopicRef = useRef<ROSLIB.Topic | null>(null);
  const servoS2TopicRef = useRef<ROSLIB.Topic | null>(null);

  useEffect(() => {
    const ros = new ROSLIB.Ros();

    ros.on("connection", () => {
      console.log("Connected to ROS.");

      // Initialize topics after connection
      const servoS1Topic = new ROSLIB.Topic({
        ros,
        name: "/servo_s1",
        messageType: "std_msgs/Int32",
      });

      const servoS2Topic = new ROSLIB.Topic({
        ros,
        name: "/servo_s2",
        messageType: "std_msgs/Int32",
      });

      servoS1TopicRef.current = servoS1Topic;
      servoS2TopicRef.current = servoS2Topic;
    });

    ros.on("error", (error: any) => {
      console.log("Error connecting to ROS:", error);
    });

    ros.on("close", () => {
      console.log("Connection to ROS closed.");
    });

    ros.connect(ROS_URL);
    rosRef.current = ros;

    return () => {
      if (rosRef.current) {
        rosRef.current.close();
      }
    };
  }, []);

  const handleMove = useCallback((data: MoveJoystickEvent) => {
    if (!servoS1TopicRef.current || !servoS2TopicRef.current) {
      console.log("ROS is not connected.");
      return;
    }

    const servoS1Message = new ROSLIB.Message({
      data: Math.round(data.position.x), // Ensure the data is an integer
    });
    servoS1TopicRef.current.publish(servoS1Message);

    const servoS2Message = new ROSLIB.Message({
      data: Math.round(data.position.y), // Ensure the data is an integer
    });
    servoS2TopicRef.current.publish(servoS2Message);

    console.log(`Published to /servo_s1: ${servoS1Message.data}`);
    console.log(`Published to /servo_s2: ${servoS2Message.data}`);
  }, []);

  return (
    <ReactNativeJoystick color="#06b6d4" radius={100} onMove={handleMove} />
  );
}

export default CameraControl;
