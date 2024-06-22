import { NativeModules } from "react-native";
const { GameControllerModule } = NativeModules;

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
