import { ReactNativeJoystick } from "@korsolutions/react-native-joystick";

function CameraControl() {
  return (
    <ReactNativeJoystick
      color="#06b6d4"
      radius={100}
      onMove={(data) => console.log(data)}
    />
  );
}

export default CameraControl;
