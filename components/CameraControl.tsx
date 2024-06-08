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

type Position = {
  x: number;
  y: number;
};

const ServoConstrains = {
  servo_s1: {
    def_angle: 0,
    min_angle: -90,
    max_angle: 90,
    range: function () {
      return this.max_angle - this.min_angle;
    },
  },
  servo_s2: {
    def_angle: -60,
    min_angle: -140,
    max_angle: 20,
    range: function () {
      return this.max_angle - this.min_angle;
    },
  },
};

const JoystickConstrains = {
  radius: 112.5,
  def_radius: 75, // Do not change
  max_left: function () {
    return (this.radius / this.def_radius) * -25;
  },
  max_right: function () {
    return (this.radius / this.def_radius) * 125;
  },
  x_range: function () {
    return this.max_right() - this.max_left();
  },
  max_down: function () {
    return (this.radius / this.def_radius) * -25;
  },
  max_up: function () {
    return (this.radius / this.def_radius) * 125;
  },
  y_range: function () {
    return this.max_up() - this.max_down();
  },
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
    let x = data.position.x;
    x = x - JoystickConstrains.max_left();
    x = (x * ServoConstrains.servo_s1.range()) / JoystickConstrains.x_range();
    x = x + ServoConstrains.servo_s1.min_angle;

    let y = data.position.y;
    y = y - JoystickConstrains.max_down();
    y = (y * ServoConstrains.servo_s2.range()) / JoystickConstrains.y_range();
    y = y + ServoConstrains.servo_s2.min_angle;
    if (y < -90) {
      y = -90;
    }

    handleJoystick({ x: x, y: y });
  }, []);

  const handleStop = useCallback((data: MoveJoystickEvent) => {
    handleJoystick({
      x: data.position.x + ServoConstrains.servo_s1.def_angle,
      y: data.position.y + ServoConstrains.servo_s2.def_angle,
    });
  }, []);

  const handleJoystick = useCallback((data: Position) => {
    if (!servoS1TopicRef.current || !servoS2TopicRef.current) {
      console.log("ROS is not connected.");
      return;
    }

    const servoS1Message = new ROSLIB.Message({
      data: Math.round(data.x + ServoConstrains.servo_s1.def_angle),
    });
    servoS1TopicRef.current.publish(servoS1Message);

    const servoS2Message = new ROSLIB.Message({
      data: Math.round(data.y),
    });
    servoS2TopicRef.current.publish(servoS2Message);

    console.log(`Published to /servo_s1: ${servoS1Message.data}`);
    console.log(`Published to /servo_s2: ${servoS2Message.data}`);
  }, []);

  return (
    <ReactNativeJoystick
      color="#06b6d4"
      radius={JoystickConstrains.radius}
      onMove={handleMove}
      onStop={handleStop}
    />
  );
}

export default CameraControl;
