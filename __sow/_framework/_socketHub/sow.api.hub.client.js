( function ( _pageWindow ) {
	if ( typeof Sow.define !== 'function'
		|| typeof Sow.registerNamespace !== 'function'
		|| typeof Sow.Notify !== 'object' ) {
		throw new Error( 'sow.api.hub.js couldn\'t be initilize. One of its dependency `sow.frameworkjs` or  sow.notify ' + ' couldn\t load properly... Please recheck..' );
	}

	Sow.mapNamespace( 'Sow.Net.Hub', 'Sow.Net.Hub.Client' ).registerNamespace(/**[Namespace Name]*/'Sow.Net.Hub.Client', function () {
		return /**[modules]*/[{
			/** [Public instance module] */
			1: [function ( require, module, exports ) {

				return module.aggregate( function () {
					var isInitialize = {

					}, showNotification = function ( m ) {
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
							require( 'Sow.Net.Hub.connectivity' ).connection( function () {
								fnc.call( this, function ( cb ) {
									return require( 'Sow.Net.Hub.callbackStore' ).set( cb );
								} );
							} );
							return this;
						},
						restart: function ( hubname, settings, a, b ) {
							require( 'Sow.Net.Hub.connectivity' ).server.restart( hubname, settings, a, b );
						},
						stop: function ( hubname, cb ) {
							require( 'Sow.Net.Hub.connectivity' ).server.stop( hubname, cb );
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
								caption: 'HubApi Error!!!',
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
							initialize: function ( hubname, settings, token ) {
								if ( isInitialize[hubname] )
									throw new Error( 'HubApi Server is already initialized!!! :(' );

								return {
									start: function ( callback, beforeConnect, onConnect ) {
										typeof ( callback ) !== 'function' ? callback = function ( a, b, c ) { } : undefined;
										typeof ( beforeConnect ) !== 'function' ? beforeConnect = function ( a, b, c ) { } : undefined;
										typeof ( onConnect ) !== 'function' ? onConnect = function ( a, b, c ) { } : undefined;
										if ( token === undefined || token === '' ) {
											var msg = 'Invalid token defined. HubApi couldn\'t initialized. :(';
											var inst = require( 'Sow.Net.Hub.public' );
											inst.onError( msg );
											callback.call( require( 'Sow.Net.Hub.public' ), msg );
											console.log( msg );
											return;
										}
										isInitialize[hubname] = true;
										beforeConnect.call( require( 'Sow.Net.Hub.connectivity' ).initialize( settings ) );
										var cb = function ( a, b, c ) {
											if ( typeof ( this[b] ) !== 'function' ) {
												console.log( c );
												return;
											}
											this[b]( c );
											return;
										};
										require( 'Sow.Net.Hub.core' ).run( hubname, token, function () {
											this.server.event.register( function () {
												cb.apply( this, Array.prototype.slice.call( arguments ) );
												return;
											} );
											this.client.universel.event.register( function () {
												let key = arguments[0];
												if ( key === 'onConnected' ) {
													onConnect.apply( this, Array.prototype.slice.call( arguments, 1 ) );
													return this;
												}
												if ( key === '___NOPE__' ) {
													callback.apply( this, Array.prototype.slice.call( arguments, 1 ) );
													return;
												}
												if ( !key || key === null ) {
													callback.apply( this, Array.prototype.slice.call( arguments, 1 ) );
													return;
												}
												let cStore = require( 'Sow.Net.Hub.callbackStore' ).get( key );
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
												//require('Sow.Net.Hub.connectivity').connection.manager.server.isAdmin(token);
												//require('Sow.Net.Hub.connectivity').connection.manager.server.onGlobalMessage('rajibs', 'hello');
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
				'Sow.Net.Hub.public': 1,
				'Sow.Net.Hub.core': 2,
				'Sow.Net.Hub.connectivity': 3,
				'Sow.Net.Hub.callbackStore': 4,
				public: true,
				owner: 'Sow.Net.Hub.public'
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
						run: function ( hubname, token, fn ) {
							const TOKEN = token;
							const HUBNAME = hubname;//'manager';
							if ( typeof ( fn ) !== 'function' )
								throw new Error( "Function required!!!" );

							fn.call( {
								server: {
									start: function ( cb ) {
										typeof ( cb ) !== 'function' ? cb = function ( t ) { } : undefined;
										require( 'Sow.Net.Hub.connectivity' ).start( HUBNAME, function () {
											cb.call( require( 'Sow.Net.Hub.core' ) );
										}, function () {
											cb.call( require( 'Sow.Net.Hub.core' ), 'NOT_CONNECTED' );
										} );
										return this;
									},
									event: {
										register: function ( cb ) {
											typeof ( cb ) !== 'function' ? cb = function ( t ) { } : undefined;
											var _restart = function () {
												require( 'Sow.Net.Hub.connectivity' ).server.restart( HUBNAME, function () {
													cb.call( require( 'Sow.Net.Hub.public' ), "SERVER", "onReStarted", 'Restarted... :(' );
													return;
												}, function () {
													setTimeout( function () { _restart(); }, 1000 );
												} );
											};
											//var hub = require('Sow.Net.Hub.connectivity').connection.hub;
											require( 'Sow.Net.Hub.connectivity' ).connection( function () {
												this.onError( function ( error ) {
													console.log( 'HubApi error: ' + error );
													cb.call( require( 'Sow.Net.Hub.public' ), "SERVER", "onError", 'HubApi error: ' + error );
												} ).onConnectionSlow( function () {
													console.log( 'Connection is slow....:\'(' );
													cb.call( require( 'Sow.Net.Hub.public' ), "SERVER", "onConnectionSolow", 'Connection is slow....:\'(' );
												} ).onReconnecting( function () {
													console.log( 'Reconnecting....:)' );
													cb.call( require( 'Sow.Net.Hub.public' ), "SERVER", "onReconnecting", 'Reconnecting..' );
												} ).onReconnected( function () {
													console.log( 'Reconnected...:)' );
													cb.call( require( 'Sow.Net.Hub.public' ), "SERVER", "onReconnected", 'Reconnected...' );
												} ).onDisconnected( function () {
													console.log( 'Disconnected....:\'(' );
													cb.call( require( 'Sow.Net.Hub.public' ), "onDisconnected", "SERVER", 'Disconnected....:\'(' );
												} ).onError( function () {
													/// <summary>Adds a callback that will be invoked after an error occurs with the connection</summary>
													/// <param name="callback" type="Function">A callback function to execute when an error occurs on the connection</param>
													/// <returns type="HubApi" />
													console.log( arguments );
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
													cb.apply( this, Array.prototype.slice.call( arguments ) );
												};
												require( 'Sow.Net.Hub.connectivity' ).registerEvent( HUBNAME, 'client', {
													onIsAdmin: invoke,
													onMessageBoxKeyUp: invoke,
													onGetConnectedUserObject: invoke,
													onGetTotalConnectedUser: invoke,
													onTryReConnect: invoke,
													onExecuteIo: invoke,
													onTaskBegain: invoke,
													onClientTaskActivity: invoke,
													onTaskEnd: invoke,
													onThroughExecption: invoke,
													onGlobalMessageReceived: invoke,
													onConnected: function () {
														let arr = ["onConnected"];
														arr = arr.concat( Array.prototype.slice.call( arguments ) );
														cb.apply( this, Array.prototype.slice.call( arr ) );
														return;
													},
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
													cb.apply( require( 'Sow.Net.Hub.connectivity' ).server.instance( HUBNAME ), Array.prototype.slice.call( arguments ) );
												};
												require( 'Sow.Net.Hub.connectivity' ).registerEvent( HUBNAME, 'client', {
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
				'Sow.Net.Hub.public': 1,
				'Sow.Net.Hub.core': 2,
				'Sow.Net.Hub.connectivity': 3,
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
								loging: true,
								transport: 'webSockets'
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
								if ( !SING.connection || SING.connection[hubname] === null )
									throw new Error( String.format( "Invalid hubname==>{0}", hubname ) );

								return SING.connection.server;
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
								if ( !SING.connection || SING.connection[hubname] === null )
									throw new Error( String.format( "Invalid hubname==>{0}", hubname ) );

								if ( SING.connection.state === 1 ) {
									SING.connection.stop();
								}
								SING.connection.start( settings ).done( function () {
									SING.connection.server.connect( _pageWindow.location.pathname );
									//TODO
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
						initialize: function ( settings ) {
							SING.connection = ( require( "Sow.Net.Hub" ) ).init( SING.prepareSettings( settings ) );
							return SING.connection;
						},
						registerEvent: function ( hubname, key, obj ) {
							//Object.extend( SING.connection[hubname][key], obj );
							SING.connection[key] = SING.connection[key] || {};
							Object.extend( SING.connection[key], obj );
						},
						start: function ( hubName, cb, ercb ) {
							if ( !SING.connection || SING[hubName] === null )
								throw new Error( String.format( "Invalid hubname==>{0}", hubname ) );
							SING.connection.qs = { "token": '' + Math.floor( ( 0x2 + Math.random() ) * 0x10000000 ) + '', 'version': '1.0' };
							SING.connection.start(  ).done( function () {
								cb.call( this );
							} ).fail( function () {
								ercb.call( this, 'NOT_CONNECTED' );
							} );
							//this.heartbeat( settings );
							return this;
						}
					}
				} );
			}, {
				public: false,
				'Sow.Net.Hub': "hub core",
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
	} );


}( window || this ) );