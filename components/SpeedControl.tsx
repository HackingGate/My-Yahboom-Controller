import React, { useEffect, useRef, useCallback } from "react";
import { ReactNativeJoystick } from "@korsolutions/react-native-joystick";
// @ts-ignore
import ROSLIB from "roslib";
import {
  JoystickConstrains,
  MoveJoystickEvent,
  SpeedConstrains,
} from "@/common/common_control";
import { useRos } from "@/context/RosContext";

function SpeedControl() {
  const rosRef = useRef<ROSLIB.Ros | null>(null);
  const speedTopicRef = useRef<ROSLIB.Topic | null>(null);
  const { rosUrl } = useRos(); // Use the ROS URL from context

  useEffect(() => {
    const ros = new ROSLIB.Ros();

    ros.on("connection", () => {
      console.log("Connected to ROS.");

      // Initialize topic after connection
      const speedTopic = new ROSLIB.Topic({
        ros,
        name: "/cmd_vel",
        messageType: "geometry_msgs/Twist",
      });

      speedTopicRef.current = speedTopic;
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

  const handleMove = useCallback((data: MoveJoystickEvent) => {
    let y = data.position.y;
    y = y - JoystickConstrains.max_down();
    y = y - JoystickConstrains.y_range() / 2;
    y = (y * SpeedConstrains.max_speed) / (JoystickConstrains.y_range() / 2);

    let x = data.position.x;
    x = x - JoystickConstrains.max_left();
    x = x - JoystickConstrains.x_range() / 2;
    x =
      (x * SpeedConstrains.max_angular_speed) /
      (JoystickConstrains.x_range() / 2);

    handleJoystick({ linear: y, angular: -x });
  }, []);

  const handleStop = useCallback(() => {
    handleJoystick({ linear: 0, angular: 0 });
  }, []);

  const handleJoystick = useCallback(
    (data: { linear: number; angular: number }) => {
      if (!speedTopicRef.current) {
        console.log("ROS is not connected.");
        return;
      }

      const speedMessage = new ROSLIB.Message({
        linear: { x: data.linear, y: 0.0, z: 0.0 },
        angular: { x: 0.0, y: 0.0, z: data.angular },
      });

      speedTopicRef.current.publish(speedMessage);

      console.log(
        `Published to /cmd_vel: linear=${data.linear}, angular=${data.angular}`,
      );
    },
    [],
  );

  return (
    <ReactNativeJoystick
      color="#06b6d4"
      radius={JoystickConstrains.radius}
      onMove={handleMove}
      onStop={handleStop}
    />
  );
}

export default SpeedControl;