import React, { useCallback, useEffect, useRef } from "react";
import { NativeEventEmitter, NativeModules } from "react-native";
// @ts-ignore
import ROSLIB from "roslib";
import { useRos } from "@/context/RosContext";
import { CameraServoConstrains } from "@/common/common_control";
import { RESET_AND_SYNC_INTERVAL_MS } from "@/config";

const { GameControllerModule } = NativeModules;

const gameControllerEmitter = new NativeEventEmitter(GameControllerModule);

const GameController: React.FC = () => {
  const { rosUrl } = useRos(); // Use the ROS URL from context

  const rosRef = useRef<ROSLIB.Ros | null>(null);
  const servoS1TopicRef = useRef<ROSLIB.Topic | null>(null);
  const servoS2TopicRef = useRef<ROSLIB.Topic | null>(null);
  const beepTopicRef = useRef<ROSLIB.Topic | null>(null);
  const rightThumbstickRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rightThumbstickButtonRef = useRef<number>(0);
  const leftThumbstickButtonRef = useRef<number>(0);
  const speedTopicRef = useRef<ROSLIB.Topic | null>(null);
  const leftTriggerRef = useRef<number>(0);
  const rightTriggerRef = useRef<number>(0);
  const leftThumbstickRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rightShoulderRef = useRef<number>(0);
  const leftShoulderRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const ros = new ROSLIB.Ros();

    ros.on("connection", () => {
      console.log("Connected to ROS.");

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

      const beepTopic = new ROSLIB.Topic({
        ros,
        name: "/beep",
        messageType: "std_msgs/UInt16",
      });

      const speedTopic = new ROSLIB.Topic({
        ros,
        name: "/cmd_vel",
        messageType: "geometry_msgs/Twist",
      });

      servoS1TopicRef.current = servoS1Topic;
      servoS2TopicRef.current = servoS2Topic;
      beepTopicRef.current = beepTopic;
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

  const checkConnection = async (): Promise<boolean> => {
    try {
      const isConnected = await GameControllerModule.checkControllerConnected();
      console.log("Controller Connected:", isConnected);
      return isConnected;
    } catch (error) {
      console.error("Failed to check controller connection", error);
      return false;
    }
  };

  const syncToController = useCallback(() => {
    handleCamera({
      x: rightThumbstickRef.current.x,
      y: rightThumbstickRef.current.y,
    });
    handleBeep(
      rightThumbstickButtonRef.current || leftThumbstickButtonRef.current,
    );
    const linear = rightTriggerRef.current - leftTriggerRef.current;
    const angularByShoulder =
      -(rightShoulderRef.current - leftShoulderRef.current) * 3.0;
    const angularByLeftThumbstick = -leftThumbstickRef.current.x * linear * 6.0;
    handleSpeed({
      linear: linear,
      angular: angularByShoulder + angularByLeftThumbstick,
    });
  }, []);

  const startSyncInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(
      syncToController,
      RESET_AND_SYNC_INTERVAL_MS,
    );
  }, [syncToController]);

  const stopSyncInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const handleCamera = (data: { x: number; y: number }) => {
    if (!servoS1TopicRef.current || !servoS2TopicRef.current) {
      console.log("ROS is not connected.");
      return;
    }

    let x = data.x;
    x = x + 1;
    x = (x * CameraServoConstrains.servo_s1.range()) / 2;
    x = x + CameraServoConstrains.servo_s1.min_angle;

    const servoS1Message = new ROSLIB.Message({
      data: Math.round(x),
    });
    servoS1TopicRef.current.publish(servoS1Message);

    let y = data.y;
    y = y + 1;
    y = (y * CameraServoConstrains.servo_s2.range()) / 2;
    y = y + CameraServoConstrains.servo_s2.min_angle;
    if (y < -90) {
      y = -90;
    }
    const servoS2Message = new ROSLIB.Message({
      data: Math.round(y),
    });
    servoS2TopicRef.current.publish(servoS2Message);

    console.log(`Published to /servo_s1: ${servoS1Message.data}`);
    console.log(`Published to /servo_s2: ${servoS2Message.data}`);
  };

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

  const handleSpeed = (data: { linear: number; angular: number }) => {
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
  };

  useEffect(() => {
    const handleGamepadValueChange = async (event: any) => {
      await checkConnection();

      startSyncInterval();

      if (
        event.rightThumbstickX !== undefined ||
        event.rightThumbstickY !== undefined
      ) {
        rightThumbstickRef.current = {
          x: event.rightThumbstickX,
          y: event.rightThumbstickY,
        };
        handleCamera({
          x: event.rightThumbstickX,
          y: event.rightThumbstickY,
        });
      }

      if (
        event.rightThumbstickButton !== undefined ||
        event.leftThumbstickButton !== undefined
      ) {
        rightThumbstickButtonRef.current = event.rightThumbstickButton;
        leftThumbstickButtonRef.current = event.leftThumbstickButton;
        handleBeep(event.rightThumbstickButton || event.leftThumbstickButton);
      }

      if (event.rightTrigger !== undefined) {
        rightTriggerRef.current = event.rightTrigger;
      }

      if (event.leftTrigger !== undefined) {
        leftTriggerRef.current = event.leftTrigger;
      }

      if (
        event.leftThumbstickX !== undefined ||
        event.leftThumbstickY !== undefined
      ) {
        leftThumbstickRef.current = {
          x: event.leftThumbstickX,
          y: event.leftThumbstickY,
        };
      }

      if (
        event.rightShoulder !== undefined ||
        event.leftShoulder !== undefined
      ) {
        rightShoulderRef.current = event.rightShoulder || 0;
        leftShoulderRef.current = event.leftShoulder || 0;
      }

      if (
        event.rightTrigger !== undefined ||
        event.leftTrigger !== undefined ||
        event.leftThumbstickX !== undefined ||
        event.leftThumbstickY !== undefined ||
        event.rightShoulder !== undefined ||
        event.leftShoulder !== undefined
      ) {
        const linear = rightTriggerRef.current - leftTriggerRef.current;
        const angularByShoulder =
          -(rightShoulderRef.current - leftShoulderRef.current) * 3.0;
        const angularByLeftThumbstick =
          -leftThumbstickRef.current.x * linear * 6.0;
        handleSpeed({
          linear: linear,
          angular: angularByShoulder + angularByLeftThumbstick,
        });
      }

      // Other event handling can remain the same
      if (event.buttonA !== undefined) {
        console.log("ButtonA Value:", event.buttonA);
      }
      if (event.buttonB !== undefined) {
        console.log("ButtonB Value:", event.buttonB);
      }
      if (event.buttonX !== undefined) {
        console.log("ButtonX Value:", event.buttonX);
      }
      if (event.buttonY !== undefined) {
        console.log("ButtonY Value:", event.buttonY);
      }
      if (event.leftShoulder !== undefined) {
        console.log("LeftShoulder Value:", event.leftShoulder);
      }
      if (event.rightShoulder !== undefined) {
        console.log("RightShoulder Value:", event.rightShoulder);
      }
      if (event.leftTrigger !== undefined) {
        console.log("LeftTrigger Value:", event.leftTrigger);
      }
      if (event.rightTrigger !== undefined) {
        console.log("RightTrigger Value:", event.rightTrigger);
      }
      if (event.leftThumbstickButton !== undefined) {
        console.log("LeftThumbstickButton Value:", event.leftThumbstickButton);
      }
      if (event.rightThumbstickButton !== undefined) {
        console.log(
          "RightThumbstickButton Value:",
          event.rightThumbstickButton,
        );
      }
      if (event.dpadX !== undefined) {
        console.log("DpadX Value:", event.dpadX);
      }
      if (event.dpadY !== undefined) {
        console.log("DpadY Value:", event.dpadY);
      }
    };

    const listener = gameControllerEmitter.addListener(
      "onGamepadValueChange",
      handleGamepadValueChange,
    );

    return () => {
      listener.remove();
    };
  }, []);

  return null;
};

const connectController = async () => {
  try {
    const response = await GameControllerModule.connectController();
    console.log(response);
  } catch (error) {
    console.error("Failed to connect controller", error);
  }
};

const disconnectController = async () => {
  try {
    const response = await GameControllerModule.disconnectController();
    console.log(response);
  } catch (error) {
    console.error("Failed to disconnect controller", error);
  }
};

const checkControllerConnected = async (): Promise<boolean> => {
  try {
    const isConnected = await GameControllerModule.checkControllerConnected();
    console.log("Controller Connected:", isConnected);
    return isConnected;
  } catch (error) {
    console.error("Failed to check controller connection", error);
    return false;
  }
};

export default {
  connectController,
  disconnectController,
  checkControllerConnected,
  gameControllerEmitter,
  GameController,
};
