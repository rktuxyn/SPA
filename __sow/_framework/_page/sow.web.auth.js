Sow.Run( function () {
	var _next = function ( next, n ) {
		if ( next ) {
			let r = Sow.getQuery( 'next' );
			n = n || location.pathname;
			if ( r ) {
				n = String.format( "{0}?next={1}", n, r );
			}
			if ( next.indexOf( '?' ) > -1 ) {
				location.href = String.format( "{0}&next={1}", next, encodeURIComponent( n ) );
				return;
			}
			location.href = String.format( "{0}?next={1}", next, encodeURIComponent( n ) );
			return;
		}
		next = Sow.getQuery( 'next' );
		if ( next ) {
			next = decodeURIComponent( next );
			location.href = next;
			return;
		}
		location.href = "/urlroute.aspx";
		return;
	},
		_pubevent = function () {
			$( 'form input[data-type="text"]' ).on( 'keydown', function ( e ) {
				if ( e.keyCode !== 13 ) return;
				Sow.async( function () {
					$( 'form button' ).trigger( 'click' );
				}, 0 );
				e.preventDefault();
				return;
			} );
			$( 'form [data-key="select"]' ).select();
		};
	this.usingNamespace( 'Sow.Net.Web' );
	this.registerNamespace(/**[settings]*/'Sow.Net.Web.Auth.Login', function () {
		return /**[modules]*/[{
			//[Extend VIEW]
			100: [function ( require, module, exports ) {

				return module.aggregate( function () {
					return {
						onExecuteIo: function ( a, b, c ) {
							if ( typeof ( this[c] ) === 'function' )
								this[c]( a, b );
						},
					};
				} );

			}, {
				isExtend: true,
				ext_key: 5
			}],
			//[/Extend VIEW]
			101: [function ( require, module, exports ) {
				return module.aggregate( function () {
					return {
						onLoad: function ( a ) {
							console.log( a );
						},
						ready: function ( a ) {
							require( 'Sow.Net.Web.Validate' ).keyUp( $( 'form input[data-type="text"]' ), undefined, undefined, true );
							var _MSG = {
								"-101": ["value"],
								"-102": ["password"],
								"-103": ['value', 'Invalid @User ! Or <a href="/auth/forgotpassword.aspx">Forgot @User !</a> !'],
								"-104": ['password', 'Password don\'t match with @User...! Or <a href="/auth/forgotpassword.aspx">Forgot !</a>'],
								"103": ['value', 'This @User Exists Our System !']
							};
							_pubevent();
							$( 'form button' ).on( 'click', function ( e ) {
								var $owner = $( this ), $gmsg = $( '#_g_msg' ), $gmsgP = $( $gmsg.parent() );
								$owner.attr( 'disabled', true ); $gmsgP.css( 'display', "none" );
								var $frm = $( 'form input[data-type="text"]' );
								require( 'Sow.Net.Web.Validate' ).reset( $frm, function () {
									this.validate( $frm, function ( isErr, obj ) {
										if ( isErr ) {
											$owner.removeAttr( 'disabled' ); $owner = $gmsg = undefined;
											return;
										}
										obj.param_type = this.isEmail( obj.value ) ? "email" : "user";
										require( 'Sow.Net.Web.XHR' ).xhr( {
											type: "get",
											url: String.format( "/__sow/__handler/routemanager.ashx?q=SGININ&def={0}&ckey={1}", encodeURIComponent( JSON.stringify( obj ) ), $( '#g-recaptcha-response' ).val() ),
											dataType: 'json',
											xhrFields: { withCredentials: true }
										} ).done( function ( data ) {
											$gmsg.html( "" );
											if ( typeof ( data ) === 'string' ) {
												data = JSON.parse( data );
											}
											data.ret_val = parseInt( data.ret_val );
											$owner.removeAttr( 'disabled' ); $owner = undefined;
											if ( data.ret_val === -501 ) {
												$gmsg.html( data.ret_msg );
												$gmsgP.css( 'display', "" ); $gmsg = $gmsgP = undefined;
												Sow.async( function () {
													_next( data.url );
												}, 10 );
												return;
											}
											if ( data.ret_val > 0 ) {
												$gmsg.removeClass( 'error' ).addClass( 'success' ).html( "Login Attempt Successfull." );
												$gmsgP.css( 'display', "" ); $gmsg = $gmsgP = undefined;
												
												Sow.async( function () {
													_next(  );
													return;
												}, 100 );
												return;
											}
											if ( data.ret_val === -1 ) {
												let dmsg = data.ret_msg || "Error. Try again.";
												if ( dmsg.indexOf( "lockdown" ) > -1 ) {
													//"P0001: Your account is lockdown. Please wait ==> 00:05:57.624298.".split( "==>" )[1].split( '.' )
													let spl = dmsg.split( "==>" );
													let left = spl[0];
													let right = spl[1] || "";

													if ( right.indexOf( "." ) > -1 ) {
														right = right.split( "." )[0];
														right = right.trim();
													}
													dmsg = left + " ==> " + right;
												}
												$gmsg.html( dmsg );
												$gmsgP.css( 'display', "" ); $gmsg = $gmsgP = undefined;
												return;
											}
											let rv = String( data.ret_val );
											if ( data.ret_val === -550 ) {
												$gmsg = $gmsgP = undefined;
												let arr = JSON.parse( data.ret_msg );
												for ( let i = 0, l = arr.length; i < l; i++ ) {
													let karr = _MSG[String( arr[i] )];
													if ( !karr || !Sow.isArrayLike( karr ) ) {
														continue;
													}
													let kv = karr[0];
													$( '[data-msg_name="' + kv + '"]' ).removeClass( "success" ).addClass( "error" ).html( karr[1] );
													$( $( "#" + kv ).parent() ).removeClass( "state-success" ).addClass( "state-error" );
												}
												return;
											}
											let res = _MSG[rv];
											if ( !Sow.isArrayLike( res ) ) {
												$gmsg.html( data.ret_msg ); $gmsgP.css( 'display', "" ); $gmsg = $gmsgP = undefined;
												return;
											}
											$gmsg = $gmsgP = undefined;
											let key = res[0];
											$( '[data-msg_name="' + key + '"]' ).removeClass( 'success' ).addClass( 'error' ).html( res[1] || data.ret_msg );
											return;
										} ).fail( function ( jqXHR, textStatus ) {
											console.log( textStatus );
											$owner.removeAttr( 'disabled' );
											$gmsg.html( textStatus ); 
											$gmsgP.css( 'display', "" ); $owner = $gmsg = $gmsgP = undefined;
										} );
									}, true );
									$frm = undefined;
									return;
								}, true );
							} );
							$( 'form' ).on( "submit", function ( e ) {
								$( 'button', this ).trigger( "click" );
								e.preventDefault();
							} );
						}
					};
				} );

			}, {
				'Sow.Net.Web.Controller': 3,
				'Sow.Net.Web.Data': 4,
				'Sow.Net.Web.View': 5,
				'Sow.Net.Web.XHR': 7,
				'Sow.Net.Web.Validate': 8
			}]
		}, {/**[cache]*/ }, /**[entry]*/[100, 101]]
	} ).registerNamespace(/**[settings]*/'Sow.Net.Web.Auth.SginUp', function () {
		return /**[modules]*/[{
			//[Extend VIEW]
			100: [function ( require, module, exports ) {

				return module.aggregate( function () {
					return {
						onExecuteIo: function ( a, b, c ) {
							if ( typeof ( this[c] ) === 'function' )
								this[c]( a, b );
						},
						onSignalRReady: function () {

						}
					};
				} );

			}, {
				isExtend: true,
				ext_key: 5
			}],
			//[/Extend VIEW]
			101: [function ( require, module, exports ) {
				return module.aggregate( function () {
					return {
						onLoad: function ( a ) {
							console.log( a );
						},
						ready: function ( a ) {
							_pubevent();
							var _MSG = {
								"-103": ["email", "Email should be the real one!!!"],
								"-1031": ["email", "Email should be the real one!!!"],
								"-10311": ['email', 'This @User Exists Our System !'],
								"-107": ["login_id", "Login should be the real one!!!"],
								"-10711": ['login_id', 'This @User Exists Our System !'],
								"-104": ["password", "Password required"],
								"-1041": ["re_pass", "Password does not match the confirm password!!"],
								"-105": ['first_name', 'First name required!!'],
								"-1051": ['first_name', 'Maximum length exceed (250)!!'],
								"-106": ['last_name', 'Last name required!!'],
								"-1061": ['last_name', 'Maximum length exceed (250)!!'],
								"-107": ["gender", "Invalid gender defined!!!"],
								"-108": ["terms", "You should accept our Terms and Conditions."]
							}, _invalidInput = function ( $el, $msg, msg ) {
								$msg.removeClass( 'success' )
									.addClass( 'error' ).html( msg );
								$( $el.parent() ).removeClass( "state-success" )
									.addClass( "state-error" );
								$el = $msg = undefined; return;
							}, _isInvalidEmail = function ( $el, $msg ) {
								$el = this.getInstance( $el || "#email" );
								let attr = $el.attr( "data-v-error" );
								if ( attr ) {
									attr = String( attr ).toUpperCase();
									if ( attr === 'TRUE' ) return true;
									return false;
								}
								$msg = this.getInstance( $msg || '[data-msg_name="email"]' );
								if ( this.validate( $el, undefined, true, false, function ( a, b ) {
									if ( a ) {
										_invalidInput( this, $msg, b );
										return;
									}
									return;
								} ) ) {
									return true;
								};
								return false;
							};
							module.Closure( function () {
								var $pass = $( '#password[data-type="text"]' );
								var $re = $( '#re_pass[data-type="text"]' );
								var _c_work = {
									password: function ( $el, name ) {
										if ( this.validate( $el, undefined, true, false ) ) return;
										_c_work.re_pass.call( this, $re, "re_pass", true );
										return;
									},
									re_pass: function ( $el, name, isIn ) {
										let rval = $el.val();
										let $inst = $( '[data-msg_name="re_pass"]' );
										if ( isIn === true ) {
											if ( String( rval ).length <= 0 ) {
												_invalidInput( $el, $inst, "Password does not match the confirm password!!" );
												$el = $inst = undefined;
												return;
											}
										}
										$inst.removeClass( 'success' ).removeClass( 'error' ).html( "" );
										/*if ( this.validate( $el, undefined, true ) ) {
											$inst = undefined; return;
										};*/
										let pval = $pass.val();

										if ( pval === rval ) {
											$inst.addClass( 'success' ).html( "Wel done! Password matched!!!" );
											$( $el.parent() ).removeClass( "state-error" ).addClass( "state-success" );
											$el = $inst = undefined;
											return;
										}
										_invalidInput( $el, $inst, "Password does not match the confirm password!!" );
										$el = $inst = undefined;
										return;
									},
									login_id: function ( $el, name ) {
										return _c_work.commonKeyup.call( this, $el, name )
									},
									email: function ( $el, name) {
										return _c_work.commonKeyup.call( this, $el, name )
									},
									commonKeyup: this.aggregate( function () {
										var _coW = {
											xhr: {
												remove: function ( task ) {
													this[task] = {};
													return this;
												},
												abort: function ( task ) {
													if ( this[task] ) {
														if ( typeof ( this[task].abort ) === 'function' ) {
															this[task].abort();
														}
													}
													this.remove( task );
												}
											},
											setError: function ( msg, $inst ) {
												this.attr( "data-v-error", true );
												$( this.parent() ).removeClass( "state-success" )
													.addClass( "state-error" );
												$inst.removeClass( 'success' ).addClass( 'error' ).html( '<img src="/__sow/images/error.png" /> ' + msg );
												return;
											},
										};

										return function ( $el, task ) {
											//var task = $el.attr( "id" );
											_coW.xhr.abort( task );
											var $inst = $( '[data-msg_name="' + task + '"]' );
											$inst.removeClass( 'success' ).removeClass( 'error' ).html( "" );
											if ( this.validate( $el, undefined, true ) ) {
												$el = undefined;
												return;
											};
											
											let val = $el.val();
											let task_type = this.isEmail( val ) ? 'email' : 'user';
											$inst.html( '<img src="/__sow/images/ajax-loading.gif" /> Please wait..! ' );
											_coW.xhr[task] = require( 'Sow.Net.Web.XHR' ).xhr( {
												type: "get",
												url: String.format( "/__sow/__handler/routemanager.ashx?q=key_up&task_type={0}&sp=___check__key_up&def={1}", task_type, encodeURIComponent( JSON.stringify( { value: val } ) ) ),
												dataType: 'json',
												xhrFields: { withCredentials: true }
											} ).done( function ( data ) {
												_coW.xhr.remove( task );
												if ( typeof ( data ) === 'string' ) {
													data = JSON.parse( data );
												}
												if ( data.ret_val < 0 ) {
													_coW.setError.call( $el, data.ret_msg, $inst );
													$el = undefined;
													return;
												}
												$( $el.parent() ).removeClass( "state-error" )
													.addClass( "state-success" );
												$el.attr( "data-v-error", false );
												$inst.removeClass( 'error' ).addClass( 'success' ).html( '<img src="/__sow/images/accept.png" /> ' + data.ret_msg );
												$el = undefined;
												return;
											} ).fail( function ( jqXHR, textStatus ) {
												console.log( textStatus );
												if ( textStatus !== 'abort' ) {
													_coW.setError.call( $el, textStatus, $inst );
													$el = undefined;
												}
												_coW.xhr.remove( task ); $el = $inst = undefined;
											} );
										}
									} )
								};
								require( 'Sow.Net.Web.Validate' ).keyUp( $( 'form input[data-type="text"]' ), function ( $el, name ) {
									if ( typeof ( _c_work[name] ) !== "function" ) return;
									_c_work[name].call( this, $el, name );
								}, { "email": "common_keyup", "login_id": "common_keyup", "re_pass": "re_pass", "password": "password" }, true );
							} ).Closure( function () {
								var _PS = Sow.exportNamespace( 'Sow.Web.Password.Strength' );
								_PS.response = function ( rsp ) {
									//this.after( String.format( '<div class="tooltip swing" data-title=\'{0}\'></div>', rsp.req_msg ) );
									this.after( '<small data-type="___msg" style = "class="form-text error"> ' + rsp.cur_strength + '</small >' );
									if ( rsp.mark < 3 ) {
										$( this.parent() ).removeClass( "state-success" )
											.addClass( "state-error" );
										return true;
									}
									$( this.parent() ).removeClass( "state-error" )
										.addClass( "state-success" );
									return false;
								};
								_PS.register( "#password", _PS.response );
								_PS.hasError = function () {
									let $p = $( "#password" );
									$p.next().remove();
									return this.response.call( $p, this.check( $p.val() ) );
								};
								var _resetFormObject = function ( obj ) {
									for ( let p in obj ) {
										if ( obj[p] === undefined || obj[p] === "" ) {
											obj[p] = null; continue;
										}
										if ( obj[p] === 'on' || obj[p] === 'off' ) {
											obj[p] = obj[p] === 'on' ? true : false;
										}
									}
									return obj;
								};
								var _modal = function () {
									var __cb = function () { };
									var $terms = undefined;// $( "#terms" );
									var mworker = {
										get $terms() {
											return !( $terms instanceof $ ) ? $( "#terms" ) : $terms;
										},
										get cb() {
											return typeof ( __cb ) !== 'function' ? function () { } : __cb;
										},
										cancel: function () {
											this.$terms.prop( 'checked', false );
											$terms = undefined; $( '#termsModal' ).modal( "hide" );
											this.cb.call( this, "CANCLED" );
											__cb = undefined; return this;
										},
										agree: function () {
											this.$terms.prop( 'checked', true );
											$terms = undefined; $( '#termsModal' ).modal( "hide" );
											this.cb.call( this, "AGREE" );
											__cb = undefined; return this;
										},
									};
									$( '#termsModal button' ).on( 'click', function ( e ) {
										e.preventDefault();
										let $owner = $( this );
										let who = $owner.attr( 'data-ref-button' );
										if ( typeof ( mworker[who] ) === 'function' ) {
											mworker[who](); console.log( who );
											return;
										}
										console.log( "Invalid==>", who );
									} );
									return {
										show: function ( $term, cb ) {
											$( '#termsModal' ).modal( 'show' );
											$terms = $term;
											__cb = cb;
											return this;
										}
									};
								}();
								var _execute = {
									request: function ( $owner, cb ) {
										var $gmsg = $( '#_g_msg' ), $gmsgP = $( $gmsg.parent() );
										$owner.attr( 'disabled', true ); $gmsgP.css( 'display', "none" );
										var $frm = $( 'form [data-type="text"]' );
										require( 'Sow.Net.Web.Validate' ).reset( $frm, function () {
											this.validate( $frm, function ( isErr, obj ) {
												let pError = _PS.hasError();
												let emailError = _isInvalidEmail.call( this );
												if ( isErr || pError || emailError ) {
													$owner.removeAttr( 'disabled' ); $owner = $gmsg = undefined;
													cb.call( this );
													return;
												}
												if ( obj.password !== obj.re_pass ) {
													$owner.removeAttr( 'disabled' ); $owner = $gmsg = undefined;
													_invalidInput( $( "#re_pass" ), $( '[data-msg_name="re_pass"]' ), "Password does not match the confirm password!!" );
													cb.call( this );
													return;
												}
												obj = _resetFormObject( obj );
												require( 'Sow.Net.Web.XHR' ).xhr( {
													type: "get",
													url: String.format( "/__sow/__handler/routemanager.ashx?q=SGINUP&def={0}&ckey={1}", encodeURIComponent( JSON.stringify( obj ) ), $( '#g-recaptcha-response' ).val() ),
													dataType: 'json',
													xhrFields: { withCredentials: true }
												} ).done( function ( data ) {
													$gmsg.html( "" );
													if ( typeof ( data ) === 'string' ) {
														data = JSON.parse( data );
													}
													data.ret_val = parseInt( data.ret_val );
													$owner.removeAttr( 'disabled' ); $owner = undefined;
													if ( data.ret_val === -501 ) {
														cb.call( this );
														$gmsg.html( data.ret_msg );
														$gmsgP.css( 'display', "" ); $gmsg = $gmsgP = undefined;
														Sow.async( function () {
															_next( data.url );
														}, 1000 );
														return;
													}
													if ( data.ret_val > 0 ) {
														$gmsg = undefined; cb.call( this );
														_next( data.url, "/auth/login.aspx" );
														return;
													}
													if ( data.ret_val === -1 ) {
														$gmsg.html( data.ret_msg ); $gmsgP.css( 'display', "" ); $gmsg = $gmsgP = undefined;
														return;
													}
													let rv = String( data.ret_val );
													if ( data.ret_val === -550 ) {
														$gmsg = undefined;
														let arr = JSON.parse( data.ret_msg );
														for ( let i = 0, l = arr.length; i < l; i++ ) {
															let karr = _MSG[String( arr[i] )];
															if ( !karr || !Sow.isArrayLike( karr ) ) {
																continue;
															}
															let kv = karr[0];
															$( '[data-msg_name="' + kv + '"]' ).removeClass( 'success' ).addClass( 'error' ).html( karr[1] );
															$( $( "#" + kv ).parent() ).removeClass( "state-success" ).addClass( "state-error" );
														}
														cb.call( this );
														return;
													}
													let res = _MSG[rv];
													if ( !Sow.isArrayLike( res ) ) {
														cb.call( this );
														$gmsg.html( data.ret_msg ); $gmsgP.css( 'display', "" ); $gmsg = $gmsgP = undefined;
														return;
													}
													$gmsg = undefined;
													let key = res[0];
													$( '[data-msg_name="' + key + '"]' ).removeClass( 'success' ).addClass( 'error' ).html( res[1] || data.ret_msg );
													$( $( "#" + key ).parent() ).removeClass( "state-success" ).addClass( "state-error" );
													cb.call( this );
													return;
												} ).fail( function ( jqXHR, textStatus ) {
													console.log( textStatus );
													$owner.removeAttr( 'disabled' );
													$gmsg.html( textStatus );
													$gmsgP.css( 'display', "" ); $owner = $gmsg = $gmsgP = undefined;
													cb.call( this );
												} );
											}, true );
											$frm = undefined;
											return;
										}, true );
									}
								};
								$( 'form button' ).on( 'click', function ( e ) {
									e.preventDefault();
									var $terms = $( "#terms" );
									if ( $terms.is( ":checked" ) == false ) {
										var $owner = $( this );
										_modal.show( $terms, function ( s ) {
											$terms.exit(); $terms = undefined;
											if ( s !== "AGREE" ) return;
											_execute.request( $owner, function () {
												$owner = undefined;
												console.log( "RESPONSED" );
											} );
										} );
										return;
									}
									$terms.exit(); $terms = undefined;
									_execute.request( $( this ), function () {
										console.log( "RESPONSED" );
									} );
								} );
								$( 'form' ).on( "submit", function ( e ) {
									$( 'button', this ).trigger( "click" );
									e.preventDefault();
								} );
							} );

						}
					};
				} );

			}, {
				'Sow.Net.Web.Controller': 3,
				'Sow.Net.Web.Data': 4,
				'Sow.Net.Web.View': 5,
				'Sow.Net.Web.XHR': 7,
				'Sow.Net.Web.Validate': 8
			}]
		}, {/**[cache]*/ }, /**[entry]*/[100, 101]]
	} ).registerNamespace(/**[settings]*/'Sow.Net.Web.Auth.ForgotPassword', function () {
		return /**[modules]*/[{
			//[Extend VIEW]
			100: [function ( require, module, exports ) {

				return module.aggregate( function () {
					return {
						onExecuteIo: function ( a, b, c ) {
							if ( typeof ( this[c] ) === 'function' )
								this[c]( a, b );
						},
					};
				} );

			}, {
				isExtend: true,
				ext_key: 5
			}],
			//[/Extend VIEW]
			101: [function ( require, module, exports ) {

				return module.aggregate( function () {
					return {
						onLoad: function ( a ) {
							console.log( a );
						},
						ready: function ( a ) {
							_pubevent();
							require( 'Sow.Net.Web.Validate' ).keyUp( $( 'form input[data-type="text"]' ), undefined, undefined, true );
							var fp_worker = {
								confirm: function ( $owner, $gmsg ) {
									require( 'Sow.Net.Web.XHR' ).xhr( {
										type: "GET",
										url: String.format( "/app/api/get/user/get_paw_reset_email/?t={0}", Math.floor( ( 0x90 + Math.random() ) * 0x10000000 ) ),
										dataType: 'json',
										xhrFields: { withCredentials: true },
									} ).done( function ( data ) {
										$owner.removeAttr( 'disabled' ); $owner = undefined;
										if ( typeof ( data ) === 'string' ) {
											data = JSON.parse( data );
										}
										console.log( data );
										data.ret_val = parseInt( data.ret_val );
										$gmsg.parent().css( "display", "" );

										if ( data.ret_val < 0 ) {
											$gmsg.addClass( 'error' ).html( data.ret_msg ); $gmsg = undefined;
											return;
										}
										$gmsg.addClass( 'success' ).html( data.ret_msg ); $gmsg = undefined;
										return;
									} ).fail( function ( jqXHR, textStatus ) {
										console.log( textStatus );
										$owner.removeAttr( 'disabled' );
										$gmsg.addClass( 'error' ).html( textStatus ); $owner = $gmsg = undefined;
									} );
								},
								find: function ( $owner, $gmsg) {
									var $frm = $( 'form input[data-type="text"]' );
									require( 'Sow.Net.Web.Validate' ).reset( $frm, function () {
										this.validate( $frm, function ( isErr, obj ) {
											if ( isErr ) {
												$owner.removeAttr( 'disabled' ); $owner = $gmsg = undefined;
												return;
											}
											require( 'Sow.Net.Web.XHR' ).xhr( {
												type: "POST",
												url: String.format( "/app/api/get/user/find_account/?conf={0}&t={1}", encodeURIComponent( JSON.stringify( {
													sp: "___find__account",
													validate: true,
													module: "auth",
												} ) ), Math.floor( ( 0x90 + Math.random() ) * 0x10000000 ) ),
												dataType: 'json',
												data: JSON.stringify( {
													def: obj
												} ),
												xhrFields: { withCredentials: true },
												contentType: "application/json"
											} ).done( function ( data ) {
												$owner.removeAttr( 'disabled' ); $owner = undefined;
												if ( typeof ( data ) === 'string' ) {
													data = JSON.parse( data );
												}
												data.ret_val = parseInt( data.ret_val );
												$gmsg.parent().css( "display", "" );

												if ( data.ret_val < 0 ) {
													$gmsg.addClass( 'error' ).html( data.ret_msg ); $gmsg = undefined;
													return;
												}
												$gmsg.addClass( 'success' ).html( data.ret_msg ); $gmsg = undefined;
												Sow.async( function () {
													_next( String.format( "/auth/forgotpassword.aspx?token={0}", data.token ) );
													return;
												}, 500 );
												return;
											} ).fail( function ( jqXHR, textStatus, msg ) {
												console.log( textStatus );
												$owner.removeAttr( 'disabled' );
												$gmsg.addClass( 'error' ).html( msg || textStatus ).parent().css( "display", "" ); $owner = $gmsg = undefined;
											} );
										}, true );
										$frm = undefined;
										return;
									}, true );
								},
							};
							$( 'form button' ).on( 'click', function ( e ) {
								e.preventDefault();
								var $owner = $( this ), $gmsg = $( '#_g_msg' );
								$gmsg.removeClass( 'success' ).removeClass( 'error' ).html( "" );
								$gmsg.parent().css( "display", "none" );
								
								let task = $owner.attr( 'data-task' );
								if ( typeof ( fp_worker[task] ) !== 'function' ) {
									return;
								}
								$owner.attr( 'disabled', true );
								fp_worker[task]( $owner, $gmsg );
							} );
							$( 'form' ).on( "submit", function ( e ) {
								$( 'button', this ).trigger( "click" );
								e.preventDefault();
							} );
						}
					};
				} );

			}, {
				'Sow.Net.Web.Controller': 3,
				'Sow.Net.Web.Data': 4,
				'Sow.Net.Web.View': 5,
				'Sow.Net.Web.XHR': 7,
				'Sow.Net.Web.Validate': 8
			}]
		}, {/**[cache]*/ }, /**[entry]*/[100, 101]]
	} ).registerNamespace(/**[settings]*/'Sow.Net.Web.Auth.ResetPassword', function () {
		return /**[modules]*/[{
			//[Extend VIEW]
			100: [function ( require, module, exports ) {

				return module.aggregate( function () {
					return {
						onExecuteIo: function ( a, b, c ) {
							if ( typeof ( this[c] ) === 'function' )
								this[c]( a, b );
						},
					};
				} );

			}, {
				isExtend: true,
				ext_key: 5
			}],
			//[/Extend VIEW]
			101: [function ( require, module, exports ) {

				return module.aggregate( function () {
					return {
						onLoad: function ( a ) {
							console.log( a );
						},
						ready: function ( a ) {
							var _worker = {
								strangth: {}
							};
							_pubevent();
							_worker.strangth = Sow.exportNamespace( 'Sow.Web.Password.Strength' );
							_worker.strangth.response = function ( rsp ) {
								//this.after( String.format( '<div class="tooltip swing" data-title=\'{0}\'></div>', rsp.req_msg ) );
								this.after( '<small data-type="___msg" style = "class="form-text error"> ' + rsp.cur_strength + '</small >' );
								let $parent = $( this.parent() );
								if ( rsp.mark < 3 ) {
									if ( !$parent.hasClass( "state-error" ) ) {
										$parent.removeClass( "state-success" ).addClass( "state-error" );
									}
									$parent.exit(); $parent = undefined;
									return true;
								}
								if ( !$parent.hasClass( "state-success" ) ) {
									$parent.removeClass( "state-error" )
										.addClass( "state-success" );
								}
								$parent.exit(); $parent = undefined;
								return false;
							};
							_worker.strangth.register( $( '[data-field-key="new_passwored"]' ), _worker.strangth.response );
							_worker.strangth.hasError = function ( $elm ) {
								//let $p = $( "#password" );
								$elm.next().remove();
								return this.response.call( $elm, this.check( $elm.val() ) );
							};
							_worker.status = function (error) {
								let $parent = $( this.parent() );
								if ( error ) {
									if ( !$parent.hasClass( "state-error" ) ) {
										$parent.removeClass( "state-success" )
											.addClass( "state-error" );
									}
									return;
								}
								if ( !$parent.hasClass( "state-success" ) ) {
									$parent.removeClass( "state-error" )
										.addClass( "state-success" );
								}
								return;
							};
							_worker.strangth.confirm = function ( $owner, call ) {
								let cpaw = $owner.val();
								if ( !cpaw ) {
									_worker.status.call( $owner, true );
									if ( call ) {
										this.hasError( this.$() );
										return {
											error: true
										};
									}
									return false;
								}
								let npaw = this.$().val();
								if ( cpaw !== npaw || !npaw ) {
									_worker.status.call( $owner, true );
									if ( call ) {
										this.hasError( this.$() );
										return {
											error: true
										};
									}
									return false;
								}
								_worker.status.call( $owner, false );
								if ( call )
									return {
										error: this.hasError( this.$() ),
										new_passwored: npaw,
										confirm_passwored: cpaw
									};
								return true;

							};
							//let pError = _worker.strangth.hasError();
							$( '[data-field-key="confirm_passwored"]' ).on( "input", function ( e ) {
								let $owner = $( this );
								Sow.async( function () {
									_worker.strangth.confirm( $owner );
									return;
								} );
							} );
							$( 'form' ).on( "submit", function (e) {
								$( 'button', this ).trigger( "click" );
								e.preventDefault();
							} );
							$( 'form button' ).on( 'click', function ( e ) {
								e.preventDefault();
								var $owner = $( this ), $gmsg = $( '#_g_msg' );
								$gmsg.removeClass( 'success' ).removeClass( 'error' ).html( "" );
								$gmsg.parent().css( "display", "none" );
								
								let def = _worker.strangth.confirm( $( '[data-field-key="confirm_passwored"]' ), true );
								if ( def.error ) return;
								$owner.attr( 'disabled', true );
								require( 'Sow.Net.Web.XHR' ).xhr( {
									type: "POST",
									url: String.format( "/app/api/get/user/reset_paw/?conf={0}&t={1}", encodeURIComponent( JSON.stringify( {
										sp: "password_rest__confirm",
										validate: true,
										module: "auth",
									} ) ), Math.floor( ( 0x90 + Math.random() ) * 0x10000000 ) ),
									dataType: 'json',
									data: JSON.stringify( {
										def: def
									} ),
									xhrFields: { withCredentials: true },
									contentType: "application/json"
								} ).done( function ( data ) {
									$owner.removeAttr( 'disabled' ); $owner = undefined;
									if ( typeof ( data ) === 'string' ) {
										data = JSON.parse( data );
									}
									data.ret_val = parseInt( data.ret_val );
									$gmsg.parent().css( "display", "" );

									if ( data.ret_val < 0 ) {
										$gmsg.addClass( 'error' ).html( data.ret_msg ); $gmsg = undefined;
										return;
									}
									$gmsg.addClass( 'success' ).html( data.ret_msg ); $gmsg = undefined;
									Sow.async( function () {
										_next( String.format( "/auth/login.aspx?token={0}", Math.floor( ( 0x90 + Math.random() ) * 0x10000000 ) ) );
										return;
									}, 1000 );
									return;
								} ).fail( function ( jqXHR, textStatus, msg ) {
									console.log( textStatus );
									$owner.removeAttr( 'disabled' );
									$gmsg.addClass( 'error' ).html( msg || textStatus ).parent().css( "display", "" ); $owner = $gmsg = undefined;
								} );
							} );
						}
					};
				} );

			}, {
				'Sow.Net.Web.Controller': 3,
				'Sow.Net.Web.Data': 4,
				'Sow.Net.Web.View': 5,
				'Sow.Net.Web.XHR': 7,
				'Sow.Net.Web.Validate': 8
			}]
		}, {/**[cache]*/ }, /**[entry]*/[100, 101]];
	} ).mapPageNamespace( ['Sow.Net.Web.Auth.Login', 'Sow.Net.Web.Auth.SginUp', 'Sow.Net.Web.Auth.ForgotPassword', 'Sow.Net.Web.Auth.ResetPassword'] );
} );