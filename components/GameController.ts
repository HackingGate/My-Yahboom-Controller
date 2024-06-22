import { NativeEventEmitter, NativeModules } from "react-native";

const { GameControllerModule } = NativeModules;

const gameControllerEmitter = new NativeEventEmitter(GameControllerModule);

gameControllerEmitter.addListener("onGamepadValueChange", (event) => {
  console.log("Gamepad Value Changed:", event);
  // Face buttons
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
  // Two shoulders
  if (event.leftShoulder !== undefined) {
    console.log("LeftShoulder Value:", event.leftShoulder);
  }
  if (event.rightShoulder !== undefined) {
    console.log("RightShoulder Value:", event.rightShoulder);
  }
  // Two triggers
  if (event.leftTrigger !== undefined) {
    console.log("LeftTrigger Value:", event.leftTrigger);
  }
  if (event.rightTrigger !== undefined) {
    console.log("RightTrigger Value:", event.rightTrigger);
  }
  // Two thumbstick buttons
  if (event.leftThumbstickButton !== undefined) {
    console.log("LeftThumbstickButton Value:", event.leftThumbstickButton);
  }
  if (event.rightThumbstickButton !== undefined) {
    console.log("RightThumbstickButton Value:", event.rightThumbstickButton);
  }
  // Two thumbsticks
  if (event.leftThumbstickX !== undefined) {
    console.log("LeftThumbstickX Value:", event.leftThumbstickX);
  }
  if (event.leftThumbstickY !== undefined) {
    console.log("LeftThumbstickY Value:", event.leftThumbstickY);
  }
  if (event.rightThumbstickX !== undefined) {
    console.log("RightThumbstickX Value:", event.rightThumbstickX);
  }
  if (event.rightThumbstickY !== undefined) {
    console.log("RightThumbstickY Value:", event.rightThumbstickY);
  }
  // Directional pad
  if (event.dpadX !== undefined) {
    console.log("DpadX Value:", event.dpadX);
  }
  if (event.dpadY !== undefined) {
    console.log("DpadY Value:", event.dpadY);
  }
});

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

export default {
  connectController,
  disconnectController,
};
