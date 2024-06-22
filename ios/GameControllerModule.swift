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
class GameControllerModule: NSObject {

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
      // Handle value changes
    }
  }
}
