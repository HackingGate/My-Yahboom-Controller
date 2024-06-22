//
//  GameControllerModule.m
//  MyYahboomController
//
//  Created by H G on 2024/06/22.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(GameControllerModule, NSObject)

RCT_EXTERN_METHOD(connectController:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(disconnectController:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end
