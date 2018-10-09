( function ( _pageWindow, $ ) {
	if ( typeof ( Sow.define ) !== 'function'
		|| typeof ( Sow.registerNamespace ) !== 'function' )
		throw new Error( 'sow.webrtc.js couldn\'t be initilize. One of its dependency `sow.frameworkjs` or  sow.notify ' + ' couldn\t load properly... Please recheck..' );
	Sow.registerNamespace(/**[Namespace Name]*/'Sow.Net.Messaging', function () {
		return /**[modules]*/[{
			/** [Public instance module] */
			"messaging": [function ( require, module, exports ) {
				return {
					init: function ( hubname, conf ) {
						let event = {
							hash: "",
							server: {},
							client: {}
						};
						Sow.hook( hubname ).add( "onNewUserConnected", function ( a ) {
							require( 'core' ).online( a ); return;
						} ).add( "onDisconnectUser", function ( a ) {
							require( 'core' ).offline( a ); return;
						} ).add( "onPrivateMessage", function ( hash, userName, message ) {
							Sow.async( function () { require( "core" ).onPrivateMessage( hash, userName, message ); return; }, 0 );
							return;
						} ).add( "onLoadPrivateMessage", function ( toHash, data ) {
							Sow.async( function () { require( "core" ).onLoadPrivateMessage( toHash, data ); return; }, 0 );
							return;
						} ).add( "onPrivateMessageKeyup", function ( hash ) {
							let $el = $( '[data-chat-msg-user="' + hash + '"]' );
							if ( $el.length <= 0 ) return;
							$el = $( "[data-chat-keyup]", $el );
							$el.html( "Typing....." );
							Sow.async( function () {
								$el.html( "" ); $el = undefined;
								return;
							}, 500 );
							return;
						} ).add( "onLoadMembar", function ( seq, data ) {
							Sow.async( function () { require( "core" ).onLoadMembar( data ); return; }, 0 );
							return this;
						} ).add( "onReconnected", function ( h, c, u ) {
							Sow.async( function () { require( "core" ).onReconnected( h ); return; }, 0 );
							return this;
						} )/*.hook("onReconnect").add( function (c, h, u ) {
							Sow.async( function () { require( "core" ).onReconnected(  ); return; }, 0 );
							return this;
						} )*/;
						//Sow.hook( "onNewUserConnected", 'hub' ).fire( 0 ).hook( "onDisconnectUser" ).fire( 1 );
						require( 'core' ).run( event, conf || {} );
						var connected = false;
						return {
							connect: function ( connectionId, hash, name, data ) {
								let hub = {};
								if ( connected === false ) {
									hub = {
										server: {
											sendPrivateMessage: function ( toHash, message ) { },
											loadPrivateMessage: function ( toHash ) { },
											privateMessageKeyup: function ( toHash ) { },
											loadMembar: function ( seq ) { },
										},
									};
									for ( let p in hub.server ) {
										hub.server[p] = this.server[p];
									}
									connected = true;
								}
								//Sow.hook( "__server_event", hubname ).fire( "loadPrivateMessage", 0 );
								require( 'core' ).onConnect( hub.server, connectionId, hash, name, data );
								return this;
							}
						};
					},
				}
			}, {
				public: true,
				owner: 'Sow.Net.Messaging.Public',
				'core': 'messaging core'
			}],
			"messaging core": [function ( require, module, exports ) {
				var _config = {
					width: 200,
					gap: 35,
					boxList: [],
					showList: [],
					nameList: [],
					idList: [],
					net: {},
					data: []
				};
				return {
					onReconnected: function ( hash ) {
						if ( !hash || hash === _config.net.hash ) {
							$( '[data-chat-msg-user]' ).each( function () {
								let chash = $( this ).attr( 'data-chat-msg-user' );
								if ( !chash ) return;
								chash = String( chash ).trim();
								Sow.async( function () {
									_config.net.server.loadPrivateMessage( chash );
								} );
							} );
							return;
						}
						if ( _config.showList.indexOf( hash ) <= -1 ) {
							return;
						}
						_config.net.server.loadPrivateMessage( hash );
					},
					onConnect: function ( server, connectionId, hash, name, data ) {
						_config.data = ( data === null || typeof ( data ) !== 'object' ? [] : data );
						if ( typeof ( server ) === 'object' ) {
							_config.net.hash = hash;
							Object.extend( _config.net.server, server );
							server = undefined;
						}
						_config.net.server.loadMembar( "0" );
						return this;
					},
					run: function ( net, conf ) {
						Object.extend( _config.net, net );
						net = undefined;
						this.init( conf );
					},
					init: function ( a ) {
						Object.extend( _config, a );
						return this;
					},
					online: function ( hash ) {
						$( '[data-chat-user="true"] a[data-chat-id="' + hash + '"]' )
							.removeClass( 'usr offline' ).addClass( 'usr' )
							.attr( "data-chat-status", "online" );
						let $elm = $( '[data-chat-msg-user="' + hash + '"]' );
						if ( $elm.length <= 0 ) return;
						$elm.find( '.ui-chatbox-titlebar' ).removeClass( "incognito" ).addClass( "online" );
						return;
					},
					offline: function ( hash ) {
						$( '[data-chat-user="true"] a[data-chat-id="' + hash + '"]' )
							.removeClass( 'usr' ).addClass( 'usr offline' ).attr( "data-chat-status", "incognito" );
						let $elm = $( '[data-chat-msg-user="' + hash + '"]' );
						if ( $elm.length <= 0 ) return;
						$elm.find( '.ui-chatbox-titlebar' ).removeClass( "online" ).addClass( "incognito" );
						return;
					},
					getHtml: function ( inf ) {
						//Sadi Orlaf is in a meeting. Please do not disturb!
						inf.desgination = String.format( "<p>{0}</p>", inf.desgination ) || "";
						let _class;
						inf.status === "offline" ? ( _class = 'usr offline', inf.status = "incognito" ) : ( _class = 'usr' );
						return String.format(
							`<a href="#" class="{0}"
							data-chat-id="{1}"
							data-chat-status="{2}"
							data-chat-alertmsg="{3}"
							data-chat-alertshow="{4}"
							data-rel-chat="popover-hover"
							data-placement="right"
							data-html="true"
							data-chat-full_name="{5}"
							data-content="
								<div class='usr-card'>
									<img src='/web/user/avatars/{6}.png' alt='{5}'>
									<div class='usr-card-content'>
										<h3>{5}</h3>{7}
									</div>
								</div>
							">
							<i></i>{5}
						</a>`, _class, inf.hash, inf.status, inf.alert_msg, inf.alert_show, inf.full_name, /*inf.login_id*/'3', inf.designation );
					},
					isOnline: function ( hash ) {
						return _config.data.find( a => a.hash === hash );
					},
					onPrivateMessage: function ( hash, userName, message ) {
						let $el = $( '[data-chat-msg-user="' + hash + '"]' );
						if ( $el.length <= 0 ) return;
						$el = $( '[data-chat-msg-log]', $el );
						$el.chatbox( "option", "boxManager" ).addMsg( "You", message );
						return;
					},
					getFromHtml: function ( msg ) {
						return String.format( `<div class="ui-chatbox-msg"><b>Me: </b><span>{0}</span></div>`, msg );
					},
					getToHtml: function ( msg ) {
						return String.format( `<div class="ui-chatbox-msg"><b>You: </b><span>{0}</span></div>`, msg );
					},
					onLoadPrivateMessage: function ( toHash, data ) {
						if ( data === null ) {
							return this;
						}
						/*let px = {
							"id": 1, "from_user_hash": "978e503ed8f728618c3d11f1ce1a463e",
							"message": "Hi", "to_user_hash": "ceedaf94ac9610031ab5e582eaf36aba",
							"msg_date": null, "from_user_name": "rajibs",
							"to_user_name": "rajib", "creation_date": "2018-05-11"
						}*/
						let $el = $( '[data-chat-msg-user="' + toHash + '"]' );
						if ( $el.length <= 0 ) return;
						if ( typeof ( data ) === 'string' ) {
							data = JSON.parse( data );
						}
						$el = $( '[data-chat-msg-log]', $el );
						let resp = "";
						for ( let i = 0, l = data.length; i < l; i++ ) {
							let row = data[i];
							if ( row.from_user_hash === _config.net.hash ) {
								resp += this.getFromHtml( row.message ); continue;
							}
							resp += this.getToHtml( row.message );
						}
						data = undefined;
						$el.chatbox( "option", "boxManager" ).loadMsg( $el, resp );
						$el = resp = undefined
						return this;
					},
					onLoadMembar: function ( data ) {
						if ( data === null ) {
							this.event();
							return this;
						}
						if ( typeof ( data ) === 'string' ) {
							data = JSON.parse( data );
						}
						let out = "";
						for ( let i = 0, l = data.length; i < l; i++ ) {
							let row = data[i];
							if ( row.hash === _config.net.hash ) continue;
							row.status = this.isOnline( row.hash ) ? "online" : row.status;
							out += this.getHtml( {
								hash: row.hash,
								full_name: row.full_name,
								status: row.status,
								alert_msg: row.alert_message || "",
								alert_show: row.show_alert || false,
								login_id: row.login_id,
								designation: row.designation
							} );
						}
						delete _config.data;
						$( '[data-chat-user="true"]' ).html( out ); out = undefined;
						this.event();
					},
					delBox: function ( a ) { },
					dispatch: function ( a, b, c ) {
						/**if ( !$( "#chatlog" ).doesExist() ) {
							return;
						}*/
						$( "#chatlog" ).append( "You said to <b>" + b.first_name + " " + b.last_name + ":</b> " + c + "<br/>" )
							.effect( "highlight", {}, 500 );
						$( "#" + a ).chatbox( "option", "boxManager" ).addMsg( "Me", c );
						return;

					},
					offset: function () {
						return ( _config.width + _config.gap ) * _config.showList.length
					},
					boxClosed: function ( a ) {
						var b = _config.showList.indexOf( a );
						if ( -1 !== b ) {
							_config.showList.splice( b, 1 ), diff = _config.width + _config.gap;
							for ( let c = b; c < _config.showList.length; c++ ) {
								let offset = $( "#" + _config.showList[c] ).chatbox( "option", "offset" );
								$( "#" + _config.showList[c] ).chatbox( "option", "offset", offset - diff );
							}

						} else alert( "NOTE: Id missing from array: " + a )
					},
					messageSent: function ( a, b, c ) {
						/**if ( !$( "#chatlog" ).doesExist() ) {
							return;
						}*/
						/*$( "#chatlog" ).append( "You said to <b>" + b.first_name + " " + b.last_name + ":</b> " + c + "<br/>" )
							.effect( "highlight", {}, 500 );*/
						$( "#" + a ).chatbox( "option", "boxManager" ).addMsg( "Me", c );
						Sow.async( function () { _config.net.server.sendPrivateMessage( a, c ); return; }, 0 );
						return;
					},
					keyUp: function ( hash, $a ) {
						Sow.async( function () { _config.net.server.privateMessageKeyup( hash ); return; }, 0 );
						return;
					},
					addBox: function ( a, b, e ) {
						let g = _config.showList.indexOf( a ),
							h = _config.boxList.indexOf( a );
						if ( -1 != g );
						else if ( -1 != h ) {
							$( "#" + a ).chatbox( "option", "offset", this.offset() );
							let i = $( "#" + a ).chatbox( "option", "boxManager" );
							i.toggleBox(), _config.showList.push( a )
						} else {
							let j = document.createElement( "div" );
							j.setAttribute( "id", a ), $( j ).chatbox( {
								"id": a,
								"user": b,
								"title": '<i title="' + b.status + '"></i>' + b.full_name,
								"hidden": !1,
								"offset": this.offset(),
								"width": _config.width,
								"status": b.status,
								"alertmsg": b.alertmsg,
								"alertshow": b.alertshow,
								"messageSent": this.messageSent,
								"boxClosed": this.boxClosed,
								"keyUp": this.keyUp,
							} );
							_config.boxList.push( a );
							_config.showList.push( a );
							_config.nameList.push( b.first_name );
						}
						Sow.async( function () { _config.net.server.loadPrivateMessage( a ); return; }, 0 );
					},
					event: function () {
						$( '[data-chat-user="true"]' ).click( function ( e ) {
							e.preventDefault();
							let $el = $( e.target );
							if ( $el.hasClass( 'offline' ) ) return;
							let
								d = $el.attr( "data-chat-id" ),
								f = $el.attr( "data-chat-full_name" ),
								g = $el.attr( "data-chat-status" ) || "online",
								h = $el.attr( "data-chat-alertmsg" ),
								i = $el.attr( "data-chat-alertshow" ) || !1;
							Sow.async( function () {
								require( 'core' ).addBox( d, {
									"title": "username" + d,
									"full_name": f,
									"status": g,
									"alertmsg": h,
									"alertshow": i
								} );
							}, 0 );
						} );
						// activate popovers with hover states
						$( "[data-rel-chat=popover-hover]" ).popover( {
							trigger: "hover"
						} );
					}
				};
			}, {
				'core': 'messaging core'
			}]
		}, {/**[cache]*/ }, /**[entry]*/["messaging", "messaging core"]];

	} );

}( window || this, jQuery ) );