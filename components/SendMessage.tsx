import React, { useState } from "react";

// @ts-ignore
import * as ROSLIB from "roslib";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button, StyleSheet } from "react-native";

interface ErrorType {
  isTrusted: boolean;
  message: string;
}

function SendMessage() {
  const [status, setStatus] = useState("Not connected");
  const ros = new ROSLIB.Ros({ encoding: "ascii" });

  function connect() {
    ros.connect("ws://microros-pi5:9090");
    // won't let the user connect more than once
    ros.on("error", function (error: ErrorType) {
      console.log(error);
      setStatus(error.message);
    });

    // Find out exactly when we made a connection.
    ros.on("connection", function () {
      console.log("Connected!");
      setStatus("Connected!");

      ros.getTopics(function (topics: any) {
        console.log(topics);
      });
    });

    ros.on("close", function () {
      console.log("Connection closed");
      setStatus("Connection closed");
    });
  }

  function handleConnectButton() {
    if (status !== "Connected!") {
      connect();
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText>{status}</ThemedText>
      <Button title="Connect" onPress={handleConnectButton} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },
});

export default SendMessage;
