/*!
 * ASP.NET SignalR JavaScript Library v2.2.2
 * http://signalr.net/
 *
 * Copyright (c) .NET Foundation. All rights reserved.
 * Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
 *
 */

/// <reference path="..\..\SignalR.Client.JS\Scripts\jquery-1.6.4.js" />
/// <reference path="jquery.signalR.js" />
//Last Modified 2017-08-23
( function () {
	/// <param name="$" type="jQuery" />
	"use strict";

	if ( typeof ( $.signalR ) !== "function" ) {
		throw new Error( "SignalR: SignalR is not loaded. Please ensure jquery.signalR-x.js is referenced before ~/signalr/js." );
	}

	//var signalR = $.signalR;
	var _worker = {
		makeProxyCallback: function ( hub, callback ) {
			return function () {
				if ( typeof ( callback ) !== 'function' ) {
					console.log( 'INVALID CALLBACK DEFINED!!!' );
					return;
				}
				// Call the client hub method
				callback.apply( hub, $.makeArray( arguments ) );
			};
		},
		registerHubProxies: function ( instance, shouldSubscribe ) {
			var key, hub, memberKey, memberValue, subscriptionMethod;
			if ( instance === null ) return;
			if ( typeof ( instance ) !== 'object' ) return;
			for ( key in instance ) {
				if ( instance.hasOwnProperty( key ) ) {
					hub = instance[key];
					if ( !( hub.hubName ) ) {
						// Not a client hub
						continue;
					}
					shouldSubscribe ? (
						//We want to subscribe to the hub events
						subscriptionMethod = hub.on
					) : (
							// We want to unsubscribe from the hub events
							subscriptionMethod = hub.off
						);
					// Loop through all members on the hub and find client hub functions to subscribe/unsubscribe
					for ( memberKey in hub.client ) {
						if ( !hub.client.hasOwnProperty( memberKey ) ) {
							continue;
						}
						memberValue = hub.client[memberKey];
						if ( typeof ( memberValue ) !== 'function' ) {
							// Not a client hub function
							continue;
						}
						subscriptionMethod.call( hub, memberKey, this.makeProxyCallback( hub, memberValue ) );
					}
				}
			}
			return;
		}
	};
	$.hubConnection.prototype.createHubProxies = function () {
		var proxies = {};
		this.starting( function () {
			// Register the hub proxies as subscribed
			// (instance, shouldSubscribe)
			_worker.registerHubProxies( proxies, true );
			this._registerSubscribedHubs();
			return;
		} ).disconnected( function () {
			// Unsubscribe all hub proxies when we "disconnect".  This is to ensure that we do not re-add functional call backs.
			// (instance, shouldSubscribe)
			_worker.registerHubProxies( proxies, false );
			return;
		} );

		proxies['manager'] = this.createHubProxy( 'manager' );
		proxies['manager'].client = {};
		proxies['manager'].server = {
			//[Authorize]
			onMessageBoxKeyUp: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnMessageBoxKeyUp"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			sginOut: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["SginOut"], $.makeArray( arguments ) ) );
			},
			//[ADMIN]
			getConnectedUserObject: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["GetConnectedUserObject"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			getTotalConnectedUser: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["GetTotalConnectedUser"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			executeIo: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["ExecuteIo"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			alert: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["Alert"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			broadcastToGroups: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["BroadcastToGroups"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			clientTaskActivity: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["ClientTaskActivity"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			connect: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["Connect"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			desktopTaskMonitoringDataReceive: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["DesktopTaskMonitoringDataReceive"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			getConnectedClient: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["GetConnectedClient"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			getGlobalMessage: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["GetGlobalMessage"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			isAdmin: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["IsAdmin"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			notificationCount: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["NotificationCount"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onColoseChatBox: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnColoseChatBox"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onDesktopMonitoringUserClick: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnDesktopMonitoringUserClick"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onDesktopTaskMonitoringDataResponse: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnDesktopTaskMonitoringDataResponse"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onGeneralMessageBrodCast: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnGeneralMessageBrodCast"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onGlobalMessage: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnGlobalMessage"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onNotificationClick: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnNotificationClick"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onNotificationCount: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnNotificationCount"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onOpenChatBox: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnOpenChatBox"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onReceiveByte: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnReceiveByte"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onResponseByte: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnResponseByte"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onSendPrivateMessage: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnSendPrivateMessage"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onSMSNotificationClick: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnSMSNotificationClick"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onSMSNotificationCount: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnSMSNotificationCount"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onTaskBegain: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnTaskBegain"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onTaskEnd: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnTaskEnd"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onTaskMonitoringDataResponse: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnTaskMonitoringDataResponse"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onTaskMonitoringUserClick: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnTaskMonitoringUserClick"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			onThroughExecption: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["OnThroughExecption"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			receiveByte: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["ReceiveByte"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			send: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["Send"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			sMSNotificationCount: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["SMSNotificationCount"], $.makeArray( arguments ) ) );
			},
			//[Authorize]
			startMessaging: function () {
				return proxies['manager'].invoke.apply( proxies['manager'], $.merge( ["StartMessaging"], $.makeArray( arguments ) ) );
			}
		};
		return proxies;
	};
	var signalR = $.signalR;
	signalR.hub = $.hubConnection( "https://tripecosys.pc/api/Manager", { useDefaultPath: false } );
	$.extend( signalR, signalR.hub.createHubProxies() );
	signalR = undefined;
	return;
}() );