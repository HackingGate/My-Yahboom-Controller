import React, { useState } from "react";

// @ts-ignore
import * as ROSLIB from "roslib";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button, TextInput, StyleSheet } from "react-native";

interface ErrorType {
  isTrusted: boolean;
  message: string;
}

function SendMessage() {
  const [status, setStatus] = useState("Not connected");
  const [linear, setLinear] = useState({ x: 0, y: 0, z: 0 });
  const [angular, setAngular] = useState({ x: 0, y: 0, z: 0 });
  const ros = new ROSLIB.Ros({ encoding: "ascii" });

  function convert(input: string) {
    if (input.charAt(0) === "-") {
      let x = input.slice(0);
      return parseInt(x);
    } else {
      return parseInt(input);
    }
  }

  function connect() {
    ros.connect("ws://localhost:9090");
    // won't let the user connect more than once
    ros.on("error", function (error: ErrorType) {
      console.log(error);
      setStatus(error.message);
    });

    // Find out exactly when we made a connection.
    ros.on("connection", function () {
      console.log("Connected!");
      setStatus("Connected!");
    });

    ros.on("close", function () {
      console.log("Connection closed");
      setStatus("Connection closed");
    });
  }

  function publish() {
    if (status !== "Connected!") {
      connect();
    }
    const cmdVel = new ROSLIB.Topic({
      ros: ros,
      name: "pose_topic",
      messageType: "geometry_msgs/Pose2D",
    });

    const data = {
      x: linear.x,
      y: linear.y,
      theta: angular.z,
    };

    // publishes to the queue
    console.log("msg", data);
    cmdVel.publish(data);
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText>{status}</ThemedText>
      <ThemedText>Send a message to turtle</ThemedText>
      <ThemedText>Linear:</ThemedText>
      <ThemedText>X</ThemedText>
      <TextInput
        style={styles.input}
        value={linear.x.toString()}
        onChangeText={(value) => setLinear({ ...linear, x: convert(value) })}
      />
      <ThemedText>Y</ThemedText>
      <TextInput
        style={styles.input}
        value={linear.y.toString()}
        onChangeText={(value) => setLinear({ ...linear, y: convert(value) })}
      />
      <ThemedText>Z</ThemedText>
      <TextInput
        style={styles.input}
        value={linear.z.toString()}
        onChangeText={(value) => setLinear({ ...linear, z: convert(value) })}
      />
      <ThemedText>Angular:</ThemedText>
      <ThemedText>X</ThemedText>
      <TextInput
        style={styles.input}
        value={angular.x.toString()}
        onChangeText={(value) => setAngular({ ...angular, x: convert(value) })}
      />
      <ThemedText>Y</ThemedText>
      <TextInput
        style={styles.input}
        value={angular.y.toString()}
        onChangeText={(value) => setAngular({ ...angular, y: convert(value) })}
      />
      <ThemedText>Z</ThemedText>
      <TextInput
        style={styles.input}
        value={angular.z.toString()}
        onChangeText={(value) => setAngular({ ...angular, z: convert(value) })}
      />
      <Button title="Publish" onPress={publish} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
  },
});

export default SendMessage;
