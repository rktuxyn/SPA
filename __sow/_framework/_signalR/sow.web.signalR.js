( typeof window.Sow.define !== 'function'
	|| typeof window.Sow.registerNamespace !== 'function'
	|| typeof ( $.signalR ) !== "function"
	? console.error( 'Sow.Web.Signalr.js couldn\'t be initilize. One of its dependency `Sow.Frameworkjs` or  Sow.Notify ' + ( typeof ( $.signalR ) !== "function" ? "SignalR: SignalR is not loaded. Please ensure jquery.signalR-x.js is referenced before ~/signalr/hubs." : "" ) + ' couldn\t load properly... Please recheck..' )
	: ( ( Sow.registerNamespace(/**[Namespace Name]*/'Sow.Net.SignalR', function () {
		return /**[modules]*/[{
			/** [Public instance module] */
			1: [function ( require, module, exports ) {

				return module.aggregate( function () {
					var isInitialize = {

					};

					var showNotification = function ( m ) {
						Sow.Notify.hideAll();
						Sow.Notify.show( m );
					};
					return {
						run: function ( cb ) {
							typeof ( cb ) !== 'function' ? cb = function () { } : undefined;
							cb.call( this );
							return;
						},
						execute: function ( hubname, fnc ) {
							if ( !isInitialize[hubname] ) {
								console.log( 'Server not initialized!!! :(' );
								return this;
							}
							if ( typeof ( fnc ) !== 'function' ) {
								console.log( "Invalid callback defined :(" );
								return this;
							}
							require( 'Sow.Net.SignalR.connectivity' ).connection( function () {
								fnc.call( this[hubname], function ( cb ) {
									return require( 'Sow.Net.SignalR.callbackStore' ).set( cb );
								} );
							} );
							return this;
						},
						restart: function ( hubname, settings, a, b ) {
							require( 'Sow.Net.SignalR.connectivity' ).server.restart( hubname, settings, a, b );
						},
						stop: function ( hubname, cb ) {
							require( 'Sow.Net.SignalR.connectivity' ).server.stop( hubname, cb );
							return this;
						},
						onConnectionSolow: function ( m ) {

							showNotification( {
								caption: 'Connection information!!!',
								content: m,
								type: 'info'
							} );
							console.log( m );
						},
						onError: function ( m ) {
							showNotification( {
								caption: 'SignalR Error!!!',
								content: m,
								type: 'info',
								keepOpen: false
							} );
						},
						onReconnecting: function ( m ) {
							showNotification( {
								caption: 'Re-Connecting!!!',
								content: m,
								type: 'info',
								keepOpen: true
							} );
						},
						onReconnected: function ( m ) {
							showNotification( {
								caption: 'Connected!!!',
								content: m,
								type: 'success'
							} );
						},
						onDisconnected: function ( m ) {
							showNotification( {
								caption: 'Disconnected!!!',
								content: m,
								type: 'alert'
							} );
						},
						onReStarting: function ( m ) {
							showNotification( {
								caption: 'Restarting!!!',
								content: m,
								type: 'success'
							} );
						},
						onReStarted: function ( m ) {
							showNotification( {
								caption: 'Restarted!!!',
								content: m,
								type: 'success'
							} );
						},
						server: {
							initialize: function ( hubname, settings, token, isChatForm ) {
								if ( isInitialize[hubname] )
									throw new Error( 'SignalR Server is already initialized!!! :(' );

								return {
									start: function ( callback, chatboxCb ) {
										typeof ( callback ) !== 'function' ? callback = function ( a, b, c ) { } : undefined;
										typeof ( chatboxCb ) !== 'function' ? chatboxCb = function ( a, b, c ) {
											callback.call( this, a, b, c );
										} : undefined;
										if ( token === undefined || token === '' ) {
											var msg = 'Invalid token defined. SignalR couldn\'t initialized. :(';
											var inst = require( 'Sow.Net.SignalR.public' );
											inst.onError( msg );
											callback.call( require( 'Sow.Net.SignalR.public' ), msg );
											console.log( msg );
											return;
										}
										isInitialize[hubname] = true;
										require( 'Sow.Net.SignalR.connectivity' ).initialize();
										var cb = function ( a, b, c ) {
											if ( typeof ( this[b] ) !== 'function' ) {
												console.log( c );
												return;
											}
											this[b]( c );
											return;
										};
										require( 'Sow.Net.SignalR.core' ).run( hubname, settings, token, function () {
											this.server.event.register( function () {
												cb.apply( this, Array.prototype.slice.call( arguments ) );
												return;
											} );
											this.client.universel.event.register( function () {
												let key = arguments[0];
												if ( key === '___NOPE__' ) {
													callback.apply( this, Array.prototype.slice.call( arguments, 1 ) );
													return;
												}
												if ( !key || key === null ) {
													callback.apply( this, Array.prototype.slice.call( arguments, 1 ) );
													return;
												}
												let cStore = require( 'Sow.Net.SignalR.callbackStore' ).get( key );
												if ( typeof ( cStore ) !== 'function' ) {
													if ( isNaN( key ) ) {
														callback.apply( this, Array.prototype.slice.call( arguments ) );
														return;
													}
													callback.apply( this, Array.prototype.slice.call( arguments, 1 ) );
													return;
												}
												cStore.apply( this, Array.prototype.slice.call( arguments, 1 ) );
												return;
											} );
											this.server.start( token, function () {
												//require('Sow.Net.SignalR.connectivity').connection.manager.server.isAdmin(token);
												//require('Sow.Net.SignalR.connectivity').connection.manager.server.onGlobalMessage('rajibs', 'hello');
											} );
											if ( !isChatForm ) return;
											this.client.message.event.register( function () {
												let key = arguments[0];
												if ( key === '___NOPE__' ) {
													chatboxCb.apply( this, Array.prototype.slice.call( arguments, 1 ) );
													return;
												}
												if ( !key || key === null ) {
													chatboxCb.apply( this, Array.prototype.slice.call( arguments, 1 ) );
													return;
												}
												let cStore = require( 'Sow.Net.SignalR.callbackStore' ).get( key );
												if ( typeof ( cStore ) !== 'function' ) {
													if ( isNaN( key ) ) {
														chatboxCb.apply( this, Array.prototype.slice.call( arguments ) );
														return;
													}
													chatboxCb.apply( this, Array.prototype.slice.call( arguments, 1 ) );
													return;
												}
												cStore.apply( this, Array.prototype.slice.call( arguments, 1 ) );
												return;
											} );
										} );
										return this;
									}
								};
							}
						}
					}
				} );
			}, {
				'Sow.Net.SignalR.public': 1,
				'Sow.Net.SignalR.core': 2,
				'Sow.Net.SignalR.connectivity': 3,
				'Sow.Net.SignalR.callbackStore': 4,
				public: true,
				owner: 'Sow.Net.SignalR.public'
			}],
			/** [/Public instance module] */
			2: [function ( require, module, exports ) {
				var STATUS_ENUM = {
					500: "INTERNALERROR",
					505: "AUTHORIZATIONERROR",
					101: "BYTEREADERROR",
					201: "DISCONNECTEDERROR",
					301: "MESSAGESENTERROR",
					401: "NULLARGUMENTERROR",
					601: "REQUIREDERROR",
					200: "SUCCESS"
				};
				return module.aggregate( function () {
					return {
						run: function ( hubname, settings, token, fn ) {
							const TOKEN = token;
							const HUBNAME = hubname;//'manager';
							const _SETTINGS = settings;
							if ( typeof ( fn ) !== 'function' )
								throw new Error( "Function required!!!" );

							fn.call( {
								server: {
									start: function ( cb ) {
										typeof ( cb ) !== 'function' ? cb = function ( t ) { } : undefined;
										require( 'Sow.Net.SignalR.connectivity' ).start( HUBNAME, _SETTINGS, function () {
											cb.call( require( 'Sow.Net.SignalR.core' ) );
										}, function () {
											cb.call( require( 'Sow.Net.SignalR.core' ), 'NOT_CONNECTED' );
										} );
										return this;
									},
									event: {
										register: function ( cb ) {
											typeof ( cb ) !== 'function' ? cb = function ( t ) { } : undefined;
											var tryingToReconnect = false;
											var _restart = function () {
												require( 'Sow.Net.SignalR.connectivity' ).server.restart( HUBNAME, _SETTINGS, function () {
													cb.call( require( 'Sow.Net.SignalR.public' ), "SERVER", "onReStarted", 'Restarted... :(' );
													return;
												}, function () {
													setTimeout( function () { _restart(); }, 1000 );
												} );
											};
											//var hub = require('Sow.Net.SignalR.connectivity').connection.hub;
											require( 'Sow.Net.SignalR.connectivity' ).connection( function () {
												this.hub.error( function ( error ) {
													console.log( 'SignalR error: ' + error );
													cb.call( require( 'Sow.Net.SignalR.public' ), "SERVER", "onError", 'SignalR error: ' + error );
												} ).connectionSlow( function () {
													console.log( 'Connection is slow....:\'(' );
													cb.call( require( 'Sow.Net.SignalR.public' ), "SERVER", "onConnectionSolow", 'Connection is slow....:\'(' );
												} ).reconnecting( function () {
													tryingToReconnect = true;
													console.log( 'Reconnecting....:)' );
													cb.call( require( 'Sow.Net.SignalR.public' ), "SERVER", "onReconnecting", 'Reconnecting..' );
												} ).reconnected( function () {
													tryingToReconnect = false;
													console.log( 'Reconnected...:)' );
													cb.call( require( 'Sow.Net.SignalR.public' ), "SERVER", "onReconnected", 'Reconnected...' );
												} ).disconnected( function () {
													console.log( 'Disconnected....:\'(' );
													cb.call( require( 'Sow.Net.SignalR.public' ), "onDisconnected", "SERVER", 'Disconnected....:\'(' );
													if ( !tryingToReconnect ) {
														require( 'Sow.Net.SignalR.connectivity' ).connection( function () {
															if ( this.hub.lastError ) {
																setTimeout( function () {
																	if ( !tryingToReconnect ) {
																		return;
																	}
																	console.log( 'Restarting....:\'(' );
																	cb.call( require( 'Sow.Net.SignalR.public' ), "SERVER", "onReStarting", 'Restarting....:\'(' );
																	tryingToReconnect = false;
																	_restart();
																	return;
																}, 5000 );
															} // Re-start connection after 5 seconds
															return;
														} );
													}
												} ).error( function () {
													/// <summary>Adds a callback that will be invoked after an error occurs with the connection</summary>
													/// <param name="callback" type="Function">A callback function to execute when an error occurs on the connection</param>
													/// <returns type="signalR" />
													console.log( arguments );
													//location.reload( true );
													tryingToReconnect = false;
													setTimeout( function () {
														if ( !tryingToReconnect ) {
															return;
														}
														tryingToReconnect = false;
														_restart();
													}, 5000 );
												} );
											} );
											return this;
										}
									}
								},
								client: {
									universel: {
										event: {
											register: function ( cb ) {
												typeof ( cb ) !== 'function' ? cb = function ( t ) { } : undefined;
												var invoke = function () {
													cb.apply( require( 'Sow.Net.SignalR.connectivity' ).server.instance( HUBNAME ), Array.prototype.slice.call( arguments ) );
												};
												require( 'Sow.Net.SignalR.connectivity' ).registerEvent( HUBNAME, 'client', {
													onIsAdmin: invoke,
													onMessageBoxKeyUp: invoke,
													onGetConnectedUserObject: invoke,
													onGetTotalConnectedUser: invoke,
													onTryReConnect: invoke,
													onExecuteIo: invoke,
													onSginOut: invoke,
													onTaskBegain: invoke,
													onClientTaskActivity: invoke,
													onTaskEnd: invoke,
													onThroughExecption: invoke,
													onGlobalMessageReceived: invoke,
													onConnected: invoke,
													onGetConnectedClient: invoke,
													onGetGlobalMessage: invoke,
													onNewUserConnected: invoke,
													onUserDisconnected: invoke
												} );
												return;
											}
										},
									},
									administrative: {
										event: {
											register: function ( cb ) {
												typeof ( cb ) !== 'function' ? cb = function ( t ) { } : undefined;
											}
										},
									},
									message: {
										event: {
											register: function ( cb ) {
												typeof ( cb ) !== 'function' ? cb = function ( t ) { } : undefined;
												var invoke = function () {
													cb.apply( require( 'Sow.Net.SignalR.connectivity' ).server.instance( HUBNAME ), Array.prototype.slice.call( arguments ) );
												};
												require( 'Sow.Net.SignalR.connectivity' ).registerEvent( HUBNAME, 'client', {
													/*[OWN]**/
													onMessageBoxKeyUp: invoke,
													onColoseChatBox: invoke,
													onOpenChatBox: invoke,
													onGlobalMessageReceived: invoke,
													onGetGlobalMessage: invoke,
													/*[/OWN]**/
													/*[RCECEIVE]**/
													onGetMessageBoxKeyUp: invoke,
													onGetColoseChatBox: invoke,
													onGetOpenChatBox: invoke,
													/*[/RCECEIVE]**/
												} );
												return;
											}
										}
									}
								}
							} );
							return;
						}
					};
				} );
			}, {
				'Sow.Net.SignalR.public': 1,
				'Sow.Net.SignalR.core': 2,
				'Sow.Net.SignalR.connectivity': 3,
				public: false
			}],
			/** [CONNECTION INSTANCE] */
			3: [function ( require, module, exports ) {
				return module.aggregate( function () {
					var SING = {
						connection: {
							manager: {
								client: {},
								server: {}
							}
						},
						prepareSettings: this.aggregate( function () {
							var defaultSettings = {
								pingInterval: 300000,
								waitForPageLoad: true,
								jsonp: false,
								withCredentials: true,
								transport: ['webSockets', 'serverSentEvents', 'longPolling']
							};
							return function ( s ) {
								let clone = Object.clone( defaultSettings );
								Object.extend( clone, s );
								return clone;
							}
						} )
					};
					return {
						server: {
							instance: function ( hubname ) {
								if ( !SING.connection[hubname] || SING.connection[hubname] === null )
									throw new Error( String.format( "Invalid hubname==>{0}", hubname ) );

								return SING.connection[hubname].server;
							},
							stop: function ( hubname, cb ) {
								if ( typeof ( cb ) !== 'function' )
									throw new Error( String.format( "Callback required for disconnect hub==>{0}", hubname ) );

								if ( !SING.connection[hubname] || SING.connection[hubname] === null )
									throw new Error( String.format( "Invalid hubname==>{0}", hubname ) );

								if ( SING.connection[hubname].connection.state === 1 ) {
									let deferred = $.Deferred();
									setTimeout( function () {
										SING.connection[hubname].connection.stop();
										deferred.resolve();
									}, 0 );
									deferred.promise().done( function () {
										cb.call( this, 'stopped' );
									} );
								}
								return;
							},
							restart: function ( hubname, settings, cb, ercb ) {
								if ( !SING.connection[hubname] || SING.connection[hubname] === null )
									throw new Error( String.format( "Invalid hubname==>{0}", hubname ) );

								if ( SING.connection[hubname].connection.state === 1 ) {
									SING.connection[hubname].connection.stop();
								}
								SING.connection[hubname].connection.start( settings ).done( function () {
									SING.connection[hubname].server.connect( window.location.pathname );
									cb.call( this );
								} ).fail( function () {
									ercb.call( this, 'NOT_CONNECTED' );
								} );
								return this;
							}
						},
						connection: function ( fnc ) {
							if ( typeof ( fnc ) !== 'function' ) {
								throw new Error( "Invalid callback defined :(" );
							}
							fnc.call( SING.connection );
							return this;
						},
						heartbeat: this.aggregate( function () {
							var ___is_init = false;
							return function ( settings ) {
								$.connection = undefined;
								___is_init = true;
								if ( ___is_init ) return;
								( function ( heartbeat ) {
									heartbeat.received( function ( data ) {
										console.log( data );
										_interval();
									} );
									heartbeat.start( SING.prepareSettings( settings ) ).done( function () {
										_interval();
									} );
									___is_init = true;
									var _interval = function () {
										let deferred = $.Deferred();
										setTimeout( function () {
											deferred.resolve();
										}, 30000 );
										deferred.promise().done( function () {
											heartbeat.send( "Check" );
										} );
									};
									return;
								}( $.connection( '/api/heartbeat' ) ) );
								$.connection = undefined;
							}
						} ),
						initialize: function () {
							SING.connection = $.connection;
							return this;
						},
						registerEvent: function ( hubname, key, obj ) {
							Object.extend( SING.connection[hubname][key], obj );
						},
						start: function ( hubName, settings, cb, ercb ) {
							if ( !SING.connection[hubName] || SING[hubName] === null )
								throw new Error( String.format( "Invalid hubname==>{0}", hubname ) );
							SING.connection.hub.qs = { "token": '' + Math.floor( ( 0x2 + Math.random() ) * 0x10000000 ) + '', 'version': '1.0' };
							SING.connection.hub.start( SING.prepareSettings( settings ) ).done( function () {
								SING.connection[hubName].server.connect( window.location.pathname );
								cb.call( this );
							} ).fail( function () {
								ercb.call( this, 'NOT_CONNECTED' );
							} );
							this.heartbeat( settings );
							return this;
						}
					}
				} );
			}, {
				public: false
			}],
			/** [CALLBACK_STORE] */
			4: [function ( require, module, exports ) {
				return module.aggregate( function () {
					var store = {};
					return {
						set: function ( cb ) {
							if ( typeof ( cb ) !== 'function' ) {
								return null;
							}
							let key = String( Math.floor( ( 0x4 + Math.random() ) * 0x10000000000 ) );
							store[key] = cb;
							return key;
						},
						get: function ( key ) {
							if ( !key || key === null ) return undefined;
							let cb = store[key];
							if ( !cb ) return undefined;
							delete store[key];
							if ( typeof ( cb ) !== 'function' ) {
								return undefined;
							}
							return cb;
						}
					};
				} );
			}, {
				public: false
			}]
		}, {/**[cache]*/ }, /**[entry]*/[2, 1, 3, 4]];
	} ) ) ) );