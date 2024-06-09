export type MoveJoystickEvent = {
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

export type CameraServoPosition = {
  x: number;
  y: number;
};

export const CameraServoConstrains = {
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

export const SpeedConstrains = {
  max_speed: 1.0, // Maximum linear speed
  max_angular_speed: 1.0, // Maximum angular speed
};

export const JoystickConstrains = {
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
