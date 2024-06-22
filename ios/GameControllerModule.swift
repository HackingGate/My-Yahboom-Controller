//
//  GameControllerModule.swift
//  MyYahboomController
//
//  Created by H G on 2024/06/22.
//

import Foundation
import GameController
import React

@objc(GameControllerModule)
class GameControllerModule: RCTEventEmitter {

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func supportedEvents() -> [String]! {
    return ["onGamepadValueChange"]
  }

  @objc(connectController:rejecter:)
  func connectController(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(self.handleControllerDidConnect),
      name: NSNotification.Name.GCControllerDidConnect,
      object: nil
    )

    GCController.startWirelessControllerDiscovery { }
    resolve("Controller discovery started")
  }

  @objc(disconnectController:rejecter:)
  func disconnectController(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    NotificationCenter.default.removeObserver(
      self,
      name: NSNotification.Name.GCControllerDidConnect,
      object: nil
    )
    GCController.stopWirelessControllerDiscovery()
    resolve("Controller discovery stopped")
  }

  @objc
  func handleControllerDidConnect(notification: NSNotification) {
    guard let controller = notification.object as? GCController else { return }
    let exGamepad = controller.extendedGamepad
    exGamepad?.valueChangedHandler = { gamepad, element in
      self.handleGamepadValueChange(gamepad: gamepad, element: element)
    }
  }

  func handleGamepadValueChange(gamepad: GCExtendedGamepad, element: GCControllerElement) {
    // Here we create a dictionary to send to JavaScript
    var eventData: [String: Any] = [:]

    // Populate the eventData dictionary with relevant information
    eventData["element"] = "\(element)"  // Custom serialization of the element
    // Face buttons
    if gamepad.buttonA == element {
      eventData["buttonA"] = gamepad.buttonA.value
    }
    if gamepad.buttonB == element {
      eventData["buttonB"] = gamepad.buttonB.value
    }
    if gamepad.buttonX == element {
      eventData["buttonX"] = gamepad.buttonX.value
    }
    if gamepad.buttonY == element {
      eventData["buttonY"] = gamepad.buttonY.value
    }
    // Two shoulders
    if gamepad.leftShoulder == element {
      eventData["leftShoulder"] = gamepad.leftShoulder.value
    }
    if gamepad.rightShoulder == element {
      eventData["rightShoulder"] = gamepad.rightShoulder.value
    }
    // Two triggers
    if gamepad.leftTrigger == element {
      eventData["leftTrigger"] = gamepad.leftTrigger.value
    }
    if gamepad.rightTrigger == element {
      eventData["rightTrigger"] = gamepad.rightTrigger.value
    }
    // Two thumbstick buttons
    if gamepad.leftThumbstickButton == element {
      eventData["leftThumbstickButton"] = gamepad.leftThumbstickButton?.value
    }
    if gamepad.rightThumbstickButton == element {
      eventData["rightThumbstickButton"] = gamepad.rightThumbstickButton?.value
    }
    // Two thumbsticks
    if gamepad.leftThumbstick == element {
      eventData["leftThumbstickX"] = gamepad.leftThumbstick.xAxis.value
      eventData["leftThumbstickY"] = gamepad.leftThumbstick.yAxis.value
    }
    if gamepad.rightThumbstick == element {
      eventData["rightThumbstickX"] = gamepad.rightThumbstick.xAxis.value
      eventData["rightThumbstickY"] = gamepad.rightThumbstick.yAxis.value
    }
    // Directional pad
    if gamepad.dpad == element {
      eventData["dpadX"] = gamepad.dpad.xAxis.value
      eventData["dpadY"] = gamepad.dpad.yAxis.value
    }

    self.sendEvent(withName: "onGamepadValueChange", body: eventData)
  }
}
