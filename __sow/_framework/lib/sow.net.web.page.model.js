//!#sow.net.web.page.model.js
( function ( $, window ) {
	Sow.usingNamespace( 'Sow.Net.Web' )
		.registerNamespace(/**[settings]*/"Sow.Net.Web.Page.Renderer", function () {
			return /**[modules]*/[{
				"Page.Renderer": [function ( require, module, exports ) {
					return {
						renderer: module.aggregate( function () {
							var _map = {};
							return {
								script: {
									remove: function ( route ) {
										let id = _map[route];
										if ( !id ) return this;
										$( "#" + id ).remove();
									},
									append: function ( route, script, cb ) {
										if ( !script ) {
											cb.call( this, "ERROR" );
											return;
										}
										//isNewWindow
										let $elm = $( "<script>" );
										$elm.attr( "type", "text/javascript" )
										$elm.attr( "data-page-model-script", route );
										$elm.on( "load", function ( e ) {
											let b = $elm.attr( "src" );
											URL.revokeObjectURL( b );
											console.log( "LOADED ==>" + route + "  Script ==>" + b );
											$elm.remove(); $elm.exit(); $elm = undefined;
											cb( "SUCCESS" );
										} ).on( "error", function ( e ) {
											let b = $elm.attr( "src" );
											URL.revokeObjectURL( b );
											console.log( "ERROR==>" + route );
											cb( "ERROR" );
										} );
										$elm.attr( "src", URL.createObjectURL( new Blob( [script], { type: 'text/javascript' } ) ) );
										script = undefined;
										document.body.appendChild( $elm[0] );
										return;
									}
								}
							};
						}, function () {
							var _template = {};
							return {
								getTemplate: function ( templ, cb ) {
									if ( typeof ( cb ) !== 'function' )
										throw new Error( "Invalid instance defined instead of Function" );
									if ( !templ ) {
										templ = '_default.tmpl';
									}
									if ( _template[templ] ) {
										Sow.async( function () {
											cb.call( require( 'Renderer' ).renderer, "SUCCESS", _template[templ] );
										}, 0 );
										return this;
									}
									require( 'Sow.Net.Web.XHR' ).xhr( {
										type: "GET",
										url: String.format( "/web/form/template/{0}", templ),
										dataType: 'text',
										async: true,
									} ).done( function ( data ) {
										let footer = $( '[data-footer-info]' ).html();
										_template[templ] = data.replace( /{__footer__info__here__}/g, footer ); data = undefined;
										Sow.async( function () {
											cb.call( require( 'Renderer' ).renderer, "SUCCESS", _template[templ] );
										}, 0 );
										return this;
									} ).fail( function ( xhr, s, t, a ) {
										cb.call( require( 'Renderer' ), "ERROR", s );
										return this;
									} );
								}
							}
						}, function () {
							var __pages = {}, __dependency = {};
							return {
								assign: function ( opt, dependency ) {
									if ( !opt['ajax'] )
										opt['ajax'] = {};
									if ( dependency ) {
										if ( !__dependency[dependency] ) {
											__dependency[dependency] = [];
										}
										__dependency[dependency].push( opt.reg.route );
									}
									__pages[opt.reg.route] = opt;
									return this;
								},
								postmortem: function () {
									for ( let p in __pages ) {
										this.dispose( p );
									}
									__pages = {};
									return this;
								},
								openNew: function ( opt ) {
									$( '.page-loader-wrapper' ).fadeIn( 'slow' );
									opt.url = opt.route.split( "?" )[0];
									$.ajax( {
										type: "GET",
										ifModified: true,
										url: String.format( "/app/api/view/pages/?view={0}&ct={1}&c={2}", opt.url, "text/javascript", _IS_LOCAL_ === "T" ? "NO_NEED" : ""  ),
										cache: true, data: {}, dataType: 'text',
										async: true,
										beforeSend: function ( xhr ) {
											this.ifModifiedSince( xhr);
										}
                                    } ).done( function ( data, status, xhr ) {
                                        let ct = xhr.getResponseHeader( "content-type" ) || "";
                                        let hasError = ct === "text/plain";
                                        let $container = $( "<div>" );// Open Dialog Here
                                        var func = function (error) {
                                            let isOpen = false;
                                            let config = {
                                                draggable: true,
                                                modal: true,
                                                resizable: false,
                                                title: "Window",
                                                position: hasError ? { my: "center" } : { my: "center", at: "top" },
                                                open: function ( event, ui ) { },
                                                close: function () {
                                                    Sow.hook( "__web__page" ).fire( "before_route_change", [opt.url, function () {
                                                        if ( !isOpen ) {
                                                            $container.remove(); $container = undefined;
                                                        }
                                                        console.log( "Closed" ); opt = undefined;
                                                    }] );
                                                }
                                            };
                                            if ( Sow.OS === 'Windows' ) {
                                                if ( typeof ( opt.width ) === 'string' ) {
                                                    config.width = opt.width;
                                                } else {
                                                    config.width = ( $( window ).width() - 150 ) + "px";
                                                }
                                                if ( typeof ( opt.height ) === 'string' ) {
                                                    config.height = opt.height;
                                                } else {
                                                    config.height = "auto";
                                                }
                                            }
                                            $.ui.dialog( config, $container );
                                            config = undefined;
                                            if ( hasError ) {
                                                $( '.page-loader-wrapper' ).fadeOut( "solow" );
                                                if ( !error ) {
                                                    $container.html( data );
                                                }
                                                data = undefined; opt.fail();
                                                $( '.ui-dialog-title', $container.parent() ).html( "404 Not Found!!!" );
                                                $( '.ajax-loading-error', $container ).css( "margin-top", "10px" );
                                                return;
                                            }
                                            Sow.hook( "__web__page" ).fire( "on_route_change", [opt.route, $container, data, function () {
                                                if ( !isOpen ) {
                                                    if ( Sow.OS !== "Windows" && !hasError ) {
                                                        $( '[data-id="widget-grid"]', $container ).css( {
                                                            "overflow": "hidden",
                                                            "max-height": ( $( window ).height() - 70 ) + "px"
                                                        } ).css( "overflow-y", "scroll" );
                                                        $container.parent().css( "width", "100%" ).css( "left", "0px" );
                                                    }
                                                    $( '.page-loader-wrapper' ).fadeOut( "solow" );
                                                    //$container.exit();
                                                    $container = data = undefined;
                                                    isOpen = true;
                                                }
                                                if ( typeof ( opt.done ) === 'function' )
                                                    opt.done.apply( this, Array.prototype.slice.call( arguments ) );
                                            }, true] );
                                        };
										$( "body" ).append( $container );
                                        let errorCode = xhr.getResponseHeader( "x-response-error-code" ) || "";
                                        if ( errorCode && errorCode !== null ) {
                                            hasError = true; opt.height = "auto";
                                            Sow.Net.Web.Page.Renderer.errorResponse( errorCode, $container, data, function ( $elm, response ) {
                                                func.call( this, true ); func = undefined;
                                                return;
                                            } );
                                            return;
                                        }
                                        func.call( this, false ); func = undefined;
                                        return;
									} ).fail( function () {
										$( '.page-loader-wrapper' ).fadeOut( "solow" );
										opt.fail();
									} );
								},
								init: this.aggregate( function () {
									var _iWorker = {
										xhr: this.aggregate( function () {
											var _xhr = {
												getData: function ( obj ) {
													if ( typeof ( obj.def ) === 'string' )
														return obj;
													if ( obj === null || !obj || typeof ( obj ) !== 'object' )
														throw new TypeError( '"obj" is null or not defined' );
													if ( obj.def === null || !obj.def || typeof ( obj.def ) !== 'object' )
														throw new TypeError( '"obj.form_object" is null or not defined' );
													if ( obj.conf === null || !obj.conf || typeof ( obj.conf ) !== 'object' )
														throw new TypeError( '"obj.conf" is null or not defined' );
													return obj;
												},
												execute: function ( settings, scb, ecb ) {
													scb = typeof ( scb ) !== 'function' ? function () { } : scb;
													ecb = typeof ( ecb ) !== 'function' ? function () { } : ecb;
													return $.ajax( settings ).done( scb ).fail( ecb );
												}
											};
											return {
												isValid: function ( data, msg ) {
													if ( data === null || typeof ( data ) !== 'object' ) {
														Sow.Show.i( msg || "Invalid response defined!!!" );
														return null;
													}
													if ( parseInt( data.ret_val ) < 0 ) {
														Sow.Show.e( data.ret_msg || ( msg || "No data found!!!" ) );
														return null;
													}
													if ( data.ret_data_table === undefined || data.ret_data_table === null ) {
														Sow.Show.i( msg || "No data found!!!" );
														return null;
													}
													return JSON.parse( data.ret_data_table );
												},
												get: function ( cfg ) {
													cfg = _xhr.getData( cfg );
													return _xhr.execute( {
														type: "GET",
														url: String.format( "{0}?def={0}&conf={1}&_s={2}", ( cfg.uri || "/app/api/crud/" ), encodeURIComponent( JSON.stringify( cfg.def ) ), encodeURIComponent( JSON.stringify( cfg.conf ) ), Math.floor( ( 0x90 + Math.random() ) * 0x10000000 ) ),
														cache: false, data: {}, dataType: 'json',
														async: true, contentType: "application/json",
													}, cfg.done, cfg.fail );
												},
												post: function ( cfg ) {
													cfg = _xhr.getData( cfg );
													return _xhr.execute( {
														type: "POST",
														url: String.format( "{0}?conf={1}&_s={2}", ( cfg.uri || "/app/api/crud/" ), encodeURIComponent( JSON.stringify( cfg.conf ) ), Math.floor( ( 0x90 + Math.random() ) * 0x10000000 ) ),
														cache: false, data: JSON.stringify( {
															def: cfg.def
														} ), dataType: 'json',
														async: true, contentType: "application/json",
													}, cfg.done, cfg.fail );
												},
											};
										} ),
										createDropdown: function ( arr ) {
											let out = '<option value="">Select...</option>';
											if ( !$.isArray( arr ) ) {
												if ( typeof ( arr ) === 'string' ) {
													arr = Sow.JSON( arr );
												} else {
													return out;
												}
											}
											
											for ( let i = 0, l = arr.length; i < l; i++ ) {
												let row = arr[i];
												out += '<option value="' + row.id + '">' + row.title + "</option>";
											}
											return out;

										},
										confirm: function ( cfg ) {
											if ( typeof ( cfg ) !== 'object' )
												throw new Error( "Invalid instance defined instead of Object" );
											$.confirm( {
												icon: cfg.icon || 'fa fa-warning',
												title: cfg.title || 'Confirm!',
												content: cfg.content || 'Are you sure to confirm!',
												buttons: {
													confirm: {
														btnClass: 'btn-blue',
														action: function () {
															let that = this;
															Sow.async( function () {
																cfg.confirm.call( _iWorker, that );
																cfg = that = undefined;
															}, 0 );
															return;
														},
													},
													cancel: {
														btnClass: 'btn-red',
														action: function () {
															let that = this;
															Sow.async( function () {
																cfg.cancel.call( _iWorker, that );
																cfg = that = undefined;
															}, 0 );
														}
													}
												},
												onContentReady: cfg.onContentReady || {}
											} );
										},
										prompt: function ( cfg ) {
											if ( typeof ( cfg ) !== 'object' )
												throw new Error( "Invalid instance defined instead of Object" );

											if ( cfg.content !== null && typeof ( cfg.content ) === 'object' ) {
												let marge = [];
												marge.push( `<form action="" class="formName">
													<div class="form-group">
														<label>{0}</label>
														<input type="{1}" placeholder="{2}" value="{3}" class="name form-control" style="color:black;" />
													</div>
												</form>`);
												cfg.content = String.format.apply( String, Array.prototype.slice.call( marge.concat( cfg.content ) ) );
											}
											$.confirm( {
												icon: cfg.icon || 'fa fa-question',
												title: cfg.title || 'Prompt!',
												content: cfg.content,
												buttons: {
													formSubmit: {
														text: 'Ok',
														btnClass: 'btn btn-blue',
														keys: ['enter'],
														action: function () {
															let $owner = this.$content.find( '.name' );
															let val = $owner.val();
															if ( cfg.required ) {
																if ( !val ) {
																	_iWorker.alert( {
																		content: typeof ( cfg.required ) === 'object' ? cfg.required.msg : 'provide a valid name.',
																		ok: function () {
																			$owner.select(); $owner.exit(); $owner = undefined;
																		}
																	} );
																	return false;
																}
															}
															$owner.exit(); $owner = undefined;
															cfg.ok.call( this, val );
															return;
														}
													},
													cancel: {
														btnClass: 'btn btn-red',
														keys: ['esc'],
														action: typeof ( cfg.cancel ) === 'function' ? cfg.cancel : function () {
															return;
														}
													}
												},
												onContentReady: function () {
													// bind to events
													var jc = this;
													this.$content.find( 'form' ).on( 'submit', function ( e ) {
														// if the user submits the form by pressing enter in the field.
														e.preventDefault();
														jc.$$formSubmit.trigger( 'click' ); // reference the button and click it
													} );
												}
											} );
										},
										alert: function ( cfg ) {
											$.confirm( {
												icon: cfg.icon || 'fa fa-exclamation-triangle',
												title: cfg.title || 'Alert!',
												content: cfg.content,
												buttons: {
													ok: {
														keys: ['enter'],
														action: typeof ( cfg.ok ) === 'function' ? cfg.ok : function () { }
													}
												}
											} );
										},
										clean: function ( $el ) {
											$el.not( $el.not( '[type="checkbox"]' ).each( function () {
												$( this ).val( "" ).parent().removeClass( "has-error" ).removeClass( "has-success" ).exit();
											} ) ).each( function () {
												$( this ).prop( 'checked', true ).parent().removeClass( "has-error" ).removeClass( "has-success" ).exit();
											} );
											return this;
										},
										getQuery: function ( route ) {
											let arr = String( route ).split( "?" );
											if ( arr === null )
												return { route: route, param: {} };
											if ( arr.length <= 0 )
												return { route: route, param: {} };
											let url = arr[0];
											let param = arr[1];
											if ( !param || param === null )
												return { route: route, param: {} };
											let lUri = String( param ).toLowerCase().split( '&' );
											let oUri = param.split( '&' );
											let i = lUri.length;
											let out = {
												route: url,
												orginal: route,
												param: {}
											};
											while ( i-- ) {
												if ( !lUri[i] ) continue;
												let col = lUri[i].split( '=' );
												if ( col.length <= 0 ) continue;
												let oCol = oUri[i].split( '=' );
												out.param[col[0]] = oCol[1];
											}
											return out;
										},
										getSearchObj: function ( $el, type ) {
											let out;
											if ( type === "array" ) {
												out = [];
												$el.not( $el.not( '[type="checkbox"]' ).each( function () {
													let $owner = $( this );
													let val = $owner.val();
													if ( val ) {
														out.push( {
															poperty: $owner.attr( 'data-field-key' ),
															value: val
														} );
													}
													$owner.exit(); $owner = undefined;
												} ) ).each( function () {
													let $owner = $( this );
													out.push( {
														poperty: $owner.attr( 'data-field-key' ),
														value: $owner.prop( 'checked' )
													} );
													$owner.exit(); $owner = undefined;
												} );
											} else {
												out = {};
												$el.not( $el.not( '[type="checkbox"]' ).each( function () {
													let $owner = $( this );
													let val = $owner.val();
													if ( val ) {
														out[$owner.attr( 'data-sql-field' )] = val;
													}
													$owner.exit(); $owner = undefined;
												} ) ).each( function () {
													let $owner = $( this );
													out[$owner.attr( 'data-sql-field' )] = $owner.prop( 'checked' );
													$owner.exit(); $owner = undefined;
												} );
											}
											return out;
										},
										populateMaster: function ( obj, $el) {
											$el.not( $el.not( '[type="checkbox"]' ).each( function () {
												let $inst = $( this );
												let val = obj[$inst.attr( 'data-field-key' )];
												$inst.val( !val || val === undefined ? "" : val ).exit();
												$inst = val = undefined;
											} ) ).each( function () {
												let $inst = $( this );
												let val = obj[$inst.attr( 'data-field-key' )];
												$inst.prop( 'checked', typeof ( val ) !== 'boolean' ? false : val ).exit();
												$inst = undefined;
											} );
											$el = undefined;
											return this;
										},
										event: {
											register: {
												detailEvent: function ( $elm ) {
													$( '[data-body-part="result"]', $elm ).on( 'click', function ( e ) {
														let $el = $( e.target );
														e.preventDefault();
														Sow.async( function () {
															let task = $el.attr( 'data-table-task' );
															if ( task === "__edit" ) {
																let route = $el.attr( 'data-table-val' );
																console.log( route );
																Sow.hook( "__web__page" ).fire( "__open__new", [{
																	dependency: undefined,
																	route: route,
																	done: function () { },
																	fail: function () { }
																}] );
															}
															$el.exit(); $el = undefined;
														} );
													} );
													$elm = undefined;
												}
											}
										},
										lockUnlockElm: function ( $elm, lock ) {
											lock === true ? $( '[data-field-key]', $elm ).attr( "disabled", "disabled" ) : $( '[data-field-key]', $elm ).removeAttr( "disabled" );
											return this;
										},
										validate: this.aggregate( function () {
											var validate_worker = {
												numeric: function ( value, inf ) {
													if ( inf.required ) {
														if ( !this.required( value ) )
															return false;
													}
													if ( value === null ) value = 0;
													if ( isNaN( value ) )
														return false;

													let val = parseFloat( value );

													if ( typeof ( inf.max ) === 'number' ) {
														if ( value.length > inf.max )
															return false;
													}
													if ( typeof ( inf.min ) === 'number' ) {
														if ( value.length < inf.min )
															return false;
													}
													return true;
												},
												required: function ( value ) {
													if ( value === null || value === "" )
														return false;
													if ( typeof ( value ) === 'undefined' )
														return false;
													return true;
												},
												url: function ( value, inf) {
													if ( inf.required )
														if ( !this.required( value ) )
															return false;
													try {
														let uri = new URL( value );
														if ( !uri.origin ) return false;
														let pattern = new RegExp( '^(https?:\\/\\/)?' + // protocol
															'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
															'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
															'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
															'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
															'(\\#[-a-z\\d_]*)?$', 'i' );
														if ( !pattern.test( value ) )
															return false;
														if ( /^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/.test( uri.hostname ) )
															return true;
														return false;
													} catch ( e ) {
														return false;
													}
												},
												text: function ( value, inf ) {
													if ( inf.required )
														if ( !this.required( value ) )
															return false;

													if ( value === null ) value = "";
													if ( typeof ( value ) !== 'string' )
														return false;

													if ( typeof ( inf.max ) === 'number' ) {
														if ( value.length > inf.max )
															return false;
													}
													if ( typeof ( inf.min ) === 'number' ) {
														if ( value.length < inf.min )
															return false;
													}
													if ( inf.required )
														if ( value === "" )
															return false;

													return true;
												},
												boolean: function (  value, inf ) {
													if ( inf.required ) {
														if ( !this.required( value ) )
															return false;
														if ( typeof ( value ) !== 'boolean' )
															return false;
														return true;
													}
													if ( value === null || typeof ( value ) === 'undefined' )
														return false;
													return true;
												},
												date: function ( value, inf) {
													if ( inf.required ) {
														if ( !this.required( value ) )
															return false;
														return true;
													}
													if ( value.length < 9 || value.length > 10 ) {
														return false;
													}
													if ( value.substring( 4, 5 ) !== '-' || value.substring( 7, 8 ) !== '-' ) {
														return false;
													} 
													let d = new Date( value );
													if ( d.toString() === "INVALID" ) return false;
													return true;
												},
												process: function ( val, $inst ) {
													let rules = $inst.attr( 'data-validation-rules' );
													if ( !rules ) {
														$inst.parent().removeClass( "has-error" ).addClass( "has-success" );
														return 0;
													}
													try {
														rules = JSON.parse( rules );
													} catch ( e ) {
														return 0;
													}
													if ( rules === null || typeof ( rules ) !== 'object' ) return 0;
													if ( rules.m === undefined ) return 0;

													if ( typeof ( this[rules.m] ) !== 'function' )
														throw new Error( "Invalid method defined ==>" + rules.m );
													let ret = 0;
													if ( !this[rules.m]( val, rules ) ) {
														$inst.parent().removeClass( "has-success" ).addClass( "has-error" );
														ret = -1;
													} else {
														$inst.parent().removeClass( "has-error" ).addClass( "has-success" );
													}
													return ret;
												}
											};
											return {
												all: function ( $el ) {
													let count = 0, out = {};
													$el.not( $el.not( '[type="checkbox"]' ).each( function () {
														let $inst = $( this );
														let val = $inst.val();
														count += validate_worker.process( val, $inst );
														if ( count >= 0 ) {
															out[$inst.attr( 'data-field-key' )] = val;
														}
														$inst.exit();
													} ) ).each( function () {
														let $inst = $( this );
														let val = $inst.prop( 'checked' );
														count += validate_worker.process( val, $inst );
														if ( count >= 0 ) {
															out[$inst.attr( 'data-field-key' )] = val;
														}
														$inst.exit();
													} );
													if ( count < 0 ) return null;
													return out;
												},
												keyup: function ( $el ) {
													return validate_worker.process( $el.val(), $el );
												},
												keyupAsync: function ( $el ) {
													Sow.async( function () {
														validate_worker.process( $el.val(), $el );
														$el.exit(); $el = undefined;
													} );
												}
											};
										} ),
									};
									return function ( route, $elm, __cb, isdialog ) {
										if ( !route )
											throw new Error( "Route required!!!" );
										let _query = _iWorker.getQuery( route );
										route = _query.route;
										typeof ( __cb ) !== 'function' ? __cb = function () { } : undefined;
										if ( !__pages[route] ) {
											__cb.call( this, "NOT_FOUND" );
											return this
										};
										if ( !( $elm instanceof $ ) )
											throw new Error( "Invalid instance defined instead of jQuery" );

										this.getTemplate( __pages[route].reg.template, function ( s, d ) {
											if ( s === 'ERROR' ) {
												__cb.call( this, "SCRIPT_ERROR" );
												throw new Error( d );
											}
											$elm.html( d ); d = undefined;
											
											let fields = this.render( __pages[route].fm, $elm );
											delete __pages[route].fm;
											var _pages = __pages[route];
											_pages.fm = fields; fields = undefined;
											if ( !_pages.reg.icon ) {

											}
											if ( isdialog ) {
												$( '[data-header-description="true"]', $elm ).remove();
												$( '.ui-dialog-title', $elm.parent() ).html( ( _pages.reg.icon || '<i class="fa fa-lg fa-fw fa-windows"></i>' ) + ' ' + _pages.reg.title );
											} else {
												let $frmdec = $( '[data-header-description="true"]', $elm );
												if ( $frmdec.length > 0 ) {
													if ( _pages.reg.icon ) {
														$frmdec.html( String.format( '<span style="padding: 10px; font-weight:700; font-size: 18px;">{0} <b data-form-title="true">{1}</b></span>', _pages.reg.icon, _pages.reg.title ) );
													} else {
														$frmdec.html( String.format( '<span style="padding: 10px; font-weight:700; font-size: 18px;"><i data-form-icon="true" class="fa fa-lg fa-fw fa-windows"></i> <b data-form-title="true">{0}</b></span>', _pages.reg.title ) );
													}
													$frmdec.exit();
												}
											}
											if ( !Sow.app_name ) {
												Sow.app_name = "Sow";
											}
											document.title = String.format( "{0} - {1}", _pages.reg.title, ( Sow.app_name ) );
											Object.extend( _pages, {
												getElem: function () {
													return $elm;
												},
												$waiter: function () {
													return $( '.page-loader-wrapper' );
												},
												postmortem: function () {
													Sow.Notify.hideAll();
													for ( let p in this ) {
														delete this[p];
													}
													if ( isdialog )
														$elm.remove();
													else
														$elm.children().remove();

													__cb.call( this, "EXITED" );
													_pages = route = isdialog = $elm = __cb = fn = undefined;
													return {};
												},
												getMap: function ( key ) {
													this[key] = {
														get $elm() {
															return $( '[data-field-key="' + key + '"]', $elm );
														},
														get value() {
															return this.$elm.val();
														},
														set value( val ) {
															this.$elm.val( val );
														}
													};
												},
												elements: {},
												source: {
													param: [],
													map: {}
												},
												_: {
													event: {
														fire: function ( name ) {
															return function ( e ) {
																e.preventDefault();
																let prop = $( this ).attr( 'data-field-key' );
																if ( !prop ) return;
																if ( !_pages.fm[prop] ) return;
																let ev = _pages.fm[prop].event;
																if ( typeof ( ev ) !== 'object' ) return;
																if ( typeof ( ev[name] ) !== 'function' ) return;
																Sow.async( function () {
																	ev[name].call( _pages.elements, _pages.require, e );
																	ev = undefined;
																}, 0 );
																return;
															};
														}
													}
												}
											} );
											
											Object.extend( _pages, {
												lockUnlockElm: function ( lock ) {
													_iWorker.lockUnlockElm( $elm, lock );
													return this;
												},
												prompt: function ( cfg ) {
													if ( typeof ( cfg ) !== 'object' )
														throw new Error( "Invalid instance defined instead of Object" );
													let pcb = {};
													Object.extend( pcb, {
														ok: typeof ( cfg.ok ) !== 'function' ? function () { } : cfg.ok,
														cancel: typeof ( cfg.cancel ) !== 'function' ? function () { } : cfg.cancel
													} );

													cfg.ok = function ( a ) {
														pcb.ok.call( _pages, a, this ); cfg = pcb = undefined;
													};
													cfg.cancel = function ( a ) {
														pcb.cancel.call( _pages, a, this ); cfg = pcb = undefined;
													};
													_iWorker.prompt( cfg );
												},
												confirm: function ( cfg ) {
													if ( typeof ( cfg ) !== 'object' )
														throw new Error( "Invalid instance defined instead of Object" );
													_iWorker.confirm( {
														content: cfg.content,
														title: cfg.title,
														confirm: function (inst) {
															cfg.confirm.call( _pages, inst );
															//this.reg.info.primary_key.value = undefined;
															return;
														}, cancel: function ( inst) {
															cfg.cancel.call( _pages, "ERROR", inst );
														},
														onContentReady: cfg.onContentReady
													} );
												},
												validate: function ( $arg ) {
													if ( $arg instanceof $ ) {
														return _iWorker.validate.all( $arg );
													}
													return _iWorker.validate.all( $( '[data-field-key]', $elm ) );
												},
												validateKeyup: function ( $arg, async ) {
													if ( !( $arg instanceof $ ) )
														throw new Error( "Argument should be jQuery instance!!!" );
													return async === true ? _iWorker.validate.keyupAsync( $arg ) : _iWorker.validate.keyup( $arg );
												},
												createDropDown: function (obj) {
													return _iWorker.createDropdown( obj );
												},
												xhr: function ( cfg ) {
													cfg.done = typeof ( cfg.done ) !== 'function' ? function () { } : cfg.done;
													cfg.fail = typeof ( cfg.fail ) !== 'function' ? function () { } : cfg.fail;
													_iWorker.xhr.post( {
														uri: cfg.uri,
														def: cfg.def,
														conf: {
															sp: cfg.sp,
															validate: cfg.validate,
															module: cfg.module,
														},
														done: function ( data ) {
															if ( cfg.data_required === false ) {
																if ( data.ret_val < 0 ) {
																	cfg.fail.call( _pages, data );
																	return;
																}
																cfg.done.call( _pages, data );
																return;
															}
															data = _iWorker.xhr.isValid( data );
															if ( data === null ) {
																cfg.fail.call( _pages, data );
																return;
															}
															if ( data.length <= 0 ) {
																cfg.fail.call( _pages, data );
																return;
															}
															cfg.done.call( _pages, data );
														},
														fail: function () {
															cfg.fail.call( _pages, "ERROR" );
														},
													} );
													return this;
												},
												populateDetail: function ( data, cb ) {
													let tname = this.reg.info.search_detail.template;
													Sow.async( function () {
														let rfn = {
															fn: function ( resp ) {
																let $owner = $( '[data-body-part="result"]', $elm );
																$owner.children().remove();
																$owner.html( resp );
																$owner.exit();
																$owner = undefined;
																if ( typeof ( _pages.reg.info.search_detail.onRender ) === 'function' )
																	_pages.reg.info.search_detail.onRender.call( _pages, _pages.require );

																typeof ( cb ) === 'function' ? cb.call( _pages ) : undefined;
															},
															run: function () {
																this.run( tname, Object.extend( {
																	data: data
																}, _pages.reg.info.search_detail ), rfn.fn )
															}
														};
														if ( this.Web.Template.script.has( tname ) ) {
															rfn.run.call( this.Web.Template.script );
														} else {
															let url = "";
															if ( tname === "SRC__DEFAULT__" ) {
																url = "/web/form/template/src_detail_table.tmpl";
															} else {
																url = tname;
															}
															$.ajax( {
																type: "GET",
																url: String.format( "{0}?_s={1}", url, Math.floor( ( 0x90 + Math.random() ) * 0x10000000 ) ),
																cache: false, dataType: 'text', async: true,
															} ).done( function ( data ) {
																Sow.Web.Template.script.parse( tname, data, function () {
																	rfn.run.call( this );
																} );
															} ).fail( function ( data ) {
																typeof ( cb ) === 'function' ? cb.call( _pages ) : undefined;
															} );
														}
													} );
													return;
												},
												onSearch: function ( data, cb ) {
													if ( this.reg.info.has_master ) {
														let row = data[0];
														_iWorker.populateMaster( row, $( '[data-field-key]', $elm ) );
														this.reg.info.primary_key.value = row[this.reg.info.primary_key.id];
													}
													$( '[data-change-elm]', $elm ).removeClass( 'disabled' );
													if ( this.reg.info.search_detail.show === true ) {
														this.populateDetail( data, cb );
														return;
													}
													typeof ( cb ) === 'function' ? cb.call( _pages ) : undefined;
													return;
												}
											} );
											Object.extend( _pages, {
												print: function ( cb ) {
													if ( !this.reg.info.primary_key.value ) {
														console.log( "Unable to print this document!!!" );
														cb.call( this, "ERROR" );
														return;
													}
													_iWorker.confirm( {
														content: String.format( 'Are you sure to Print <b style="font-size:14px">{0}</b> ?', this.reg.info.primary_key.value ),
														confirm: function () {
															cb.call( _pages, "SUCCESS", _pages.reg.info.primary_key.value );
															//this.reg.info.primary_key.value = undefined;
															return;
														}, cancel: function () {
															cb.call( _pages, "ERROR" );
														}
													} );
												},
												delete: function ( cb ) {
													if ( !this.reg.info.primary_key.value ) {
														Sow.Show.i( "Unable to delete this document!!!" );
														cb.call( this, "ERROR" );
														return;
													}
													_iWorker.confirm( {
														content: String.format( 'Are you sure to Delete <b style="font-size:14px">{0}</b> ?', this.reg.info.primary_key.value ),
														confirm: function () {
															cb.call( _pages, "SUCCESS", _pages.reg.info.primary_key.value );
															//this.reg.info.primary_key.value = undefined;
															return;
														}, cancel: function () {
															cb.call( _pages, "ERROR" );
														}
													} );
												},
												clean: function ( cb ) {
													this.reg.info.primary_key.value = 0;
													$( '[data-change-elm]', $elm ).addClass( 'disabled' );
													_iWorker.clean( $( '[data-field-key]', $elm ) );
													$( '[data-body-part="result"]', $elm ).children().remove().exit();
													typeof ( cb ) === 'function' ? cb.call( this, "SUCCESS" ) : undefined;
													return this;
												},
											
												save: function ( cb ) {
													let hasEvent = false;
													if ( typeof ( this.reg.toolbar.save ) === 'object' && typeof ( this.reg.toolbar.save.before ) === 'function' ) {
														hasEvent = true;
													}
													let formobj = _iWorker.validate.all( $( '[data-field-key]', $elm ) );
													if ( formobj === null ) {
														Sow.Show.e( "Required field should not left blank!!" );
														cb.call( this, "ERROR" );
														return;
													}
													if ( hasEvent ) {
														this.reg.toolbar.save.before.call( this, formobj );
													}
													formobj[this.reg.info.primary_key.id] = this.reg.info.primary_key.value;
													let isUpdate = false;
													if ( this.reg.info.primary_key.value ) {
														isUpdate = true;
													}
													_iWorker.confirm( {
														content: 'Are you sure to Save this document ?',
														confirm: function () {
															$( '.page-loader-wrapper' ).fadeIn( 'slow' );
															_iWorker.xhr.post( {
																def: {
																	master: formobj
																},
																conf: _pages.cmd.iu,
																done: function ( data ) {
																	$( '.page-loader-wrapper' ).fadeOut( "solow" );
																	if ( data.ret_val < 0 ) {
																		Sow.Show.e( data.ret_msg || "Error" );
																		cb.call( _pages, "ERROR" ); return;
																	}
																	Sow.Show.s( "Data has been Saved." );
																	_pages.reg.toolbar.save.after.call( _pages, data );
																	if ( !isUpdate ) {
																		_pages.clean();
																	}
																	cb.call( _pages, "SUCCESS" ); return;
																},
																fail: function ( xhr, status, message ) {
																	$( '.page-loader-wrapper' ).fadeOut( "solow" );
																	Sow.Show.e( message || "Error" );
																	cb.call( _iWorker, "ERROR" ); return;
																},
															} );
															formobj = undefined;
															return;
														}, cancel: function () {
															formobj = undefined;
															cb.call( this, "ERROR" );
														}
													} );
												},
												search: function ( cb, obj ) {
													let def = {};
													if ( _pages.cmd.s.type === "SQL" ) {
														if ( !_pages.cmd.s.sql )
															throw new Error( "No select statement found!!!" );
														if ( typeof ( obj ) !== 'object' ) {
															obj = _iWorker.getSearchObj( $( '[data-sql-field][data-search="true"]', $elm ) );
														}
														let where = ""; let isFirst = true;
														for ( let p in obj ) {
															if ( isFirst ) {
																where += " where ";
																where += p + "='" + obj[p] + "' "; isFirst = false;
															} else {
																where += "and " + p + "='" + obj[p] + "' ";
															}
														}
														let sql = String.format( _pages.cmd.s.sql, where );
														sql = sql.trim();
														where = obj = undefined;
														def = {
															sql: sql,
															table: _pages.cmd.s.table,
															schema: _pages.cmd.s.schema,
														};
													} else {
														def = {
															param: _iWorker.getSearchObj( $( '[data-field-key][data-search="true"]', $elm ), "array" )
														};
													}
													let $owner = $( '[data-body-part="result"] table tbody', $elm );
													$owner.remove();
													_iWorker.xhr.post( {
														def: def,
														conf: {
															sp: _pages.cmd.s.sp,
															validate: _pages.cmd.s.validate,
															module: _pages.cmd.s.module,
														},
														done: function ( data ) {
															data = _iWorker.xhr.isValid( data );
															if ( data === null ) {
																cb.call( _pages, "ERROR" );
																return;
															}
															if ( data.length <= 0 ) {
																Sow.Show.i( "No data found!!!" );
																cb.call( _pages, "ERROR" );
																return;
															}
															//Sow.Show.s( "Command execution!!!" );
															if ( typeof ( _pages.onSearch ) === 'function' ) {
																_pages.onSearch( data, function () {
																	cb.call( _pages, "SUCCESS" );
																	cb = undefined;
																} );
															} else {
																cb.call( _pages, "SUCCESS" );
																cb = undefined;
															}
															data = undefined;
														},
														fail: function () {
															cb.call( _pages, "SUCCESS" );
														},
													} );
													sql = undefined;
													return this;
												},
												loadDropDown: function ( cb ) {
													_iWorker.xhr.post( {
														def: {
															list: _pages.source.param
														},
														conf: _pages.cmd.__dd,
														done: function ( data ) {
															data = _iWorker.xhr.isValid( data );
															if ( data === null || data.length <= 0 ) {
																cb.call( _pages, "SUCCESS" );
																return;
															}
															Sow.async( function () {
																let obj = data[0]; data = undefined;
																for ( let p in obj ) {
																	let options = _iWorker.createDropdown( obj[p] );

																	let owners = _pages.source.map[p];
																	for ( let i = 0, l = owners.length; i < l; i++ ) {
																		let row = owners[i];
																		if ( _pages.elements[row.owner] ) {
																			if ( row.add_new ) {
																				_pages.elements[row.owner].$elm.html( options + '<option value="-11" data-option-add-new="' + row.add_new + '" style="color:red;font-weight:bold;">Add new</option>' );
																				continue;
																			}
																			_pages.elements[row.owner].$elm.html( options );
																			continue;
																		}
																		if ( row.add_new ) {
																			$( '[data-field-key="' + row.owner + '"]', $elm ).html( options + '<option value="-11" data-option-add-new="' + row.add_new + '" style="color:red;font-weight:bold;>Add new</option>' );
																			continue;
																		}
																		$( '[data-field-key="' + row.owner + '"]', $elm ).html( options );

																	}
																}
																cb.call( _pages, "SUCCESS" );
															} );
															return;
														},
														fail: function () {
															cb.call( _pages, "SUCCESS" );
														},
													} );
												},
											} );
											for ( let p in _pages.fm ) {
												//_pages.getMap.call( _pages.elements, p );
												let inf = _pages.fm[p];
												if ( inf.t !== 'dropdown' ) continue;
												if ( inf.source === "OWN" ) continue;
												if ( typeof ( inf.source ) !== 'object' )
													throw new Error( String.format( "Invalid source type defined instead of Object for ==>{0}", inf.name ) );

												_pages.source.param.push( inf.source );
												if ( _pages.source.map[inf.source.poperty] ) {
													_pages.source.map[inf.source.poperty].push( {
														add_new: inf.source.add_new,
														owner: inf.name
													} );
												} else {
													_pages.source.map[inf.source.poperty] = [{
														add_new: inf.source.add_new,
														owner: inf.name
													}];
												}
											}
											$( '[data-field-key]', $elm ).not( '[data-not-include]' ).each( function () {
												_pages.getMap.call( _pages.elements, $( this ).attr("data-field-key") );
											} );
											$( 'select', $elm ).not('[data-not-include]').on( "change", function ( e ) {
												if ( this.value === "-11" ) {
													e.stopPropagation();
													e.preventDefault();
													$( this ).val( "" );
													let url = $( '[value="-11"]', this ).attr( "data-option-add-new" );
													if ( !url ) return;
													Sow.async( function () {
														Sow.hook( "__web__page" ).fire( "__open__new", [{
															dependency: _pages.reg.route,
															route: url,
															done: function () { },
															fail: function () { }
														}] );
													} );
													return;
												}
											} );
											if ( $.isArray( _pages.reg.event_arry ) ) {
												for ( let i = 0, l = _pages.reg.event_arry.length; i < l; i++ ) {
													let name = _pages.reg.event_arry[i];
													if ( 'undefined' === typeof ( name ) )
														throw new Error( 'Invalid event name defined!!!' );
													let fn = _pages._.event.fire( name );
													$( '[data-event-' + name + ']input', $elm ).on( name, fn );
													$( '[data-event-' + name + ']select', $elm ).on( name, fn );
													fn = name = undefined;
												}
											}
											$( '[data-validation-rules]select', $elm ).on( "change", function ( e ) {
												_iWorker.validate.keyupAsync( $( this ) );
											} );
											$( '[data-validation-rules]', $elm ).not('select').on( "input", function ( e ) {
												_iWorker.validate.keyupAsync( $( this ) );
											} );

											$( '[data-switch="true"]', $elm ).on( 'click', function ( e ) {
												let $input = $( this ).parent().parent().find( 'input' );
												let val = $input.prop( 'checked' );
												$input.prop( 'checked', ( val === true ? false : true ) );
												$input.exit(); $input = undefined;
											} );
											Object.extend( _pages, {
												require: function ( fn ) {
													if ( typeof ( fn ) !== 'function' )
														throw new Error( "Invalid instance defined instead of Function" );
													fn.call( _pages );
													return this;
												}
											} );
											if ( _pages.reg.info.search_detail.show ) {
												if ( typeof ( _pages.reg.info.search_detail.detail_event ) === 'object' ) {
													if ( typeof ( _pages.reg.info.search_detail.detail_event.on_page_ready ) === 'function' ) {
														_pages.reg.info.search_detail.detail_event.on_page_ready.call( _pages, $elm, _pages.require );
													}
												} else {
													if ( _pages.reg.info.search_detail.detail_event !== false ) {
														_iWorker.event.register.detailEvent( $elm );
													}
												}
											}
											if ( _pages.reg.toolbar ) {
												if ( _pages.reg.toolbar.disabled === true ) {
													$( ".__tools a", $elm ).addClass( "disabled" );
												} else {
													if ( typeof ( _pages.reg.toolbar.buttons ) === 'object' ) {
														$( ".__tools [data-name]", $elm ).each( function () {
															let $towner = $( this );
															let nm = $towner.attr( "data-name" );
															if ( _pages.reg.toolbar.buttons.indexOf( nm ) <= -1 )
																$towner.remove();
															$towner.exit(); $towner = undefined;
														} );
													}
													if ( typeof ( _pages.reg.toolbar.enabled ) === 'object' ) {
														$( ".__tools [data-name]", $elm ).each( function () {
															let $towner = $( this );
															let nm = $towner.attr( "data-name" );
															if ( _pages.reg.toolbar.enabled.indexOf( nm ) <= -1 ) {
																$towner.removeAttr( "data-name" );
																$towner.attr( "disabled", "disabled" ).addClass("disabled");
															}
															$towner.exit(); $towner = undefined;
														} );
														delete _pages.reg.toolbar.enabled;
													}
													$( ".__tools", $elm ).on( "click", function ( e ) {
														Sow.Show.h();
														let $owner = $( e.target );
														let task = $owner.attr( 'data-name' );
														if ( !task ) return;
														if ( typeof ( _pages[task] ) !== 'function' ) return;
														Sow.async( function () {
															$owner.attr( "disabled", "disabled" );
															_pages[task]( function ( s, v ) {
																$owner.removeAttr( "disabled" );
															} );
														} );
													} );
												}
												$( '[data-date-field]', $elm ).datepicker( {
													dateFormat: 'yy-mm-dd',
													prevText: '<i class="fa fa-chevron-left"></i>',
													nextText: '<i class="fa fa-chevron-right"></i>',
												} ).not('[data-default-value="false"]').val( Sow.date.get() );

												if ( _pages.reg.toolbar.reload ) {
													if ( typeof ( _pages.reg.toolbar.reload ) !== 'function' ) {
														_pages.reg.toolbar.reload = function ( cb ) {
															_pages.loadDropDown( function () {
																cb.call( this );
															} );
														};
													}
													$( '[data-name="reload_drop_down"]', $( '[data-name="frm_ext_info"]', $elm ).append( '<a href="javascript:void(0)" data-name="reload_drop_down" title="Reload" class="btn glyphicon glyphicon-refresh"></a>' ) ).on( 'click', function ( e ) {
														e.preventDefault(); let $owner = $( this );
														$owner.attr( "disabled", "disabled" );
														_pages.reg.toolbar.reload.call( _pages, function () {
															$owner.removeAttr( "disabled" ); $owner.exit();
															$owner = undefined;
														} );
													} );
												}
												
											} else {
												//$( ".__tools", $elm ).remove();
												$( ".__tools", $elm ).parent().remove();
											}
											if ( _pages.source.param.length > 0 ) {
												_pages.loadDropDown( function () {
													__pages[route].onRender( _pages.require, _query );
													if ( typeof ( __pages[route].customEvent ) === 'function' )
														__pages[route].customEvent( _pages.require );
													if ( _query.param[_pages.reg.info.primary_key.id] ) {
														_pages.search( function () {
															__cb.call( this, "LOADED" );
														}, _query.param );
													} else {
														__cb.call( this, "LOADED" );
													}
												} );
												return this;
											}
											__pages[route].onRender( _pages.require, _query );
											if ( typeof ( __pages[route].customEvent ) === 'function' )
												__pages[route].customEvent( _pages.require );

											if ( _query.param[_pages.reg.info.primary_key.id] ) {
												_pages.search( function () {
													__cb.call( this, "LOADED" );
												}, _query.param );
											} else {
												__cb.call( this, "LOADED" );
											}
											return this;
										} );
										return this;
									}
								}),
								dispose: function ( route, cb ) {
									if ( !__pages[route] ) {
										typeof ( cb ) === 'function' ? cb.call( this, "DONE" ) : undefined;
										return this;
									}
									let page = __pages[route];
									if ( $.isArray( page.ajax ) ) {
										let ajax = page.ajax;
										for ( let p in ajax ) {
											if ( ajax[x] && "function" === typeof ( ajax[x].abort ) ) {
												ajax[x].abort();
											}
										}
										delete __pages[route].ajax;
									}
									if ( typeof ( page.data_map ) === 'object' ) {
										delete __pages[route].data_map;
									}
									if ( typeof ( page.onDispose ) === 'function' ) {
										page.onDispose();
									}
									Sow.hook.remove( page.reg.key );
									if ( typeof ( page.postmortem ) === 'function' )
										page.postmortem();
									page = undefined;
									delete __pages[route];
									if ( $.isArray( __dependency[route] ) ) {
										for ( let i = 0, l = __dependency[route].length; i < l; i++ ) {
											this.dispose( __dependency[route][i] );
										}
									}
									typeof ( cb ) === 'function' ? cb.call( this, "DONE" ) : undefined;
									return this;
								}
							};
						}, function () {
							var __worker = {
								prepare: function ( o, a, b ) {
									if ( 'object' !== typeof ( o ) )
										throw new Error( "Invalid instance defined instead of Object" );
									let p = Object.keys( o )[0];
									if ( 'undefined' === typeof ( p ) )
										throw new Error( "No poperty key defined in Object" );
									let info = o[p];
									info.name = p;
									if ( !b ) {
										a.push( info );
										return {
											p: p,
											v: info
										};
									}
									if ( info.tab === "" || info.tab === null || !info.tab ) {
										a.push( info );
										return {
											p: p,
											v: info
										};
									}
									b.push( info );
									return {
										p: p,
										v: info
									};
								},
								instanceOf: function ( $inst ) {
									return $inst instanceof $;
								},
								render: this.aggregate( function () {
									var p_worker = {
										getEventAttr: function ( events ) {
											if ( !$.isPlainObject( events ) ) return "";
											let attr = "";
											for ( let p in events ) {
												attr += 'data-event-' + p + '="true" ';
											}
											return attr;
										},
										html: function ( info ) {
											return ( String.format( `
											<div class="col-sm-{0}">
												{1}
											</div>`, info.w, info.html ) );

										},
										switch: function ( info ) {
											let event_attr = this.getEventAttr( info.event );
											return ( String.format( `<div class="col-sm-{0}">
												<div class="form-group has-feedback{1}">
													<label for="{3}">{4}:</label><br/>
													<span class="onoffswitch">
														<input type="checkbox" checked="checked"{2}{9} class="onoffswitch-checkbox" data-field-key="{3}" {5} {6} {7}{8}/>
														<label class="onoffswitch-label" for="{2}">
															<span class="onoffswitch-inner" data-switch="true" data-swchon-text="ON" data-swchoff-text="OFF">
															</span><span class="onoffswitch-switch"></span>
														</label>
													 </span>
												</div>
											</div>`, /*0*/info.w,
											/*1*/( info.disabled === true ? 'disabled' : '' ),
											/*2*/( info.disabled === true ? ' disabled="disabled"' : '' ),
											/*3*/info.name,
											/*4*/info.title,
											/*5*/( info.attr || "" ),
											/*6*/( info.src === true ? ' data-search="true"' : "" ),
											/*7*/event_attr,
											/*8*/( typeof ( info.rules ) === 'object' ? " data-validation-rules='" + JSON.stringify( info.rules ) + "'" : "" ),
											/*9*/info.sql ? ' data-sql-field="' + ( info.sql === "O" ? info.name : info.sql ) + '"' : ""
											) );
										},
										input: function ( info ) {
											let event_attr = this.getEventAttr( info.event );
											//
											return ( String.format( `
											<div class="col-sm-{0}">
												<div class="form-group has-feedback{1}">
													<label for="{3}">{4}:</label>
													<input type="text" data-field-key="{3}"{2}{10} class="form-control" placeholder="{5}" {6} {7} {8}{9}/>
													<span class="form-control-feedback" aria-hidden="true"></span>
												</div>
											</div>`, /*0*/info.w,
												/*1*/( info.disabled === true || info.read_only === true ? ' disabled' : '' ),
												/*2*/( info.disabled === true ? ' disabled="disabled"' : ( info.read_only === true?'readonly="true"':"") ),
												/*3*/info.name,
												/*4*/info.title,
												/*5*/( info.p || "" ),
												/*6*/( info.attr || "" ),
												/*7*/( info.src === true ? ' data-search="true"' : "" ),
												/*8*/event_attr,
												/*9*/( typeof ( info.rules ) === 'object' ? " data-validation-rules='" + JSON.stringify( info.rules ) + "'" : "" ),
												/*10*/info.sql ? ' data-sql-field="' + ( info.sql === "O" ? info.name : info.sql ) + '"' : ""
											) );
										},
										date: function ( info ) {
											let event_attr = this.getEventAttr( info.event );
											return ( String.format( `
												<div class="col-sm-{0}">
													<div class="form-group has-feedback{1}">
														<label for="{3}">{4}:</label>
														<input type="text" data-field-key="{3}"{2}{9}{10} class="form-control" placeholder="{5}" data-date-field="true"{6} {7}{8}/>
														<span class="form-control-feedback" aria-hidden="true"></span>
													</div>
												</div>`, /*0*/info.w,
												/*1*/( info.disabled === true ? 'disabled' : '' ),
												/*2*/( info.disabled === true ? ' disabled="disabled"' : '' ),
												/*3*/info.name,
												/*4*/info.title,
												/*5*/info.p,
												/*6*/( info.src === true ? ' data-search="true"' : "" ),
												/*7*/event_attr,
												/*8*/( typeof ( info.rules ) === 'object' ? " data-validation-rules='" + JSON.stringify( info.rules ) + "'" : "" ),
												/*10*/info.sql ? ' data-sql-field="' + ( info.sql === "O" ? info.name : info.sql ) + '"' : "",
												/*11*/info.default_value === false ? ' data-default-value="false"':""
											) );
										},
										dropdown: function ( info ) {
											let drop = "";
											if ( info.data ) {
												for ( let x = 0, l = info.data.length; x < l; x++ ) {
													let row = info.data[x];
													for ( let p in row ) {
														let val = row[p];
														if ( row.selected ) {
															drop += String.format( '<option value="{0}" selected="selected">{1}</option>', p, row[p] );
															break;
														}
														drop += String.format( '<option value="{0}">{1}</option>', p, row[p] ); break;
													}
												}
											}
											let event_attr = this.getEventAttr( info.event );
											return ( String.format( `
												<div class="col-sm-{0}">
													<div class="form-group has-feedback{1}">
														<label for="{3}">{4}:</label>
														<select class="form-control"{2} data-toggle="tooltip" data-field-key="{3}" {5}{6} {7}{9}{10}>
															<option value="">Select...</option>
															{8}
														</select>
													</div>
												</div>`, /*0*/info.w,
												/*1*/( info.disabled === true ? 'disabled' : '' ),
												/*2*/( info.disabled === true ? ' disabled="disabled"' : '' ),
												/*3*/info.name,
												/*4*/info.title,
												/*5*/( info.attr || "" ),
												/*6*/( info.src === true ? ' data-search="true"' : "" ),
												/*7*/event_attr,
												/*8*/drop,
												/*9*/( typeof ( info.rules ) === 'object' ? " data-validation-rules='" + JSON.stringify( info.rules ) + "'" : "" ),
												/*10*/info.sql ? ' data-sql-field="' + ( info.sql === "O" ? info.name : info.sql ) + '"' : ""
											) );
										},
										textarea: function ( info ) {
											let event_attr = this.getEventAttr( info.event );
											return ( String.format( `
												<div class="col-sm-{0}">
													<div class="form-group has-feedback{1}">
														<label for="{3}">{4}:</label>
														<textarea {2}style="height: 75px; border:solid 1px #428bca" class="form-control" rows="10"  data-field-key="{3}" placeholder="{5}" {6} {7}{8}{9}></textarea>
														<span class="form-control-feedback" aria-hidden="true"></span>
													</div>
												</div>`,/*0*/info.w,
												/*1*/( info.disabled === true ? 'disabled' : '' ),
												/*2*/( info.disabled === true ? ' disabled="disabled"' : '' ),
												/*3*/info.name,
												/*4*/info.title,
												/*5*/info.p,
												/*6*/( info.src === true ? ' data-search="true"' : "" ),
												/*7*/event_attr,
												/*8*/( typeof ( info.rules ) === 'object' ? " data-validation-rules='" + JSON.stringify( info.rules ) + "'" : "" ),
												/*10*/info.sql ? ' data-sql-field="' + ( info.sql === "O" ? info.name : info.sql ) + '"' : ""
											) );
										},
										writeNav: function ( $tab, $container, tArr, cObj ) {
											let nav = "", content = "";
											if ( typeof ( cObj ) !== 'object' ) {
												cObj = {};
											}
											for ( let x in tArr ) {
												if ( !tArr[x] ) {
													throw new Error( String.format( "Invalid tab defined ==>{0}", x ) );
												}
												if ( cObj[x] ) {
													content += '<div id="' + x + '" class="tab-pane ' + ( content === "" ? "fade in active" : "" ) + '">' + cObj[x].html + "</div>";
												}
												nav += String.format( '<li{0}><a data-toggle="tab" href="#{1}">{2}</a></li>', ( nav == "" ? ' class="active"' : "" ), x, tArr[x] );
											}
											$tab.html( nav );
											$container.html( content );
											$tab = $container = nav = content = tArr = cObj = undefined;
											return;
										},
									};
									return {
										tab: this.aggregate( function () {
											var getHtml = function ( arr ) {
												let out = {}, count = 0;
												let ptab = "";
												for ( let i = 0, l = arr.length; i < l; i++ ) {
													//let p = Object.keys( params[i] )[0];
													let info = arr[i];
													//if ( !info.tab ) continue;
													if ( !out[info.tab] ) {
														if ( ptab ) {
															if ( out[ptab].r > 0 ) {
																out[ptab].html += ( "</div>" );
																out[ptab].r = 0; ptab = undefined;
															}
														}
														out[info.tab] = {
															html: "",
															r: 0
														};
														ptab = info.tab;
													}
													//info.name = p;
													if ( out[info.tab].r === 0 ) {
														out[info.tab].html += ( '<div class="row">' );
													}
													if ( typeof ( info.w ) !== 'number' ) {
														info.w = 2;
													}
													out[info.tab].r += info.w;
													if ( typeof ( p_worker[info.t] ) !== 'function' )
														throw new Error( String.format( "Invalid method defined==>{0}", info.t ) );

													out[info.tab].html += p_worker[info.t]( info );

													if ( out[info.tab].r >= 12 ) {
														if ( out[info.tab].r > 12 )
															throw new Error( String.format( "Row should not getter than 12 in tab ==>{0}", info.tab ) );

														out[info.tab].html += ( "</div>" );
														out[info.tab].r = 0;// ptab = undefined;
													}
												}
												arr = undefined;
												return out;
											};
											return {
												header: function ( header, tabHeaderArr, $tab, $container ) {

													if ( !$.isPlainObject( header ) )
														throw new Error( '"this header" is not instanceof Object' );
													if ( !$.isArray( tabHeaderArr ) )
														throw new Error( '"this tabHeaderArr" is not instanceof Array' );

													if ( !__worker.instanceOf( $tab ) )
														throw new Error( '"this $tab" is not instanceof jQuery' );

													if ( !__worker.instanceOf( $container ) )
														throw new Error( '"this $container" is not instanceof jQuery' );

													if ( tabHeaderArr.length <= 0 ) {
														$tab.addClass( "hide" ); $container.addClass( "hide" )
													} else {
														p_worker.writeNav( $tab, $container, header, getHtml( tabHeaderArr ) );
													}
													tabHeaderArr = header = $tab = $container = undefined;
													return this;
												},
												footer: function ( footer, tabFooterArr, $tab, $container ) {
													if ( !$.isPlainObject( footer ) )
														throw new Error( '"this header" is not instanceof Object' );
													if ( !$.isArray( tabFooterArr ) )
														throw new Error( '"this tabFooterArr" is not instanceof Array' );

													if ( !__worker.instanceOf( $tab ) )
														throw new Error( '"this $tab" is not instanceof jQuery' );
													if ( !__worker.instanceOf( $container ) )
														throw new Error( '"this $container" is not instanceof jQuery' );
													if ( tabFooterArr.length <= 0 ) {
														$tab.addClass( "hide" ); $container.addClass( "hide" )
													} else {
														p_worker.writeNav( $tab, $container, footer, getHtml( tabFooterArr ) );
													}
													tabFooterArr = footer = $tab = $container = undefined;
													return __worker;
												}
											};
										} ),
										body: this.aggregate( function () {
											var getHtml = function ( arr ) {
												let out = {
													html: "",
													r: 0
												}, count = 0;
												for ( let i = 0, l = arr.length; i < l; i++ ) {
													let info = arr[i];

													if ( out.r === 0 ) {
														out.html += ( '<div class="row">\r\n' );
													}
													if ( typeof ( info.w ) !== 'number' ) {
														info.w = 2;
													}
													out.r += info.w;
													if ( typeof ( p_worker[info.t] ) !== 'function' )
														throw new Error( String.format( "Invalid method defined==>{0}", info.t ) );

													out.html += p_worker[info.t]( info );

													if ( out.r >= 12 ) {
														if ( out.r > 12 )
															throw new Error( String.format( "Row should not getter than 12 in row ==>{0}", ( i + 1 ) ) );
														out.html += ( "\r\n</div>\r\n" );
														out.r = 0;// ptab = undefined;
													}
												}
												arr = undefined;
												return out.html;
											};
											return {
												header: function ( headerArr, $container ) {
													if ( !$.isArray( headerArr ) )
														throw new Error( '"this headerArr" is not instanceof Array' );

													if ( !__worker.instanceOf( $container ) )
														throw new Error( '"this $container" is not instanceof jQuery' );
													if ( headerArr.length <= 0 ) {
														$container.addClass( "hide" );
													} else {
														$container.html( getHtml( headerArr ) );
													}
													headerArr = $container = undefined;
													return this;
												},
												footer: function ( footerArr, $container ) {
													if ( !$.isArray( footerArr ) )
														throw new Error( '"this headerArr" is not instanceof Array' );
													if ( !__worker.instanceOf( $container ) )
														throw new Error( '"this $container" is not instanceof jQuery' );
													if ( footerArr.length <= 0 ) {
														$container.addClass( "hide" );
													} else {
														$container.html( getHtml( footerArr ) );
													}
													footerArr = $container = undefined;
													return __worker;
												}
											}
										} )
									}
								} )
							};
							return {
								render: function ( fm, $elm ) {
									if ( !__worker.instanceOf( $elm ) )
										throw new Error( "Invalid jQuery instance defined!!!" );

									if ( !$.isPlainObject( fm ) )
										throw new Error( "Invalid Object instance defined!!!" );

									let fields = {};
									let _tabHeaderArr = [], _tabFooterArr = [], _bodyHeaderArr = [], _bodyFooterArr = [];
									fm.header.find( function ( o ) {
										let resp = __worker.prepare( o, _bodyHeaderArr, _tabHeaderArr );
										fields[resp.p] = resp.v;
										return false;
									} );
									fm.footer.find( function ( o ) {
										let resp = __worker.prepare( o, _bodyFooterArr, _tabFooterArr );
										fields[resp.p] = resp.v;
										return false;
									} );
									( function () {
										let $inst = $( '[data-body-part="header"]', $elm );
										this.tab.header( fm.tabs.header, _tabHeaderArr, $inst.find( '.nav.nav-tabs' ), $inst.find( '.tab-content' ) );
										this.body.header( _bodyHeaderArr, $inst.find( '[data-body="header"]' ) );
										$inst.exit(); $inst = undefined;
										$inst = $( '[data-body-part="footer"]', $elm );
										this.tab.footer( fm.tabs.footer, _tabFooterArr, $inst.find( '.nav.nav-tabs' ), $inst.find( '.tab-content' ) );
										this.body.footer( _bodyFooterArr, $inst.find( '[data-body="footer"]' ) );
										$inst.exit(); $inst = undefined;
									}.call( __worker.render ) );
									fm = _tabHeaderArr = _tabFooterArr = _bodyHeaderArr = _bodyFooterArr = undefined;
									return fields;
								}
							};
						} )
					};
				}, {
					'Sow.Net.Hub': 2,
					'Sow.Net.Web.XHR': 7,
					'Sow.Net.Web.Validate': 8,
					'Sow.Net.Api': 9,
					'Renderer':"Page.Renderer",
					owner: 'Page.Renderer',
					public: true
				}]
			}, {/**[cache]*/ }, /**[entry]*/["Page.Renderer"]];
		} ).mapPageNamespace( ["Sow.Net.Web.Page.Renderer"] );

	Sow.define( "Sow.Net.Web.Page.Renderer", function () {
		this.reRegisterNamespace( "Sow.Net.Web.Page.Renderer" );
		var _instance = this.exportNamespace( "Sow.Net.Web.Page.Renderer" );
		this.hook( "__web__page" ).add( "before_route_change", function ( a, c ) {
			_instance.renderer.dispose( a, c );
			return;
		} ).add( "on_route_change", function ( a, $b, script, c, isdialog ) {
			typeof ( c ) !== 'function' ? c = function () { } : undefined;
			_instance.renderer.script.append( a, script, function ( s ) {
				script = undefined;
				if ( s === "ERROR" ) {
					$b = undefined;
					c( "ERROR" );
					return;
				}
				_instance.renderer.init( a, $b, c, isdialog );
			} );
		} ).add( "__open__new", function ( opt ) {
			_instance.renderer.openNew( opt );
			return;
		} );
        return {
            errorResponse: function ( errorCode, $container, oldResponse, cb ) {
                let errorpage = ["401", "403", "404", "500", "505"];
                typeof ( cb ) !== 'function' ? cb = function () { } : undefined;
                if ( errorpage.indexOf( errorCode ) <= -1 ) {
                    errorCode = "apperror";
                }
                $.ajax( {
                    type: "GET",
                    url: String.format( "/error/{0}.aspx", errorCode ),
                    async: true
                } ).done( function ( resp ) {
                    $container.html( resp ).find( '.error-description' ).html( oldResponse );
                    $container.find( '.link-container' ).remove();
                    cb.call( Sow, $container );
                    cb = $container = oldResponse = undefined;
                } ).fail( function ( xhr, status, thrownError, error ) {
                    $container.html( oldResponse );
                    cb.call( Sow, $container );
                    cb = $container = oldResponse = undefined;
                } );
            },
			init: function ( route, dependency, $elm, cb ) {
				_instance.renderer.init( route, dependency, $elm, cb );
				return this;
			},
			onUnloadPage: function () {
				_instance.renderer.postmortem();
				return this;
			},
			registerPage: function ( opt, dependency ) {
				_instance.renderer.assign( opt, dependency );
				return this;
			}
		};
	} );
}( jQuery, this ) );