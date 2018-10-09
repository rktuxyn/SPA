( function ( _pageWindow, $ ) {
	if ( typeof ( Sow.define ) !== 'function'
		|| typeof ( Sow.registerNamespace ) !== 'function' )
		throw new Error( 'Sow.Web.Template.js couldn\'t be initilize. One of its dependency `sow.frameworkjs` or  sow.notify ' + ' couldn\t load properly... Please recheck..' );
	Sow.registerNamespace(/**[Namespace Name]*/'Sow.Web.Template', function () {
		return /**[modules]*/[{
			/** [Public instance module] */
			"template.public": [function ( require, module, exports ) {
				var _worker = {
					templateType: function ( text ) {
						if ( text === undefined || text === null )
							throw new Error( "Script text required!!!" );

						if ( ( text.match( /{%/g ) !== null ? true
							: text.match( /{=/g ) !== null ? true : false ) ) {
							return 'SCRIPT_TEMPLATE';
						}
						return 'PLAIN_TEMPLATE';
					},
					cache: module.aggregate( function () {
						var bucket = {};
						return {
							find: function ( path ) {
								return bucket[path];
							},
							set: function ( path, data ) {
								bucket[path] = data;
								return this;
							},
							remove: function ( path ) {
								if ( bucket[path] ) delete bucket[path];
								return this;
							}
						};
					} ),
					xhr: function ( path, cb ) {
						$.ajax( {
							type: "GET",
							url: path,
							dataType: 'text',
							async: true,
						} ).done( function ( data ) {
							cb.call( _worker, data, path );
							return this;
						} ).fail( function ( xhr, s, t, a ) {
							cb.call( _worker, "", path );
							return this;
						} );
					},
					get: {
						path: function ( a ) {
							if ( !a || a === null ) return null;
							a = a.split( ":" );
							if ( a === null ) return null;
							if ( a.length < 3 ) return null;
							let path = a[1];
							if ( !path ) return null;
							return path.trim();
						},
						parser: function ( html, cb ) {
							var p_worker = {
								store: {},
								isRender: false,
								render: function () {
									let impl = "";
									for ( let p in this.store ) {
										if ( typeof ( this.store[p] ) === 'boolean' ) return;
										impl += this.store[p];
									}
									this.isRender = true;
									delete this.store;
									let hmatch = html.match( /#template___content([\s\S]+?)#end___content/gi );
									//let imatch = impl.match( /#template___content#([\s\S]+?)#end___content/gi );
									if ( hmatch === null ) {
										cb.call( this, html );
										html = impl = p_worker = undefined;
										return;
									}
									for ( let i = 0, l = hmatch.length; i < l; i++ ) {
										let px = hmatch[i];
										let key = /#template___content ([\s\S]+?):#/gi.exec( px );
										if ( !key ) continue;
										let name = key[1];
										key = key[0];
										name = name.trim();
										key = key.trim();
										let nregx = new RegExp( "#end___content " + name + ":#", 'gi' );
										let keyregx = new RegExp( key, 'gi' );
										impl = impl.replace( nregx, "" ).replace( keyregx, px.replace( nregx, "" ).replace( keyregx, "" ) );
									}
									html = undefined;
									impl = impl.replace( /#end___content/gi, "" ).replace( /#template___content/gi, "" );
									cb.call( Sow, impl );
									cb = impl = undefined;
									return this;
								}
							};
							return {
								start: function (  ) {
									let match = html.match( /#include:([\s\S]+?):#/gi );
									if ( match === null || match.length <= 0 ) {
										cb.call( this, html ); html = undefined; return;
									}
									p_worker.store = {};
									for ( let i = 0, l = match.length; i < l; i++ ) {
										let m = match[i];
										if ( !m ) continue;
										let path = this.get.path( match[i] );
										if ( !path ) continue;
										html = html.replace( new RegExp( m, "g" ), "" );
										p_worker.store[path] = false;
									}
									for ( let p in p_worker.store ) {
										let ca = this.cache.find( p );
										if ( ca && ca !== undefined ) {
											p_worker.store[p] = ca;
											Sow.async( function () {
												p_worker.render();
											} );
											continue;
										}
										let copy = p;
										this.xhr( copy, function ( d ) {
											p_worker.store[copy] = d;
											p_worker.render();
											this.cache.set( copy, d );
										} );
									}
									if ( p_worker.isRender ) return this;
									Sow.async( function () {
										p_worker.render();
									} );
									return this;
								}
							};
						}
					}
				};
				return {
					script: module.aggregate( function () {

						var s_worker = module.aggregate( function () {
							var __storage = {};
							return {
								storage: {
									has: function ( identity ) {
										return typeof ( __storage[identity] ) === 'function';
									},
									get: function ( identity ) {
										return __storage;
									},
									remove: function ( identity ) {
										if ( this.has( identity ) )
											delete __storage[identity];
										return this;
									},
									run: function ( identity, data, cb ) {
										if ( !this.has( identity ) )
											throw new Error( "Invalid identity defined==>", identity );
										__storage[identity]( data, cb );
										return this;
									}
								}
							}
						} );
						return {
							has: function ( identity ) {
								return s_worker.storage.has( identity );
							},
							remove: function ( identity ) {
								s_worker.storage.remove( identity );
								return this;
							},
							run: function ( identity, data, cb ) {
								s_worker.storage.run( identity, data, cb );
								return this;
							},
							parse: function ( identity, text, cb ) {
								if ( _worker.templateType( text ) !== 'SCRIPT_TEMPLATE' )
									throw new Error( "Invalid Script template defined!!!!" );
								if ( typeof ( cb ) !== 'function' )
									cb = function () { };

								
								if ( s_worker.storage.has( identity ) ) {
									cb.call( this, "DONE" );
									return this;
								}
								require( "parser" ).init( identity, text, function ( script ) {
									eval( "(function(){\r\nthis['" + identity + "'] = function(__data, __cb){\r\n" + script + "\r\n};\r\n});" ).call( s_worker.storage.get() );
									cb.call( this, "DONE" ); cb = undefined;
									return this;
								} ).execute( 0, 100 );
								text = undefined;
								return this;
							}
						};
					} ),
					htmlParser: function ( html, cb ) {
						console.log( "PARSER..." );
						Sow.async( function () {
							if ( !html || html === undefined || /#include:/gi.test( html ) !== true ) {
								cb.call( this, html ); html = undefined; return;
							}
							_worker.get.parser( html, cb ).start.call( _worker );
							return this;
						} );
					}
				};
			}, {
				public: true,
				"parser": "script.parser",
				owner: 'Sow.Web.Template'
			}],
			/** SCRIPT PARSER Blueprint June 29/30, 2016, 01:11-7:00 AM BDT*/
			"script.parser": [function ( require, module, exports ) {
				return {
					/** SCRIPT PARSER Blueprint June 29/30, 2016, 01:11-7:00 AM BDT*/
					init: module.aggregate( function () {
						var p_88_worker = {
							startTage: function ( line, tag, isTagStart, isTagEnd, startTageName, isLastTag ) {
								var _default;
								if ( line.indexOf( tag ) <= -1 ) {
									!isLastTag ? undefined : isTagEnd === true ? line = line + "\x0f; __RSP += \x0f" : '';
									return { line: line, start: isTagStart, end: isTagEnd, startTageName: startTageName };
								}
								/** Check Start Tag**/
								isTagStart = true;
								_default = true;
								switch ( tag ) {
									case '{%':
										( line.match( /%}/g ) instanceof window.Array
											? ( isTagEnd = true, isTagStart = false,
												line = line.replace( /{%/g, "\x0f;" )
													.replace( /%}/g, " __RSP += \x0f" ) )
											: isTagEnd = false,
											line = line.replace( /{%/g, "\x0f;\r\n" ).replace( /'/g, '\x0f' ) );
										break;
									case '{=':
										( line.match( /=}/g ) instanceof window.Array ?
											( isTagEnd = true, isTagStart = false,
												line = line.replace( /{=(.+?)=}/g, function ( match ) {
													return !match ? '' : match.replace( /'/, '\x0f' );
												} ).replace( /{=/g, "\x0f; __RSP +=" )
													.replace( /=}/g, "; __RSP += \x0f" ) )
											: isTagEnd = false,
											line = line.replace( /'/, '\x0f' ).replace( /{=/g, "\x0f; __RSP +=" ) );
										break;
									default: _default = false; break;
								}
								if ( !_default ) {
									throw new Error( 'Invalid script tag found...' + tag ); return { line: undefined, start: undefined, end: undefined, startTageName: undefined };
								}
								return { line: line, start: isTagStart, end: isTagEnd, startTageName: ( !isTagEnd ? tag : undefined ) };
							},
							endTage: function ( line, tag, isTagStart, isTagEnd, startTageName ) {
								if ( isTagStart === false && isTagEnd === true ) {
									return { line: line, start: isTagStart, end: isTagEnd, startTageName: startTageName };
								}
								if ( isTagStart !== false && isTagEnd !== true ) {
									/** Check End Tag**/
									isTagStart = true;
									switch ( tag ) {
										case '%}': ( line.match( /%}/g ) instanceof window.Array ?
											( isTagEnd = true,
												isTagStart = false,
												line = line.replace( /%}/g, " __RSP += \x0f" ) )
											: isTagEnd = false );
											break;
										case '=}': ( line.match( /=}/g ) instanceof window.Array ?
											( isTagEnd = true, isTagStart = false, line = line.replace( /=}/g, "; __RSP += \x0f" ) )
											: isTagEnd = false );
											break;
										default: break;
									}
									return { line: line, start: isTagStart, end: isTagEnd, startTageName: ( !isTagEnd ? startTageName : undefined ) };
								}
								return { line: line, start: isTagStart, end: isTagEnd, startTageName: startTageName };
							}
						}
						return function ( identity, script, callback ) {
							let i, ilen, line, out, isTagStart, isTagEnd, tag1, tag2, tag3, tag4, startTageName, _get;
							tag1 = '{%', tag2 = '%}', tag3 = '{=', tag4 = '=}';
							//hex5 = '\x0f';/** Use this hex instead of '*/
							script ? ( script = script.split( '\n' ) ) : ( script = [] );
							( !script instanceof window.Array ? ( script = [] ) : '' );
							ilen = script.length;
							out = '/** ** [START CLIENT SCRIPT]** **/\r\n/** ** [START STRIPE-1]** **/ \r\n';
							out += 'let __RSP = "";\r\n';
							isTagStart = false, isTagEnd = true, startTageName = '';
							let __worker = {
								execute: function ( start, max ) {
									for ( i = start; i < ilen; i++ ) {
										if ( i >= max ) {
											Sow.async( function () {
												__worker.execute( i, max + 50 );
											} );
											return;
										}
										line = script[i]; out += "\r\n";
										if ( !line ) { out += "\r\n__RSP += '';"; continue; }
										line = line.replace( /^\s*|\s*$/g, '' );
										isTagEnd === true ? line = "__RSP += \x0f" + line : '';
										_get = p_88_worker.startTage( line, tag1, isTagStart, isTagEnd, startTageName );/**TAG-1 {%**/
										line = _get.line, isTagStart = _get.start, isTagEnd = _get.end, startTageName = _get.startTageName;
										_get = p_88_worker.endTage( line, tag2, isTagStart, isTagEnd, startTageName );/**TAG-2 %}**/
										line = _get.line, isTagStart = _get.start, isTagEnd = _get.end, startTageName = _get.startTageName;
										_get = p_88_worker.startTage( line, tag3, isTagStart, isTagEnd, startTageName );/**TAG-3 {=**/
										line = _get.line, isTagStart = _get.start, isTagEnd = _get.end, startTageName = _get.startTageName;
										_get = p_88_worker.endTage( line, tag4, isTagStart, isTagEnd, startTageName );/**TAG-4 =}**/
										line = _get.line, isTagStart = _get.start, isTagEnd = _get.end, startTageName = _get.startTageName;
										isTagEnd === true ? ( line = line.replace( /'/g, '\\x27' ).replace( /\x0f/g, "'" ), out += line + "';" ) : ( line = line.replace( /\x0f/g, "'" ), out += line );
									}
									ilen = line = isTagStart = isTagEnd = tag1 = tag2 = tag3 = tag4 = set = _get = script = undefined;
									out += "/** ** [/END STRIPE-" + ( i + 1 - 1 ) + "] ** **/\r\n/** ** [END CLIENT SCRIPT]** **/";
									out = out.replace( /__RSP \+\= '';/g, '' );
									i = undefined;
									out += 'typeof( __cb )==="function" ? __cb.call(this, __RSP):undefined;\r\n';
									out += "__RSP = undefined;";
									if ( typeof ( callback ) !== 'function' ) {
										return out;
									}
									callback.call( require( "owner" ).script, out ); out = '';
									console.log( 'Script Parsing Done' );
									return 'done';
								}
							};
							return __worker;
						}
					} ),

				};
			}, {
					private: true,
					"owner": "template.public"
			}],
		}, {/**[cache]*/ }, /**[entry]*/["template.public", "script.parser"]];

	} );

	Sow.define( "Sow.Web.Template", function () {
		return Sow.exportNamespace( 'Sow.Web.Template' );
	} );
	
}( window || this, jQuery ) );