/**
* Copyright (c) 2018, SOW (https://www.facebook.com/safeonlineworld). (https://github.com/RKTUXYN) All rights reserved.
* @author {SOW}
* @description {sow.api.hub.js}
* @example { }
* Copyrights licensed under the New BSD License.
* See the accompanying LICENSE file for terms.
*/
( function ( _pageWindow, $ ) {
	if ( typeof ( Sow.define ) !== 'function'
		|| typeof ( Sow.registerNamespace ) !== 'function' )
		throw new Error( 'sow.api.hub.js couldn\'t be initilize. One of its dependency `sow.frameworkjs` or  sow.notify ' + ' couldn\t load properly... Please recheck..' );

	if ( typeof ( $ ) === undefined )
		throw new Error( "jQuery was not found. Please ensure jQuery is referenced before the Sow.Api.Hub client JavaScript file." );
	Sow.define( "Sow.Api.Hub", function () { return { __event: {} }; } );
	Sow.registerNamespace(/**[Namespace Name]*/'Sow.Net.Hub', function () {
		return /**[modules]*/[{
			/** [Public instance module] */
			"hub core": [function ( require, module, exports ) {
				var __worker = {
					events: {
						get onStart() { return "onStart"; },
						get onStarting() { return "onStarting"; },
						get onReceived() { return "onReceived"; },
						get onError() { return "onError"; },
						get onConnectionSlow() { return "onConnectionSlow"; },
						get onReconnecting() { return "onReconnecting"; },
						get onReconnect() { return "onReconnect"; },
						get onStateChanged() { return "onStateChanged"; },
						get onDisconnect() { return "onDisconnect"; },
						get onRestart() { return "onRestart"; }
					},
					resources: {
						get unsupport() { return "WebSocket not supported this browser. Please update your browser!!!"; },
						get sendFailed() { return "Send failed."; },
						get parseFailed() { return "Failed at parsing response: {0}"; },
						get webSocketClosed() { return "WebSocket closed."; },
					},
					error: function ( message, source, context ) {
						let e = new Error( message );
						e.source = source;

						if ( typeof ( context ) !== "undefined" ) {
							e.context = context;
						}

						return e;
					},
					transportError: function ( message, transport, source, context ) {
						let e = this.error( message, source, context );
						e.transport = transport ? transport.name : undefined;
						return e;
					},
					clearTimeout: function ( owner ) {
						if ( owner && owner.timeout ) {
							window.clearTimeout( owner.timeout );
							delete owner.timeout;
						}
					},
					handleParseFailure: function ( owner, result, error, onFailed, context, hubname ) {
						let wrappedError = this.transportError(
							String.format( this.resources.parseFailed, result ),
							owner.transport,
							error,
							context );
						if ( onFailed && onFailed( wrappedError ) ) {
							owner.log( "Failed to parse server response while attempting to connect." );
						} else {
							$( owner ).triggerHandler( this.events.onError, [wrappedError] );
							Sow.hook( hubname ).fire( this.events.onError, ["Disconnect"] );
							owner.stop();
						}
					},
					parseResponse: function ( response ) {
						if ( !response ) {
							return [];
						} else if ( typeof ( response ) === "string" ) {
							response = JSON.parse( response );
						}
						return {
							hubname: response.H,
							method: response.M,
							argumnets: response.A,
							token: response.T
						};
					},
					transportLogic: {
						processMessages: function ( owner, data, hubname ) {
							Sow.hook( __worker.events.onReceived, hubname ).fire( [data] );
							return this;
						},
						triggerReceived: function ( owner, data, hubname ) {
							owner.client.porxyInvoke.call( owner, data );
							Sow.hook( hubname ).fire( __worker.events.onReceived, [data] );
						}
					},
					getMethod: function ( name ) {
						if ( !name ) return "";
						let over = String( String( name[0] ).toLowerCase() );
						over += name.substring( 1, name.length );
						return over;
					},
					/**
					* Create Server Proxy Event
					* @param {owner:connection, hubname:hubname}
					* @requires  Sow.Api.Hub
					* @return {Current Context}
					*/
					createServerProxy: function ( owner, hubname ) {
						if ( typeof ( Sow.Api.Hub[hubname] ) !== 'object' )
							throw new Error( String.format( "This hub==>{0} not initialized yet!!!", hubname ) );
						if ( typeof ( Sow.Api.Hub[hubname].getServerProxy ) !== 'function' )
							throw new Error( String.format( "This hub==>{0} not initialized yet!!!", hubname ) );

						owner.server = owner.server || {};
						var porxyInvoke = function () {
							this.transport.send( {
								method: arguments[0],
								argument: Array.prototype.slice.call( arguments, 1 )
							} );
							return;
						};
						let proxy = Sow.Api.Hub[hubname].getServerProxy();
						for ( let i = 0, l = proxy.length; i < l; i++ ) {
							( function ( a, b ) {
								owner.server[a] = function () {
									porxyInvoke.apply( owner, $.merge( [b], $.makeArray( arguments ) ) );
									return this;
								};
							}( this.getMethod( proxy[i] ), proxy[i] ) );
						}
						Sow.hook( hubname ).add( "__server_event", function ( a ) {
							porxyInvoke.apply( owner, $.merge( [arguments[0]], $.makeArray( Array.prototype.slice.call( arguments, 1 ) ) ) );
							return this;
						} );
						proxy = undefined;
						return this;
					},
					/**
					* Create Client Proxy Event
					* @param {owner:connection, hubname:hubname}
					* @requires  Sow.Api.Hub
					* @return {Current Context}
					*/
					createClientProxy: function ( owner, hubname ) {
						if ( typeof ( Sow.Api.Hub[hubname] ) !== 'object' )
							throw new Error( String.format( "This hub==>{0} not initialized yet!!!", hubname ) );

						owner.client = owner.client || {};
						let proxy = typeof ( Sow.Api.Hub[hubname].getClientProxy ) !== "function" ? [] : Sow.Api.Hub[hubname].getClientProxy();
						for ( let i = 0, l = proxy.length; i < l; i++ ) {
							owner.client[proxy[i]] = function () {
								owner.log( arguments );
							};
						}
						var clientProxy = Object.clone( owner.client );
						delete owner.client;
						owner.client = {};
						owner.client.porxyInvoke = function ( data ) {
							if ( typeof ( data ) !== "object" ) return;
							let method = clientProxy[data.method];
							Sow.async( function () {
								this.hook( hubname ).fire( data.method, data.argumnets );
							}, 0 );
							if ( typeof ( method ) !== "function" ) {
								owner.log( String.format( "Method not found in client end ==>{0}", data.method ) );
								return;
							}
							method.apply( this, Array.prototype.slice.call( data.argumnets ) );
						};
						return this;
					},
					/**
					* Sow.Api.Hub Configuration
					*/
					config: module.aggregate( function () {
						var defaultConfig = {
							hubname: "Manager",
							pingInterval: 300000,
							waitForPageLoad: true,
							get jsonp() { return false; },
							withCredentials: true,
							get transport() { return 'webSockets'; },
							token: Math.floor( Math.random() * 999999999 * 1024 ),
							wsProtocol: undefined,
							baseUrl: undefined,
							host: undefined,
							hubPath: "/app/hub/",
							heart: undefined,
							protocol: undefined,
							orgin: undefined,
							logging: false,
							reconnectInterval: 1000,
							crossDomain: false
						};
						return function ( s ) {
							let clone = Object.clone( defaultConfig );
							Object.extend( clone, s );
							clone.orgin = clone.orgin || window.document.location.origin;
							let uri = new URL( clone.orgin );
							if ( clone.host ) {
								try {
									new URL( clone.host );
								} catch ( e ) {
									if ( clone.hubPath ) {
										clone.hubPath = clone.host + clone.hubPath;
									}
									clone.host = uri.host;
								}
							}
							if ( !clone.hubPath )
								throw new Error( "hubPath==> Required!!!" );

							clone.hubPath = clone.hubPath.replace( "//", "/" );
							clone.host = clone.host || uri.host;
							clone.protocol = clone.protocol || uri.protocol;
							clone.wsProtocol = clone.wsProtocol || clone.protocol === "https:" ? "wss://" : "ws://";
							clone.baseUrl = clone.baseUrl || clone.protocol + "//" + clone.host;
							clone.heart = clone.heart || ( clone.protocol + "//" + clone.host + clone.hubPath + clone.hubname + "/heart/" );
							clone.socketUrl = clone.socketUrl || ( clone.wsProtocol + clone.host + clone.hubPath + clone.hubname + "/connect/" );
							return clone;
						}
					} ),
					/**
					* heart
					* @param {Object}
					* @requires {jQuery}
					* @return {function}
					*/
					heart: module.aggregate( function () {
						return function ( config ) {
							var $ajax = {};
							return {
								terminate: function () {
									if ( $ajax && 'function' === typeof ( $ajax.abort ) ) {
										$ajax.abort();
									}
									return this;
								},
								beat: function ( heart, cb ) {
									return window.setInterval( function () {
										heart.start( function () {
											return;
										} ).fail( function ( xhr, s, t ) {
											cb.call( heart );
										} );
									}, config.pingInterval || 10000 );
								},
								start: function ( cb, fail ) {
									this.terminate();
									$ajax = $.ajax( {
										type: "GET", url: config.heart,
										async: true, dataType: 'json',
										xhrFields: { withCredentials: config.withCredentials },
										beforeSend: function ( xhr ) {
											xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
											xhr.withCredentials = config.withCredentials;
										},
										crossDomain: config.crossDomain
									} ).done( function ( d ) {
										cb.call( {} ); $ajax = {};
									} );
									return $ajax;
								}
							};
						};
					} ),
					webSocket: module.aggregate( function () {
						return function ( config ) {
							var __get = {
								socket: function ( url ) {
									if ( !( "WebSocket" in _pageWindow ) )
										throw new Error( __worker.resources.unsupport )
									return new window.WebSocket( url );
								}
							};
							return {
								prepareData: function ( data ) {
									try {
										return JSON.stringify( {
											H: config.hubname,
											M: data.method,
											A: data.argument,
											T: config.token
										} );
									} catch ( ex ) {
										throw new Error( __worker.resources.parseFailed );
									}
								},
								getUrl: function () {
									if ( config.socketUrl ) {
										return config.socketUrl;
									}
									return config.wsProtocol + config.host + config.hubPath + config.hubname + "/connect/";
								},
								send: function ( data ) {
									let payload = this.prepareData( data );
									try {
										this.socket.send( payload );
									} catch ( ex ) {
										owner.log( __worker.sendFailed );
										Sow.hook( config.hubname ).fire( __worker.events.onError, [data, [this.transport, ex, this.socket]] );
									}
								},
								stop: function () {
									Sow.hook( config.hubname ).fire( __worker.events.onDisconnect, [] );
									this.socket.close();
									return this;
								},
								socketInit: function ( owner, onSuccess, onFailed, rec ) {
									onSuccess = typeof ( onSuccess ) !== "function" ? function () { } : onSuccess;
									onFailed = typeof ( onFailed ) !== "function" ? function () { } : onFailed;
									if ( !window.WebSocket ) {
										this.log( "This environment WebSocket Not Supported!!!" );
										onFailed.call( owner );
										return;
									}
									let url = this.getUrl();
									if ( owner.connection.state.reconnecting === 2 ) {
										url += "?r=true";
									} else {
										config.socketUrl = url;
									}
									this.socket = __get.socket( url );
									this.socket.onopen = function () {
										owner.transport.opened = true;
										if ( owner.connection.state.reconnecting === 2 ) {
											Sow.hook( config.hubname ).fire( __worker.events.onReconnect, ["Reconnected"] );
										} else if ( owner.connection.state.restart === 2 ) {
											Sow.hook( config.hubname ).fire( __worker.events.onRestart, ["Restarted"] );
										}
										( function () {
											this.connected = 1;
											this.restart = 0;
											this.reconnecting = 0;
											this.disconnected = 0;
											this.forceStop = 0;
										}.call( owner.connection.state ) );
										owner.log( "Websocket opened." );
										onSuccess.call( owner );
									};
									this.socket.onclose = function ( event ) {
										owner.connection.state.connected = 0;
										var error;
										// Only handle a socket close if the close is from the current socket.
										// Sometimes on disconnect the server will push down an onclose event
										// to an expired socket.

										if ( this === owner.transport.socket ) {
											if ( owner.transport.opened && typeof event.wasClean !== "undefined" && event.wasClean === false ) {
												// Ideally this would use the websocket.onerror handler (rather than checking wasClean in onclose)
												error = __worker.transportError(
													__worker.resources.webSocketClosed,
													config.transport,
													event );

												owner.log( "Unclean disconnect from websocket: " + ( event.reason || "[no reason given]." ) );
											} else {
												owner.log( "Websocket closed." );
											}
											if ( error ) {
												Sow.hook( config.hubname ).fire( __worker.events.onError, [error] );
											}
											owner.connection.state.connected = 0;
											owner.transport.opened = false;
											if ( owner.connection.state.forceStop === 0 ) {
												if ( owner.connection.state.restart === 0 ) {
													owner.connection.state.reconnecting = 2;
													owner.reconnect();
													Sow.hook( config.hubname ).fire( __worker.events.onDisconnect, ["Disconnect"] );
												}
											}

											__get = owner = onSuccess = onFailed = rec = undefined;
										}
									};

									this.socket.onmessage = function ( event ) {
										let data;

										try {
											data = __worker.parseResponse( event.data );
										}
										catch ( error ) {
											__worker.handleParseFailure( owner, event.data, error, onFailed, event, config.hubname );
											return;
										}
										if ( typeof ( data ) !== 'object' ) {
											__worker.transportLogic.triggerReceived( owner, {}, config.hubname );
											return;
										}
										if ( $.isEmptyObject( data ) || data.method ) {
											__worker.transportLogic.triggerReceived( owner, data, config.hubname );
											config.token = data.token;
											return this;
										}
										__worker.transportLogic.processMessages( owner, {}, config.hubname );
									};
									return this;
								}
							};
						};
					} ),
					hub: module.aggregate( function () {
						return function ( config ) {
							config = __worker.config( config );
							var _hWorker = {
								_: {
									heartIntervalId: 0,
									reconnectIntervalId: 0
								},
								transport: {},
								heart: {},
								lastError: {},
								connection: {
									state: {
										connecting: 0,
										connected: 0,
										reconnecting: 0,
										disconnected: 0,
										restart: 0,
										forceStop: 0
									},
								},
								client: {},
								server: {},
								log: function () {
									if ( !config.logging ) return;
									_pageWindow.console.log( String.format.apply( this, Array.prototype.slice.call( arguments, 0 ) ) );
								},
								onReceived: function ( callback ) {
									Sow.hook( config.hubname ).add( __worker.events.onReceived, function ( e, data ) {
										callback.call( _hWorker, data );
									} );
									return this;
								},
								onError: function ( callback ) {
									Sow.hook( config.hubname ).add( __worker.events.onError, function ( errorData, sendData ) {
										_hWorker.lastError = errorData;
										callback.call( _hWorker, errorData, sendData );
									} );
									return this;
								},
								onDisconnected: function ( callback ) {
									Sow.hook( config.hubname ).add( __worker.events.onDisconnect, function ( data ) {
										callback.call( _hWorker, data );
									} );
									return this;
								},
								onConnectionSlow: function ( callback ) {
									Sow.hook( config.hubname ).add( __worker.events.onConnectionSlow, function ( data ) {
										callback.call( _hWorker, data );
									} );

									return this;
								},
								onReconnecting: function ( callback ) {
									Sow.hook( config.hubname ).add( __worker.events.onReconnecting, function ( data ) {
										callback.call( _hWorker, data );
									} );
									return this;
								},
								onReconnected: function ( callback ) {
									Sow.hook( config.hubname ).add( __worker.events.onReconnect, function ( data ) {
										callback.call( _hWorker, data );
									} );
									return this;
								},
								stop: function () {
									this.connection.state.forceStop = 2;
									this.heart.terminate();
									this.transport.stop();
									return this;
								},
								reconnect: function () {
									if ( this.connection.state.reconnecting === 0 ) return;
									if ( this.transport.opened === false ) {
										Sow.hook( config.hubname ).fire( __worker.events.onReconnecting, ["Reconnecting"] );
										_pageWindow.clearInterval( _hWorker._.heartIntervalId );
										this._.reconnectIntervalId = _pageWindow.setInterval( function () {
											_hWorker.heart.start( function () {
												if ( _hWorker._.reconnectIntervalId === 0 ) return;
												_pageWindow.clearInterval( _hWorker._.reconnectIntervalId );
												_hWorker._.reconnectIntervalId = 0;
												_hWorker.restart();
											} ).fail( function ( xhr, s, t ) {
												_hWorker.log( s );
											} );
										}, config.reconnectInterval || 1000 );
										return;
									}
									return this;
								},
								initHeart: function () {
									this._.heartIntervalId = this.heart.beat( _hWorker.heart, function () {
										Sow.hook( config.hubname ).fire( __worker.events.onConnectionSlow, ["ConnectionSlow"] );
									} );
								},
								restart: function () {
									let deferred = $.Deferred();
									if ( this.connection.state.reconnecting !== 2 ) {
										this.connection.state.restart = 1;
									}
									if ( this.connection.state.connected !== 0 ) {
										this.transport.stop();
									}
									_pageWindow.clearInterval( this._.heartIntervalId );
									delete this.transport;
									this.transport = {};
									Object.extend( this.transport, __worker.webSocket( config ) );
									this.transport.socketInit( this, function () {
										this.initHeart();
										deferred.resolve( function () { } );
									}, function () {
										deferred.reject();
									} );
									return deferred.promise();
								},
								get config() {
									return config;
								},
								start: function () {
									let deferred = $.Deferred();
									if ( config.transport !== 'webSockets' ) {
										deferred.reject();
										this.log( "Not implemented this transport=>{0}", config.transport );
										return deferred.promise();
									}
									Object.extend( this.transport, __worker.webSocket( config ) );
									Object.extend( this.heart, __worker.heart( config ) );
									this.heart.start( function () {
										__worker.createClientProxy( _hWorker, config.hubname ).createServerProxy( _hWorker, config.hubname );
										_hWorker.transport.socketInit( _hWorker, function () {
											this.initHeart();
											deferred.resolve( _hWorker );
										}, function () {
											deferred.reject();
										} );
									}, false );
									return deferred.promise();
								}
							};
							$( window ).bind( "unload", function ( e ) {
								//config.withCredentials = false;
								//window.clearInterval( _hWorker._.heartIntervalId );
								//window.clearInterval( _hWorker._.reconnectIntervalId );
								_hWorker.log( "Window unloading, stopping the connection." );
								_hWorker = config = undefined;
								//_hWorker.stop();
							} );
							$( window ).bind( 'beforeunload', function ( e ) {
								config.withCredentials = false;
								_hWorker.log( "Window unloading, stopping the connection." );
								_hWorker.stop();
							} );
							/**window.onbeforeunload = function ( e ) {
								return confirm( 'Are you sure?' );
							};*/
							return _hWorker;
						};
					} )
				};
				return {
					init: function ( config ) {
						return __worker.hub( config );
					}
				};
			}, {
				public: true,
				owner: 'Sow.Net.Hub.core'
			}]
		}, {/**[cache]*/ }, /**[entry]*/["hub core"]];

	} );
}( window || this, jQuery ) );