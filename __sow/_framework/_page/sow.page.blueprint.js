/**
* Copyright (c) 2018, SOW (https://www.facebook.com/safeonlineworld). (https://github.com/RKTUXYN) All rights reserved.
* @author {SOW}
* @description {sow.page.blueprint.js}
* @example { }
* Copyrights licensed under the New BSD License.
* See the accompanying LICENSE file for terms.
*/
Sow.hook( "Manager" ).add( "onSginOut", function ( a ) {
	location.href = "/sginout.aspx?task=auto";
} );
Sow.define( "Sow.store", function () {
	return ( new this.Data() ).export();
} );
Sow.registerNamespace(/**[settings]*/'Sow.Net.Web', function () {
	var HUBNAME = 'Manager';
	/**Object.extend( window, {
		get HUBNAME() {
			return 'manager';
		}
	} );*/
	return /**[modules]*/[{
		1: [function ( require, module, exports ) {
			//Sow.unloadNamespace('Sow.Net.Hub');
			return module.aggregate( function () {
				return {
					ready: function () {
						require( 'Sow.Net.Route' ).ready( "Get Ready!!!" );
						return this;
					},
					initialize: function ( requireSignalR, disableTemplate ) {
						if ( requireSignalR ) {
							require( 'Sow.Net.Hub' ).init( disableTemplate);
						} else {
							Sow.unloadNamespace( 'Sow.Net.Hub' );
						}
						/**if ( document.readyState === 'complete' || document.readyState === 'interactive' ) {
							require( 'Sow.Net.Route' ).ready( "Get Ready!!!" );
							return;
						}
						$( document ).on( 'ready', function () {
							try {
								require( 'Sow.Net.Route' ).ready( "Get Ready!!!" );
							} catch ( e ) {
								throw new Error( "No such page namespace registerd yet. Please at first register your page." );
							}
						} );*/
						return this;
					}
				};
			} );
		}, {
			'Sow.Net.Hub': 2,
			'Sow.Net.Route': 6,
			owner: 'Page.Manager',
			public: true
		}],
		// MODEL
		2: [function ( require, module, exports ) {
			var _SOCKET_HUB = {};
			var _SETTINGS = {
				pingInterval: 300000,
				waitForPageLoad: true,
				jsonp: false,
				withCredentials: true,
				transport: 'webSockets',
				host: _API_,
				hubPath: "/hub/",
				crossDomain: true,
				logging: true
			};
			return {
				init: function ( disableTemplate ) {
					Sow.usingNamespace( 'Sow.Net.Hub' );
					if ( !disableTemplate ) {
						Sow.usingNamespace( 'Sow.Net.Messaging' );
						Sow.usingNamespace( 'Sow.Net.Web.Template.Master' );
						require( 'Web.Template.Master' ).ready();
					}
					var msg = {};
					_SOCKET_HUB = /**require( '../Web/SignalR' )*/Sow.exportNamespace( 'Sow.Net.Hub' );
					_SOCKET_HUB.server.initialize( HUBNAME, _SETTINGS, Math.floor( ( 0x2 + Math.random() ) * 0x1000 ), true ).start( function () {
						console.log( arguments );
						let view = require( 'Sow.Net.Web.View' );
						if ( typeof ( view[arguments[0]] ) === 'function' ) {
							view[arguments[0]].apply( view, Array.prototype.slice.call( arguments, 1 ) );
							return;
						}
						return this;
					}, function ( a, b, c ) {
						if ( disableTemplate ) return this;
						let chatConf = require( 'Web.Template.Master' ).getChatConfig();
						if ( chatConf && chatConf.chat_on ) {
							msg = Sow.exportNamespace( 'Sow.Net.Messaging' ).init.call( this, HUBNAME, chatConf.chatbox_config );
						}
						return this;
					}, function () {
						disableTemplate ? undefined : msg.connect.apply( this, Array.prototype.slice.call( arguments ) );
						require( 'Sow.Net.Route' ).onLoad( "Get Ready!!!" );
						return this;
					} );
				},
				execute: function ( check, cb ) {
					if ( check === false ) {
						_SOCKET_HUB.execute( HUBNAME, cb );
						return;
					}
					var that = this;
					_SOCKET_HUB.execute( HUBNAME, function ( c ) {
						if ( this.connection.state.connected !== 1 ) {
							console.log( "NOT_CONNECTED" );
							cb.call( this, "NOT_CONNECTED" );
							that.server.restart(); that = undefined;
							return;
						}
						that = undefined;
						cb.call( this, c );
					} );
					return this;
				},
				server: {
					restart: function () {
						_SOCKET_HUB.restart( HUBNAME, _SETTINGS, function () { }, function () { } );
						return this;
					},
					stop: function ( cb ) {
						_SOCKET_HUB.stop( HUBNAME, cb );
						return this;
					}
				}
			};
		}, {
			'Sow.Net.Web.View': 5,
			'Web.Template.Master': "Template.Master",
			'Sow.Net.Route': 6
		}],
		// CONTROLLER
		3: [function ( require, module, exports ) {
			return {
				sginOut: function ( cb ) {
					require( 'Sow.Net.Hub' ).execute( false, function ( c ) {
						if ( this.connection.state !== 1 ) {
							console.log( "NOT_CONNECTED" );
							require( 'Sow.Net.Web.View' ).redirect();
							return;
						}

						this.server.sginOut( typeof ( cb ) === 'function' ? c.call( this, cb ) : null );
					} );
					return this;
				}
			};
		}, {
			'Sow.Net.Hub': 2,
			'Sow.Net.Web.View': 5
		}],
		// DATA
		4: [function ( require, module, exports ) {
			return {
				a: function ( i ) {
					console.log( i );
				},
				b: function ( i ) {
					console.log( i );
				}
			};
		}, {}],
		// VIEW
		5: [function ( require, module, exports ) {
			return {
				redirect: function ( a, b ) {
					setTimeout( function () {
						location.href = "/urlroute.aspx?dc=" + a + "&next=" + encodeURI( location.pathname + "#/" + Sow.currentPage() );
					}, 100 );
					return;
				},
				check_db: function ( a, b ) {

				},
				onExecuteIo: function ( a, b, c ) {
					//console.log( a, b, c );
					this[c]( a, b );
				},
				onSignalRReady: function () {

				},
				onConnected: function ( a, b, s ) {
					var that = this;
					require( 'Sow.Net.Hub' ).execute( true, function ( c ) {
						if ( c === "NOT_CONNECTED" ) return;
						require( 'Sow.Net.Route' ).onLoad.call( this, c, a, b, s );
						that.onSignalRReady.call( this, c, a, b, s );//Call To Page
						that = undefined;
						this.server.taskEnd( c.call( this, function () {
							console.log( arguments );
						} ), 'Welcome!!!' );
						this.server.getConnectedClient( c.call( this, function () {
							console.log( arguments );
						} ) );
						
						//@argument Role Required
						/*this.server.executeIo( c.call( this, function () {
							console.log( arguments );
						} ), "client._check", JSON.stringify( { a: 1, b: 2 } ) );*/
						/**this.server.getConnectedUserObject( c.call( this, function () {
							console.log( arguments );
						} ) );
						this.server.getTotalConnectedUser( c.call( this, function () {
							console.log( arguments );
						} ) );*/
					} );
					sig = undefined;
					return;
				},
				onTryReConnect: function () {
					if ( typeof ( this[arguments[0]] ) === 'function' ) {
						this[arguments[0]].apply( this, Array.prototype.slice.call( arguments, 1 ) );
					}
					console.log( arguments );
				},
				onSginOut: function ( a, b, c ) {
					var that = this;
					require( 'Sow.Net.Hub' ).server.stop( function () {
						require( 'Sow.Net.Web.XHR' )
							.sginOut()
							.success( function () {
								that.redirect( Math.floor( ( 0x2 + Math.random() ) * 0x1000 ) );
								that = undefined; return;
							} )
							.error( function () {
								that.redirect( Math.floor( ( 0x2 + Math.random() ) * 0x1000 ) );
								that = undefined; return;
							} );
					} );
					return;
				}
			};
		}, { 'Sow.Net.Hub': 2, 'Sow.Net.Web.Controller': 3, 'Sow.Net.Route': 6, 'Sow.Net.Web.XHR': 7, 'Sow.Net.Web.View.page': 101 }],
		6: [function ( require, module, exports ) {
			var pages = {
				"/pages/dashboard": {
					script: ["/pages/js/dashboard/base.js"],
					css: ["/pages/css/dashboard/base.css"]
				}
			};
			return {
				ready: function ( s ) {
					require( 'Sow.Net.Web.View.page' ).ready( "FULL_LOADED" );
					return this;
				},
				onLoad: function ( c, a, b, s ) {
					try {
						let fn = require( 'Sow.Net.Web.View.page' ).allReady;
						if ( typeof ( fn ) === 'function' ) {
							fn.call( this, c, a, b, s );
						}
					} catch ( e ) {
						console.log( e.message );
					}
					require( 'Sow.Net.Web.View.page' ).onLoad( "Loaded" );
					return this;
				},
				routeRegister: function () {

				}
			};
		}, {
			'Sow.Net.Web.Controller': 3, 'Sow.Net.Web.View.page': 101,
			'Web.Template.Master': "Template.Master"
		}],
		/** [XML HTTP REQUEST] */
		7: [function ( require, module, exports ) {
			return module.aggregate( function () {
				return {
					sginOut: function () {
						var request = this.xhr( {
							type: "POST",
							url: "/__sow/__handler/routemanager.ashx?q=SGINOUT"
						} );
						return {
							success: function ( cb ) {
								request.done( function ( data ) {
									request = undefined;
									cb.call( this, data );
								} );
								return this;
							},
							error: function ( cb ) {
								request.fail( function ( jqXHR, textStatus ) {
									request = undefined;
									cb.call( this, jqXHR, textStatus );
								} )
								return this;
							}
						};
					},
					xhr: this.aggregate( function () {
						var xmlWorker = {
							prepareSettings: this.aggregate( function () {
								var defaultSettings = {
									type: "GET",
									url: "/_chief/server/controller/postgreSQL.ashx",
									data: {}, dataType: 'text',
									async: true, cache: false,
									contentType: "application/x-www-form-urlencoded; charset=UTF-8",
									beforeSend: function ( xhr ) { return; },
									xhrFields: { withCredentials: true }
								};
								return function ( s ) {
									let clone = Object.clone( defaultSettings );
									Object.extend( clone, s );
									return clone;
								}
							} )
						};
						return function ( options ) {
							return $.ajax(
								xmlWorker.prepareSettings( options )
							);
						}
					} )
				};
			} );
		}, {
			public: false
		}],
		/** [/XML HTTP REQUEST] */
		/** [FORM VALIDATION] */
		8: [function ( require, module, exports ) {
			var v_worker = {
				validate: module.aggregate( function () {
					var q_work = {
						trim: function ( s ) {
							if ( !s ) return "";
							if ( s.length === 0 )
								return s;
							return s.replace( /^\s+|\s+$/, '' );
						},
						required: function ( val, key, keyMsg ) {
							if ( val === null || val === undefined || !val )
								return { msg: ( keyMsg ? String.format( "{0} required...", keyMsg ) : "required..." ), error: true };
							return { msg: "", error: false };
						},
						max: function ( val, key ) {
							if ( this.required( key ).error ) return { msg: "", error: false };
							if ( this.required( val ).error ) val = "";
							if ( isNaN( key ) ) return { msg: "", error: false };
							key = parseInt( key );
							if ( val.length > key ) return { msg: String.format( "Maximum {0} characters allowed !!!", key ), error: true };
							return { msg: "", error: false };
						},
						min: function ( val, key ) {
							if ( this.required( key ).error ) return { msg: "", error: false };
							if ( this.required( val ).error ) val = "";
							if ( isNaN( key ) ) return { msg: "", error: false };
							key = parseInt( key );
							if ( val.length < key ) return { msg: String.format( "Minimum {0} characters required !!!", key ), error: true };
							return { msg: "", error: false };
						},
						type: this.aggregate( function () {
							var t_work = {
								email: function ( value, key ) {
									if ( /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/.test( value ) ) {
										return true;
									}
									return false;
								},
								mobile: function ( value, key ) {
									if ( /^\d{11}$/.test( value ) || /^[+]?[88]\d{12}$/.test( value ) || /^[0]?[88]\d{12}$/.test( value ) ) {
										return true;
									}
									return false;
								},
								numeric: function ( val, key ) {
									return /^[0-9 .]+$/.test( val );
								},
								isAlpha: function ( val ) {
									return /^[a-zA-Z]+$/.test( val );
								},
								alphaNumeric: function ( val ) {
									return /^[0-9a-zA-Z]+$/.test( val );
								},
								mixed/*[specialCharacter]*/: function ( val ) {
									return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test( val ) !== true;
								},
							}, message = {
								email: "Email should be the real one!!!",
								mobile: "Mobile number should be the real one!!!",
								numeric: "Numeric required !!!",
								isAlpha: "Alphabet required !!!",
								alphaNumeric: "Alphabet or Numeric required!!!",
								mixed: "Special Character e.g. !@#$%^&*() not allowed!!!"
							};
							return function ( val, key ) {
								if ( this.required( key ).error )
									return { msg: "", error: false };
								if ( typeof ( t_work[key] ) !== 'function' )
									return { msg: "", error: false };
								if ( this.required( val ).error ) val = "";
								if ( t_work[key]( val ) )
									return { msg: "", error: false };
								return { msg: message[key], error: true };
							}
						} ),
						pattern: function ( val, key ) {
							if ( this.required( key ).error ) return { msg: "", error: false };
							if ( this.required( val ).error ) val = "";
							let res = val.match( key );
							if ( res )
								return { msg: "", error: false };
							return { msg: "Invalid!!!", error: true };
						},
					};
					return function ( $el, logic, isGroup, setMsg, fn ) {
						//logic = '@[msg=email;required;pattern=;max=10;min=2;type=email;]';
						$el = v_worker.getInstance( $el );
						if ( q_work.required( logic ).error || typeof ( logic ) !== 'string' ) {
							logic = $el.attr( 'data-logic' );
						}
						if ( !logic ) {
							//Success
							return true;
						}
						setMsg = typeof ( setMsg ) !== 'boolean';
						logic = String( logic );
						logic = logic.substring( 2, logic.length );
						logic = logic.substring( 0, logic.length - 2 );
						let larr = logic.split( ";" );
						let hasError = false; let wmsg = "", keyMsg = "";
						let val = $el.val();
						let isCheckBox = $el.is( ":checkbox" );
						if ( isCheckBox ) {
							if ( larr.indexOf( 'required' ) > -1 ) {
								if ( $el.is( ":checked" ) === false ) {
									hasError = true;
								}
							}
							wmsg = null;
						} else {
							for ( let x = 0, l = larr.length; x < l; x++ ) {
								let clogic = larr[x];
								if ( !clogic ) continue;
								let carr = clogic.split( '=' );
								if ( carr[0] === 'msg' ) {
									if ( x > 0 ) throw new Error( "Invalid Positon of Message!!!" + carr[1] );
									keyMsg = carr[1]; continue;
								}
								if ( typeof ( q_work[carr[0]] ) !== 'function' ) {
									throw new TypeError( "Invalid logic defined!!!" + carr[0] );
								}
								resp = q_work[carr[0]]( val, carr[1], keyMsg );
								if ( resp.error ) {
									hasError = true;
									wmsg = resp.msg;
									break;
								}
							}
						}
						if ( typeof ( fn ) === 'function' ) {
							fn.call( $el, hasError, wmsg );
							return hasError;
						}
						if ( hasError ) {
							if ( setMsg )
								$( $el.parent() ).removeClass( "state-success" ).addClass( "state-error" );
							if ( wmsg ) {
								if ( isGroup ) {
									if ( setMsg )
										$( '[data-msg_name="' + $el.attr( 'name' ) + '"]' ).removeClass( 'success' ).addClass( 'error' ).html( wmsg );
								} else {
									if ( setMsg )
										$el.after( '<small data-type="___msg" class="form-text error"> ' + wmsg + '</small >' );
								}
							}
						} else {
							if ( setMsg ) {
								$( $el.parent() ).removeClass( "state-error" ).addClass( "state-success" );
								!isGroup ? undefined : $( '[data-msg_name="' + $el.attr( 'name' ) + '"]' ).removeClass( 'error' ).addClass( 'success' ).html( "Valid..." );
							}
						}
						$el = larr = val = undefined;
						return hasError;
					}
				} ),
				reset: function ( $frm, cb, isGroup ) {
					$frm = this.getInstance( $frm );
					Sow.async( function () {
						let $el = $( '[data-type="___msg"]' );
						$el.each( function () {
							let $inst = $( this );
							if ( $inst.attr( 'data-keep-alive' ) === 'true' ) return;
							if ( isGroup ) {
								$inst.removeClass( 'error' ).removeClass( 'success' ).html( '' );
								return;
							}
							$inst.remove();
							return;
						} );
						$frm.each( function () {
							let $inst = $( this );
							if ( $inst.attr( 'data-val-own' ) === 'true' ) return;
							$( $( this ).parent() ).removeClass( "state-error" )
								.addClass( "state-success" );

							return;
						} );
						cb.call( v_worker );
					}, 0 );
					return;
				},
				getInstance: function ( $elm ) {
					if ( null === $elm || $elm === undefined )
						throw new TypeError( "Invalid element defined!!!" );

					if ( ( $elm instanceof $ ) )
						return $elm;

					if ( typeof ( $elm ) === 'string' )
						return $( $elm );

					if ( typeof ( $elm ) === 'object' ) {
						if ( $elm.toString() === "[object HTMLInputElement]" )
							return $( $elm );
					}
					throw new TypeError( "Invalid element defined!!!" );
				},
				isEmail: function ( value ) {
					if ( /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/.test( value ) ) {
						return true;
					}
					return false;
				},
			};
			return {
				isEmail: function ( value ) {
					return v_worker.isEmail( value );
				},
				reset: function ( $frm, cb, isGroup ) {
					typeof ( isGroup ) !== 'boolean' ? isGroup = false : undefined;
					var that = this;
					v_worker.reset( $frm, function () {
						cb.call( that ); that = undefined;
					}, isGroup );
					return this;
				},
				getInstance: function ( $elm ) {
					return v_worker.getInstance( $elm );
				},
				keyUp: function ( $elm, cb, keObj, isGroup, nObj ) {
					typeof ( isGroup ) !== 'boolean' ? isGroup = false : undefined;
					var hasCb = typeof ( cb ) === 'function';
					var isObject = keObj === null || keObj === undefined ? false : typeof ( keObj ) === 'object';
					Sow.async( function () {
						$elm = v_worker.getInstance( $elm );
						let kCallback = function ( e ) {
							e.preventDefault();
							var $el = $( this );
							Sow.async( function () {
								if ( hasCb ) {
									if ( isObject ) {
										let name = $el.attr( 'name' );
										if ( keObj[name] ) {
											cb.call( v_worker, $el, name );
											return;
										}
									} else {
										cb.call( v_worker, $el );
										return;
									}
								}
								if ( isGroup ) {
									$( '[data-msg_name="' + $el.attr( 'name' ) + '"]' ).removeClass( 'success' ).removeClass( 'error' ).html( "" );
								} else {
									$el.next().remove();
								}
								v_worker.validate( $el, undefined, isGroup );
								$el = undefined;
								return;
							}, 0 );
						};
						if ( typeof ( nObj ) === 'object' ) {
							$elm.each( function () {
								let $inst = $( this );
								if ( nObj[$inst.attr( 'name' )] ) return;
								$inst.on( 'keyup', kCallback );
							} );
							$elm = undefined;
							return;
						}
						$elm.on( 'keyup', kCallback );
						$elm = undefined;
						return;
					}, 0 );
					return this;
				},
				validate: function ( $elm, cb, isGroup ) {
					typeof ( isGroup ) !== 'boolean' ? isGroup = false : undefined;
					typeof ( cb ) !== 'function' ? cb = function () { } : undefined;
					Sow.async( function () {
						$elm = v_worker.getInstance( $elm );
						let outObj = {}, hasError = false;
						$elm.each( function () {
							let $el = $( this );
							if ( $el.attr( 'data-val-own' ) === 'true' ) return;
							let logic = $el.attr( 'data-logic' );
							let isCheckBox = $el.is( ":checkbox" );
							if ( !logic ) {
								outObj[$el.attr( 'name' )] = ( isCheckBox ? $el.is( ":checked" ) : $el.val() );
								return;
							}
							if ( v_worker.validate( $el, logic, isGroup ) ) {
								hasError = true;
								return;
							}
							if ( hasError ) return;
							outObj[$el.attr( 'name' )] = ( isCheckBox ? $el.is( ":checked" ) : $el.val() );
						} );
						cb.call( v_worker, hasError, outObj );
						outObj = undefined;
						return;
					}, 0 );
					return this;
				}
			};
		}, {
			public: false
		}],
		/** [/FORM VALIDATION] */
		/** [TEMPLATE CONTROLLER] */
		9: [function ( require, module, exports ) {
			return module.aggregate( function () {
				return {
					execute: function ( data, method ) {
						return require( 'Sow.Net.Web.XHR' );
					}
				};
			} );
		}, {
			'Sow.Net.Web.XHR': 7
		}],
		/** [/TEMPLATE CONTROLLER] */
		/** [TEMPLATE CONTROLLER] */
		10: [function ( require, module, exports ) {
			return module.aggregate( function () {
				return {

				};
			} );
		}, {
			'Sow.Net.Hub': 2,
			'Sow.Net.Web.XHR': 7
		}],
		/** [/TEMPLATE CONTROLLER] */
	}, {/**[cache]*/ }, /**[entry]*/[9, 10, 2, 1, 3, 4, 5, 6, 7, 8]]
} );
Sow.usingNamespace( 'Sow.Net.Hub' );// Sow.Api.Hub Core
Sow.usingNamespace( 'Sow.Net.Web' );// Page Demand
Sow.define( "Sow", function () {
	var PARENT_NAMESPACE = 'Sow.Net.Web';
	var PAGE_ROUTE = false,
		START_PAGE = CUR_PAGE = function () {
			let page = location.href.split( '#' )[1];
			if ( !page ) return '/pages/dashboard';
			return page;
		}();
	var IS_START = true;
	/*[Export]*/
	return {
		mapPageNamespace: function ( arr ) {
			if ( this.isArrayLike( arr ) ) {
				return Sow.mapNamespace( PARENT_NAMESPACE, arr );
			}
			if ( typeof ( PAGE_ROUTE ) !== 'boolean' ) return;
			Sow.mapNamespace( PARENT_NAMESPACE, 'Sow.Net.Web.default' );
			PAGE_ROUTE = {};
			( function () {
				let
					d = {
						/*"/pages/charts/chartist-js": "Sow.Net.Web.default",
						"/pages/dashboard": "Sow.Net.Web.default",
						"/pages/components/treeview": "Sow.Net.Web.default"*/
					},
					namespace = [];
				for ( let x in d ) {
					this[x] = { is_viewed: false, namespace: d[x] };
					namespace.push( d[x] );
				}
				Sow.mapNamespace( PARENT_NAMESPACE, namespace );
				return;
			}.apply( PAGE_ROUTE ) );
			return this;
		},
		currentPage: function () {
			return CUR_PAGE;
		},
		getQuery: function () {
			var uriObj = {
				full: "", keys: {}
			};
			[function () {
				let uri, lUri, oUri, i, col, oCol;
				uri = window.location.href;
				lUri = uri.toLowerCase().split( '?' );
				if ( !lUri[1] ) return;
				oUri = uri.split( '?' );
				this.full = oUri[1];
				lUri = lUri[1].split( '&' );
				oUri = oUri[1].split( '&' );
				uri = undefined;
				i = lUri.length;
				while ( i-- ) {
					if ( !lUri[i] ) continue;
					col = lUri[i].split( '=' );
					if ( col.length <= 0 ) continue;
					oCol = oUri[i].split( '=' );
					this.keys[col[0]] = oCol[1];
				}
				uri = lUri = oUri = i = col = oCol = undefined;
				return;
			}.call( uriObj )];
			return function ( key ) {
				if ( !key ) return uriObj;
				if ( key === 'full' ) return uriObj.full;
				return uriObj.keys[key];
			};
		}.call( this ),
		onRouterChange: function ( event, route ) {
			if ( IS_START ) {
				IS_START = false;
				console.log( event );
				return;
			}
			if ( typeof ( PAGE_ROUTE ) === 'boolean' ) {
				Sow.mapPageNamespace();
			};
			CUR_PAGE = event.url;
			console.log( String.format( "Page route defind===>{0}", event.url ) );
			if ( typeof ( PAGE_ROUTE[CUR_PAGE] ) !== 'object' ) return;
			let namespace = PAGE_ROUTE[CUR_PAGE].namespace;
			console.log( String.format( "Prepare namespace ===>{0}", namespace ) );
			Sow.reRegisterNamespace( namespace );
			Sow.exportNamespace( namespace ).ready();
			return;
		}
	};
} ).define( "Sow", function () {
	return {
		Web: {
			userInfo: function ( obj ) {
				if ( typeof ( obj ) !== 'object' )
					throw new Error( "Invalid Object defined!!! :(" );
				this.userInfo = Sow.Static.all( obj );
				return this;
			}
		}
	};
} );
