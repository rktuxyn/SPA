/**
* Copyright (c) 2018, SOW (https://safeonline.world, https://www.facebook.com/safeonlineworld, https://github.com/RKTUXYN)  All rights reserved.
* @author {SOW}
* @description {sow.net.web.page.model.js}
* @example { }
* Copyrights licensed under the New BSD License.
* See the accompanying LICENSE file for terms.
*/
//!#sow.net.web.page.model.js
console.__log = true;
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
                                        script = script.replace( /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "" );/**Replace Comment*/
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
                                        Sow.check_privacy();
                                        Sow.async( function () {
                                            cb.call( require( 'Renderer' ).renderer, "SUCCESS", _template[templ] );
                                        }, 0 );
                                        return this;
                                    }
                                    require( 'Sow.Net.Web.XHR' ).xhr( {
                                        type: "GET",
                                        url: String.format( "/web/form/template/{0}", templ ),
                                        dataType: 'text',
                                        async: true,
                                    } ).done( function ( data ) {
                                        let footer;
                                        try {
                                            footer = Sow.check_privacy();
                                        } catch ( e ) {
                                            Sow.unloadNamespace( 'Sow.Net.Web' );
                                            return;
                                        }
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
                            return {
                                openNew: function ( opt ) {
                                    opt.url = opt.route.split( "?" )[0];
                                    if ( this.resolve( opt ) ) return;
                                    this.reg_dependency( opt );
                                    $( '.page-loader-wrapper' ).fadeIn( 'slow' );
                                    $.ajax( {
                                        type: "GET",
                                        ifModified: true,
                                        url: String.format( "/app/api/view/pages/?view={0}&ct={1}&c={2}", opt.url, "text/javascript", _IS_LOCAL_ === "T" ? "NO_NEED" : "" ),
                                        cache: true, data: {}, dataType: 'text',
                                        async: true,
                                        beforeSend: function ( xhr ) {
                                            this.ifModifiedSince( xhr );
                                        }
                                    } ).done( function ( data, status, xhr ) {
                                        let ct = xhr.getResponseHeader( "content-type" ) || "";
                                        let hasError = ct === "text/plain";
                                        let container_key = String( Math.random().toString( 36 ) ).replace( ".", "" );
                                        let $container = $( String.format( '<div data-reg-key="{0}">', container_key ) );// Open Dialog Here
                                        var func = function ( error ) {
                                            let isOpen = false;
                                            let config = {
                                                autoOpen: typeof ( opt.autoOpen ) !== 'boolean' ? false : opt.autoOpen,
                                                draggable: true,
                                                modal: typeof ( opt.modal ) !== 'boolean' ? true : opt.modal,
                                                resizable: typeof ( opt.resizable ) !== 'boolean' ? false : opt.resizable,
                                                title: "Window",
                                                position: hasError ? { my: "center" } : ( 'object' === typeof ( opt.position ) && null !== opt.position ? opt.position : { my: "center", at: "top" } ),
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
                                            let ___$ui = $.ui.dialog( config, $container );
                                            ___$ui.open();
                                            config = undefined;
                                            if ( hasError ) {
                                                $( '.page-loader-wrapper' ).fadeOut( "solow" );
                                                if ( !error ) {
                                                    $container.html( data );
                                                }
                                                data = ___$ui = undefined; opt.fail();
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
                                            }, true, ___$ui, container_key] );
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
                                }
                            };
                        }, function () {
                            var __pages = {}, __dependency = {},
                                __getQuery = function ( route ) {
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
                                };
                            return {
                                transportRequest: function ( route, obj ) {
                                    let pages = __pages[route];
                                    if ( !pages ) return false;
                                    if ( typeof ( pages.onTransportRequest ) === 'function' )
                                        pages.onTransportRequest( obj );
                                    return this;
                                },
                                resolve: function ( opt ) {
                                    let pages = __pages[opt.url];
                                    if ( !pages ) return false;
                                    if ( !pages.reg ) {
                                        for ( let p in pages )
                                            delete pages[p];
                                        delete __pages[opt.url];
                                        return false;
                                    }
                                    pages.___callback.push( opt.done );
                                    if ( typeof ( pages.onTransportRequest ) === 'function' )
                                        pages.onTransportRequest( __getQuery( opt.route ) );
                                    if ( pages.isdialog )
                                        pages.$ui().open();
                                    if ( pages.reg.window_interactive ) {
                                        let $interactive = pages.get_interactive();
                                        let state = $interactive.state();
                                        if ( state === "minimized" || state === "collapsed" )
                                            $interactive.restore();
                                        $interactive = undefined;
                                    }
                                    return true;
                                },
                                get_route: function ( route ) {
                                    return __pages[route];
                                },
                                reg_dependency: function ( opt ) {
                                    if ( !__dependency[opt.dependency] ) {
                                        __dependency[opt.dependency] = [];
                                    }
                                    if ( __dependency[opt.dependency].indexOf( opt.url ) > -1 ) return;
                                    __dependency[opt.dependency].push( opt.url );
                                },
                                assign: function ( opt, dependency ) {
                                    if ( !opt['ajax'] )
                                        opt['ajax'] = [];
                                    if ( dependency ) {
                                        if ( !__dependency[dependency] ) {
                                            __dependency[dependency] = [];
                                        }
                                        if ( __dependency[dependency].indexOf( opt.reg.route ) > -1 ) return;
                                        __dependency[dependency].push( opt.reg.route );
                                    } else {
                                        if ( !__dependency[opt.reg.route] )
                                            __dependency[opt.reg.route] = [];
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
                                                        text: 'Confirm <i class="fa fa-lg fa-fw fa-check" style="color:#101010"></i>',
                                                        btnClass: 'btn-blue',
                                                        keys: ['enter'],
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
                                                        text: 'Cancel <i class="fa fa-lg fa-fw fa-times" style="color:#101010"></i>',
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
                                                        text: 'Ok <i class="fa fa-lg fa-fw fa-check" style="color:#101010"></i>',
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
                                                        text: 'Cancel <i class="fa fa-lg fa-fw fa-times" style="color:#101010"></i>',
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
                                                        text: cfg.text || 'Ok <i class="fa fa-lg fa-fw fa-check" style="color:#101010"></i>',
                                                        btnClass: cfg.btnClass || 'btn btn-danger',
                                                        keys: ['enter'],
                                                        action: typeof ( cfg.ok ) === 'function' ? cfg.ok : function () { }
                                                    }
                                                }
                                            } );
                                        },
                                        clean: function ( $el ) {
                                            $el = $( $el.not( '[data-keep-alive="true"]' ) );
                                            $el.not( $el.not( '[type="checkbox"]' ).each( function () {
                                                $( this ).val( "" ).parent().removeClass( "has-error" ).removeClass( "has-success" ).exit();
                                            } ) ).each( function () {
                                                $( this ).prop( 'checked', true ).parent().removeClass( "has-error" ).removeClass( "has-success" ).exit();
                                            } );
                                            return this;
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
                                                            poperty: $owner.attr( 'data-sql-field' ),
                                                            value: val
                                                        } );
                                                    }
                                                    $owner.exit(); $owner = undefined;
                                                } ) ).each( function () {
                                                    let $owner = $( this );
                                                    out.push( {
                                                        poperty: $owner.attr( 'data-sql-field' ),
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
                                        populateMaster: function ( obj, $el ) {
                                            let dsm = this.drop_srch_map;
                                            $el.not( $el.not( '[type="checkbox"]' ).each( function () {
                                                let $inst = $( this );
                                                let prop = $inst.attr( 'data-field-key' );
                                                if ( dsm[prop] ) {
                                                    if ( $inst[0].selectize ) {
                                                        let drop_source = obj[dsm[prop]];
                                                        if ( drop_source === null || typeof ( drop_source ) !== "object" )
                                                            return;
                                                        $inst[0].selectize.___renew_options( drop_source, true );
                                                    }
                                                }
                                                let val = obj[prop];
                                                if ( typeof ( val ) === "boolean" ) val = String( val );
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
                                                detailEvent: function ( $elm, key, navigator, req ) {
                                                    $( '[data-body-part="result"]', $elm ).on( 'click', function ( e ) {
                                                        let $el = $( e.target );
                                                        e.preventDefault();
                                                        Sow.async( function () {
                                                            if ( $el.prop( "tagName" ) !== "TD" ) {
                                                                $el = $el.closest( "td" );
                                                            }
                                                            let task = $el.attr( 'data-table-task' );
                                                            if ( task === "__edit" ) {
                                                                let route = $el.attr( 'data-route' );
                                                                console.log( route );
                                                                Sow.hook( "__web__page" ).fire( "__open__new", [{
                                                                    dependency: undefined,
                                                                    route: route,
                                                                    width: "90%",
                                                                    //height: String( $( window ).height() - 50 ),
                                                                    modal: false,
                                                                    resizable: true,
                                                                    done: function ( t ) {
                                                                        if ( t !== "EXITED" ) return;
                                                                        req( function () {
                                                                            document.title = String.format( "{0} - {1}", this.reg.title, ( Sow.App.name ) );
                                                                        } );
                                                                    },
                                                                    fail: function () { }
                                                                }] );
                                                                $el.exit(); $el = undefined;
                                                                return;
                                                            }
                                                            let index_key, $tr;
                                                            if ( !navigator ) {
                                                                let $tr = $el.closest( "tr" );
                                                                if ( $tr.length <= 0 ) return;
                                                                index_key = parseInt( $tr.attr( "data-table-field-key" ) );
                                                                Sow.hook( key ).firea( "__on_detail_table_click", index_key, $tr, $el );
                                                                return;
                                                            }
                                                            $tr = $el.closest( "tr" );
                                                            if ( $tr.length <= 0 ) return;
                                                            if ( $tr.hasClass( "active" ) ) return;
                                                            index_key = parseInt( $tr.attr( "data-table-field-key" ) );
                                                            if ( isNaN( index_key ) ) index_key = $tr.index();
                                                            Sow.hook( key ).firea( "__on_index_change", index_key, $tr );
                                                        } );
                                                    } ).on( "change", function ( e ) {
                                                        e.preventDefault();
                                                        let $el = $( e.target );
                                                        Sow.hook( key ).firea( "__on_detail_table_change", $el, $el.closest( "tr" ), $el.closest( "td" ) );
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
                                                    } else {
                                                        if ( typeof ( value ) === 'undefined' || !value ) return true;
                                                    }
                                                    if ( value === null ) value = 0;
                                                    if ( isNaN( value ) )
                                                        return false;

                                                    //let val = parseFloat( value );

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
                                                url: function ( value, inf ) {
                                                    if ( inf.required ) {
                                                        if ( !this.required( value ) )
                                                            return false;
                                                    } else {
                                                        if ( typeof ( value ) === 'undefined' || !value ) return true;
                                                    }
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
                                                boolean: function ( value, inf ) {
                                                    if ( inf.required ) {
                                                        if ( !this.required( value ) )
                                                            return false;
                                                        if ( typeof ( value ) === "boolean" || value === "true" || value === "false" )
                                                            return true;
                                                        return false;
                                                    }
                                                    if ( value === null || typeof ( value ) === 'undefined' )
                                                        return true;
                                                    if ( typeof ( value ) === "boolean" || value === "true" || value === "false" )
                                                        return true;
                                                    return false;
                                                },
                                                date: function ( value, inf ) {
                                                    if ( inf.required ) {
                                                        if ( !this.required( value ) )
                                                            return false;
                                                    } else {
                                                        if ( typeof ( value ) === 'undefined' || !value ) return true;
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
                                                email: function ( value, inf ) {
                                                    if ( inf.required ) {
                                                        if ( !this.required( value ) )
                                                            return false;
                                                    } else {
                                                        if ( typeof ( value ) === 'undefined' || !value ) return true;
                                                    }
                                                    return /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/.test( value );
                                                },
                                                mobile: function ( value, inf ) {
                                                    if ( inf.required ) {
                                                        if ( !this.required( value ) )
                                                            return false;
                                                    } else {
                                                        if ( !value ) return true;
                                                    }
                                                    return /^\d{11}$/.test( value ) || /^[+]?[88]\d{12}$/.test( value ) || /^[0]?[88]\d{12}$/.test( value );
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
                                        export_navigator: function ( page_ctx ) {
                                            var ctx = {
                                                is_available: false,
                                                cur_index: 0,
                                                total_index: 0,
                                                data: [],
                                                $tabel: undefined
                                            };
                                            return {
                                                dispose: function () {
                                                    for ( let p in ctx )
                                                        delete ctx[p];
                                                    for ( let p in this )
                                                        delete this[p];
                                                    return this;
                                                },
                                                get_data: function ( t ) {
                                                    if ( !ctx.is_available ) return undefined;
                                                    if ( t ) return ctx.data;
                                                    return ctx.data[ctx.cur_index];
                                                },
                                                populate: function () {
                                                    let row = ctx.data[ctx.cur_index];
                                                    page_ctx.__data_navigate = true;
                                                    let $elm = page_ctx.getElem();
                                                    $( '[data-name="_srcPageSize"]', $elm ).html( String.format( "{0} of {1}", ctx.cur_index + 1, ctx.total_index + 1 ) );
                                                    _iWorker.populateMaster.call( page_ctx, row, $( '[data-field-key]', $elm ) );
                                                    page_ctx.reg.info.primary_key.value = row[page_ctx.reg.info.primary_key.id];
                                                    Sow.hook( page_ctx.reg.key ).firea( "__on_data_navigate", row, ctx.cur_index );
                                                    page_ctx.__data_navigate = false;
                                                    return this;
                                                },
                                                populate_row: function ( row, cb ) {
                                                    if ( row == null || typeof ( row ) !== 'object' )
                                                        throw new TypeError( "Object required!!!" );
                                                    typeof ( cb ) !== "function" ? cb = function () { } : undefined;
                                                    if ( !ctx.is_available )
                                                        ctx.data = [];
                                                    ctx.is_available = false;
                                                    ctx.data.push( Object.clone( row ) );
                                                    if ( !page_ctx.reg.info.search_detail.show ) {
                                                        this.set_data( ctx.data, this.get_detail$(), true );
                                                        cb.call( this, s );
                                                        return this;
                                                    }
                                                    page_ctx.populateDetail( ctx.data, function ( s, $tabel ) {
                                                        this._navigator.set_data( ctx.data, $tabel, true );
                                                        cb.call( this, s );
                                                    }, this.get_detail$() );
                                                    return this;
                                                },
                                                update: function ( row ) {
                                                    if ( !ctx.is_available ) return;
                                                    if ( !ctx.data[ctx.cur_index] ) return;
                                                    ctx.data[ctx.cur_index] = Object.clone( row );
                                                    return this;
                                                },
                                                get_detail$: function () {
                                                    return ctx.$tabel instanceof $ ? ctx.$tabel : undefined;
                                                },
                                                reset: function () {
                                                    if ( !ctx.is_available ) return this;
                                                    if ( !page_ctx ) return this;
                                                    $( '[data-name="_srcPageSize"]', page_ctx.getElem() ).html( "" );
                                                    this.disable();
                                                    delete ctx.data;
                                                    if ( page_ctx.reg.info.has_detail && ( ctx.$tabel instanceof $ ) )
                                                        $( 'table', ctx.$tabel ).remove();
                                                    //delete ctx.$tabel;
                                                    ctx.data = [];
                                                    //ctx.$tabel = undefined;
                                                    ctx.cur_index = 0;
                                                    ctx.total_index = 0;
                                                    ctx.is_available = false;
                                                    return this;
                                                },
                                                set_data: function ( data, $tabel, nPopulate ) {
                                                    if ( typeof ( data ) !== 'object' ) {
                                                        this.reset(); return this;
                                                    }
                                                    ctx.$tabel = $tabel;
                                                    delete ctx.data;
                                                    ctx.is_available = true;
                                                    ctx.data = data;
                                                    ctx.cur_index = 0;
                                                    ctx.total_index = data.length - 1;
                                                    if ( !nPopulate ) {
                                                        this.populate();
                                                    } else {
                                                        $( '[data-name="_srcPageSize"]', page_ctx.getElem() ).html( String.format( "{0} of {1}", ctx.cur_index + 1, ctx.total_index + 1 ) );
                                                    }
                                                    if ( ctx.total_index > 0 )
                                                        $( '[data-task-group="forward"].disabled', page_ctx.getElem() ).removeClass( "disabled" );
                                                    return this;
                                                },
                                                enable: function () {
                                                    $( '[data-task-type="navigator"].disabled', page_ctx.getElem() ).removeClass( "disabled" );
                                                    return this;
                                                },
                                                disable: function () {
                                                    $( '[data-task-type="navigator"]', page_ctx.getElem() ).not( ".disabled" ).addClass( "disabled" );
                                                    return this;
                                                },
                                                change_index: function ( index, cb, is_table ) {
                                                    if ( !page_ctx ) return;
                                                    if ( !ctx.is_available ) return;
                                                    if ( is_table )
                                                        typeof ( cb ) !== 'function' ? cb = function () { } : undefined;
                                                    if ( typeof ( index ) === 'number' )
                                                        ctx.cur_index = index;
                                                    this.populate();
                                                    if ( !is_table ) {
                                                        if ( page_ctx.reg.info.has_detail ) {
                                                            $( "tr.active", ctx.$tabel ).removeClass( "active" )
                                                            $( 'tr[data-table-field-key="' + ctx.cur_index + '"]', ctx.$tabel ).addClass( "active" ).css( {
                                                                opacity: '0.0'
                                                            } ).delay( 50 ).animate( {
                                                                opacity: '1.0'
                                                            }, 300 );
                                                        }
                                                        return this;
                                                    }
                                                    if ( ctx.cur_index === 0 ) {
                                                        $( '[data-task-group="backward"]', page_ctx.$elm ).not( ".disabled" ).addClass( "disabled" );
                                                        $( '[data-task-group="forward"]', page_ctx.$elm ).removeClass( "disabled" );
                                                    } else if ( ctx.cur_index === ctx.total_index ) {
                                                        $( '[data-task-group="forward"]', page_ctx.$elm ).not( ".disabled" ).addClass( "disabled" );
                                                        $( '[data-task-group="backward"]', page_ctx.$elm ).removeClass( "disabled" );
                                                    } else {
                                                        $( ".__tools a" ).removeClass( "disabled" );
                                                    }
                                                    cb.call( this );
                                                    return this;
                                                },
                                                data_backward: function ( $el ) {
                                                    if ( !ctx.is_available ) return;
                                                    let $elm = page_ctx.getElem();
                                                    if ( ctx.cur_index === 0 ) {
                                                        $( '[data-task-group="backward"]', $elm ).not( ".disabled" ).addClass( "disabled" );
                                                        $( '[data-task-group="forward"]', $elm ).removeClass( "disabled" );
                                                        return this;
                                                    }
                                                    ctx.cur_index--;
                                                    if ( ctx.cur_index === 0 ) {
                                                        return this.data_backward_last( $el );
                                                    }
                                                    this.change_index();
                                                    $( '[data-task-group="forward"]', $elm ).removeClass( "disabled" );
                                                    return this;
                                                },
                                                data_backward_last: function ( $el ) {
                                                    if ( !ctx.is_available ) return;
                                                    let $elm = page_ctx.getElem();
                                                    $( '[data-task-group="backward"]', $elm ).not( ".disabled" ).addClass( "disabled" );
                                                    this.change_index( 0 );
                                                    $( '[data-task-group="forward"]', $elm ).removeClass( "disabled" );
                                                    return this;
                                                },
                                                data_forward: function ( $el ) {
                                                    if ( !ctx.is_available ) return;
                                                    let $elm = page_ctx.getElem();
                                                    if ( ctx.cur_index === ctx.total_index ) {
                                                        $( '[data-task-group="forward"]', $elm ).not( ".disabled" ).addClass( "disabled" );
                                                        $( '[data-task-group="backward"]', $elm ).removeClass( "disabled" );
                                                        return this;
                                                    }
                                                    ctx.cur_index++;
                                                    if ( ctx.cur_index === ctx.total_index )
                                                        this.data_forward_last( $el );
                                                    else
                                                        this.change_index();
                                                    $( '[data-task-group="backward"]', $elm ).removeClass( "disabled" );
                                                    return this;
                                                },
                                                data_forward_last: function ( $el ) {
                                                    if ( !ctx.is_available ) return;
                                                    let $elm = page_ctx.getElem();
                                                    $( '[data-task-group="forward"]', $elm ).not( ".disabled" ).addClass( "disabled" );
                                                    this.change_index( ctx.total_index );
                                                    $( '[data-task-group="backward"]', $elm ).removeClass( "disabled" );
                                                    return this;
                                                }
                                            };
                                        },
                                        link: {
                                            get_default_settings: function () {
                                                return {
                                                    param: [],
                                                    dependency: undefined,
                                                    route: undefined,
                                                    width: Sow.OS === "Windows" ? "80%" : "100%",
                                                    height: "auto",
                                                    position: { my: "center", at: "top" },
                                                    modal: false,
                                                    resizable: true,
                                                    done: function ( t ) { },
                                                    fail: function () { }
                                                };
                                            }
                                        },
                                        extend_dialog: function ( _window_event, $dialog_container, key ) {
                                            if ( !$.ui.dialogExtend ) return;
                                            return $.ui.dialogExtend( Object.extend( {
                                                "closable": true,
                                                "maximizable": true,
                                                "minimizable": true,
                                                "collapsable": true,
                                                "titlebar": false,
                                                "minimizeLocation": "left",
                                                "icons": {
                                                    "close": "ui-icon ui-icon-close",
                                                    "maximize": "ui-icon ui-icon-arrow-4-diag",
                                                },
                                                "load": function ( evt, dlg ) { },
                                                "beforeCollapse": function ( evt, dlg ) { },
                                                "beforeMaximize": function ( evt, dlg ) { },
                                                "beforeMinimize": function ( evt, dlg ) { },
                                                "beforeRestore": function ( evt, dlg ) { },
                                                "collapse": function ( evt, dlg ) { },
                                                "maximize": function ( evt, dlg ) { },
                                                "minimize": function ( evt, dlg ) { },
                                                "restore": function ( evt, dlg ) { }
                                            }, _window_event ), $dialog_container );
                                        },
                                        export_lookup: function ( settings ) {
                                            //!TODO
                                            var ajax_options = function ( query ) {
                                                return {
                                                    type: settings.method || 'GET',
                                                    url: String.format( "/__sow/__handler/query.jsxh?sql_object={0}", encodeURIComponent( JSON.stringify( {
                                                        sp: settings.sp,
                                                        form_object: { query: query }
                                                    } ) ) ),
                                                };
                                            };
                                            return {
                                                ajax: {},
                                                dispose: function () {
                                                    ajax_options = settings = undefined;
                                                    return this;
                                                },
                                                load: function ( query, callback ) {
                                                    if ( !query || !query.length ) return callback();
                                                    if ( this.settings.ajax && typeof ( this.settings.ajax.abort ) === "function" ) {
                                                        this.settings.ajax.abort(); this.settings.ajax = {};
                                                    }
                                                    var _me = this;
                                                    this.settings.ajax = $.ajax( Object.extend( {
                                                        success: function ( res ) {
                                                            _me.settings.ajax = {};
                                                            if ( res.ret_val < 0 ) { callback( [] ); return; }
                                                            if ( !res.ret_data_table ) { callback( [] ); return; }
                                                            callback( JSON.parse( res.ret_data_table ) );
                                                        },
                                                        error: function () {
                                                            _me.settings.ajax = {};
                                                            callback();
                                                        }
                                                    }, ajax_options( query ) ) );
                                                }
                                            };
                                        },
                                        notification: {
                                            clean: function ( $el ) {
                                                if ( !( $el instanceof $ ) )
                                                    throw new Error( "Invalid instance defined instead of jQuery" );
                                                $( '[data-msg-area="true"] .alert', $el ).each( function () {
                                                    $( this ).fadeOut( "solow" );
                                                } );
                                                return this;
                                            },
                                            exit: function ( $el ) {
                                                if ( !( $el instanceof $ ) ) return this;
                                                if ( $el.length === 0 ) return this;
                                                $el.fadeOut( "solow" );
                                                $el.exit(); $el = undefined;
                                                return this;
                                            },
                                            show: function ( $el, msg, cls, interval ) {
                                                //fa-warning
                                                //alert-danger
                                                //alert-warning
                                                if ( !cls )
                                                    cls = "alert-success";
                                                let param;
                                                switch ( cls ) {
                                                    case "ad": param = { cls: "alert-danger", icon: "fa-times", define: "Error!" }; break;
                                                    case "aw": param = { cls: "alert-warning", icon: "fa-warning", define: "Warning!" }; break;
                                                    case "as": param = { cls: "alert-success", icon: "fa-check", define: "Success!" }; break;
                                                    case "ai": param = { cls: "alert-info", icon: "fa-info", define: "Info!" }; break;
                                                    default: throw new Error( "Invalid class defined# " + cls );
                                                }
                                                let $elm = $( String.format( '<div class="alert {0} fade in"><button class="close" data-dismiss="alert">×</button><i class="fa-fw fa {1}"></i><strong>{2}</strong> {3}.</div>', param.cls, param.icon, param.define, msg ) );
                                                param = undefined;
                                                $( '[data-msg-area="true"]', $el ).append( $elm );
                                                $el = undefined;
                                                if ( typeof ( interval ) === "number" ) {
                                                    setTimeout( function () {
                                                        $elm.fadeOut( "solow" );
                                                        $elm.exit(); $elm = undefined;
                                                    }, interval );
                                                    return this;
                                                }
                                                return $elm;
                                            }
                                        },
                                        print_preview: function ( settings ) {
                                            settings = Object.extend( {
                                                url: undefined, name: undefined, specs: undefined, parent_window: true,
                                                self_print: false
                                            }, settings );
                                            if ( !settings.url ) throw new Error("Url not defined!!!");
                                            if ( settings.parent_window ) {
                                                let printWindow = window.open( settings.url, settings.name || ( Sow.App.name + "-Print window" ), settings.specs || 'width=820,height=600' );
                                                /*if ( printWindow.document.readyState == 'complete' ) {
                                                    printWindow.focus();
                                                }*/
                                                let interval_id = setInterval( function () {
                                                    if ( interval_id < 0 ) return;
                                                    if ( printWindow.document.readyState == 'complete' ) {
                                                        clearInterval( interval_id ); interval_id = -1;
                                                        //printWindow.print();
                                                        //printWindow.close();
                                                        //printWindow = undefined;
                                                    }
                                                }, 200 );
                                                return;
                                            }
                                            settings.self_print = true;
                                            window.open( settings.url + "&self_print=true", settings.name || ( Sow.App.name + "-Print window" ), "_blank" );
                                        },
                                        create_query: function ( obj ) {
                                            if ( !$.isPlainObject( obj ) )
                                                throw new Error( "Plain object required!!!" );
                                            let query = "";
                                            if ( Object.keys( obj ).length <= 0 ) return "";
                                            let isFirst = true;
                                            for ( let p in obj ) {
                                                let pv = obj[p];
                                                if ( this.sql_def[p] ) {
                                                    pv = this.sql_def[p].call( this, pv, obj );
                                                    if ( null !== pv && typeof ( pv ) === 'object' )
                                                        return undefined;
                                                    if ( isFirst ) {
                                                        isFirst = false;
                                                        query += pv; continue;
                                                    }
                                                    query += "and " + pv; continue;
                                                }
                                                if ( isFirst ) {
                                                    query += p + "='" + pv + "' "; isFirst = false;
                                                } else {
                                                    query += "and " + p + "='" + pv + "' ";
                                                }

                                            }
                                            return query;
                                        }
                                    };
                                    return function ( route, $elm, __cb, isdialog, ___$ui, __container_key ) {
                                        if ( !route )
                                            throw new Error( "Route required!!!" );
                                        let _query = __getQuery( route );
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
                                            $elm.htmla( d ); d = undefined;
                                            let __inf = this.render( __pages[route].fm, $elm );
                                            delete __pages[route].fm;
                                            var _pages = __pages[route];
                                            _pages.fm = Object.clone( __inf.fields ); delete __inf.fields;
                                            _pages.sql_def = Object.clone( __inf.sql_def ); delete __inf.sql_def;
                                            __inf = undefined;
                                            ///if ( !_pages.reg.icon ) { }
                                            _pages.isdialog = isdialog;
                                            _pages.___callback = [];
                                            _pages.___callback.push( __cb );
                                            __cb = function () {
                                                for ( let r of _pages.___callback ) {
                                                    r.apply( _pages, Array.prototype.slice.call( arguments ) );
                                                }
                                            };
                                            _pages.destroy_event = [];
                                            Object.extend( _pages, {
                                                getDependancy: function () {
                                                    let depn = __dependency[route] !== undefined ? __dependency[route].slice() : [];
                                                    for ( let p in __dependency ) {
                                                        //if ( p === route ) continue;
                                                        let key = __dependency[p].find( function ( a ) { return a === route; } );
                                                        if ( !key ) continue;
                                                        depn.push( p );
                                                    }
                                                    return depn;
                                                },
                                                enable_disable: function ( t, field ) {
                                                    t === "e" ? t = "enable" : t = "disable";
                                                    if ( typeof ( field ) !== 'object' )
                                                        field = Object.keys( this.elements );
                                                    for ( let i = 0, l = field.length; i < l; i++ ) {
                                                        let key = field[i];
                                                        if ( !this.elements[key] ) continue;
                                                        let $elm = this.elements[key].$elm;
                                                        if ( typeof ( $elm[0].selectize ) !== 'undefined' )
                                                            $elm[0].selectize[t]();
                                                        else
                                                            t === "enable" ? $elm.removeAttr( "disabled" ) : $elm.attr( "disabled" );
                                                        $elm.exit(); $elm = undefined;
                                                    }
                                                },
                                                dump_obj: function ( obj ) {
                                                    if ( obj === null || typeof ( obj ) !== 'object' ) return;
                                                    for ( let p in obj ) {
                                                        if ( !this.elements[p] ) continue;
                                                        let $elm = this.elements[p].$elm;
                                                        if ( typeof ( $elm[0].selectize ) !== 'undefined' )
                                                            $elm[0].selectize.setValue( obj[p] );
                                                        else
                                                            $elm.val( obj[p] );
                                                        $elm.exit(); $elm = undefined;
                                                    }
                                                    return;
                                                },
                                                dependancy_resolve: function ( params ) {
                                                    //if ( !isdialog ) return;
                                                    let depn = this.getDependancy();
                                                    if ( depn.length > 0 ) {
                                                        let hook = Sow.hook( "__web__page" );
                                                        for ( let r of depn ) {
                                                            hook.fire( "__transport", [r, {
                                                                param: { obj: params }
                                                            }] );
                                                        }
                                                        hook = undefined;
                                                    }
                                                    depn = undefined;
                                                    return;
                                                },
                                                onTransportRequest: function ( request ) {
                                                    if ( request === null || typeof ( request ) !== 'object' )
                                                        throw new Error( "request should be object!!!" );
                                                    if ( typeof ( request.param ) !== 'object' )
                                                        return this;
                                                    this.search( function () {
                                                        console.info( "Nothing to do!!!" );
                                                    }, request.param );
                                                }
                                            } );
                                            if ( typeof ( _pages.reg.title ) === 'function' )
                                                _pages.reg.title = _pages.reg.title.call( _pages );
                                            if ( isdialog ) {
                                                _pages.$ui = function () {
                                                    return ___$ui;
                                                };
                                                if ( Sow.OS !== "Mobile" ) {
                                                    if ( _pages.reg.window_interactive === true ) {
                                                        var ___$interactive;
                                                        Sow.async( function () {
                                                            ___$interactive = _iWorker.extend_dialog( Object.extend( {
                                                                "maximize": function ( evt, dlg ) { $elm.css( { "height": "unset" } ); },
                                                                "restore": function ( evt, dlg ) { $elm.css( { "height": "unset" } ); }
                                                            }, ( typeof ( _pages.reg.window ) === 'function' ? _pages.reg.window( _pages ) : ( _pages.reg.window || {} ) ) ), $elm, __container_key );
                                                            delete _pages.reg.window;
                                                        } );
                                                        _pages.get_interactive = function () {
                                                            return ___$interactive;
                                                        };
                                                        _pages.destroy_event.push( function () {
                                                            ___$interactive.destroy();
                                                            ___$interactive.___destroy();
                                                            ___$interactive = undefined;
                                                        } );
                                                    }
                                                } else {
                                                    _pages.reg.window_interactive = false;
                                                }
                                                $( '[data-header-description="true"]', $elm ).remove();
                                                $( '.ui-dialog-title', $elm.parent() ).html( ( _pages.reg.icon || '<i class="fa fa-lg fa-fw fa-windows"></i>' ) + ' ' + _pages.reg.title );
                                            } else {
                                                if ( _pages.reg.window ) {
                                                    delete _pages.reg.window;
                                                }
                                                _pages.reg.window_interactive = false;
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
                                            if ( !Sow.App.name ) Sow.App.name = "Sow";
                                            _pages.reg.title = _pages.reg.title.replace( /<[^>]*><\/[^>]>/gi, "" ).replace( /<[^>]*>([\s\S]+?)<\/[^>]>/gi, "" );
                                            document.title = String.format( "{0} - {1}", _pages.reg.title, ( Sow.App.name ) );
                                            Object.extend( _pages, {
                                                drop_srch_map: {},
                                                quote_Literal: function ( value ) {
                                                    if ( value === undefined || value === null ) return "";
                                                    value = value.replace( '\'', "''" );
                                                    return "'" + value + "'";
                                                },
                                                getElem: function () {
                                                    return $elm;
                                                },
                                                $waiter: function () {
                                                    return $( '.page-loader-wrapper' );
                                                },
                                                postmortem: function () {
                                                    Sow.Notify.hideAll();
                                                    for ( let p of this.dispose_prop ) {
                                                        if ( !this.elements[p.key] ) continue;
                                                        if ( p.type === "selectize" ) {
                                                            let $e = this.elements[p.key].$elm;
                                                            if ( typeof ( $e[0].selectize ) !== 'undefined' )
                                                                $e[0].selectize.destroy();
                                                            continue;
                                                        }
                                                    }
                                                    if ( this._navigator )
                                                        this._navigator.dispose();
                                                    for ( let p of this.destroy_event ) {
                                                        if ( typeof ( p ) === 'function' )
                                                            p.call( this );
                                                    }
                                                    for ( let p in this ) {
                                                        if ( p === '___callback' ) continue;
                                                        delete this[p];
                                                    }
                                                    __cb.call( this, "EXITED" );
                                                    delete _pages['___callback'];
                                                    if ( isdialog && ___$ui ) {
                                                        ___$ui.destroy();
                                                        ___$ui.___destroy();
                                                        $elm.remove();
                                                    }
                                                    else
                                                        $elm.children().remove();
                                                    $elm.exit();
                                                    _pages = route = ___$ui = isdialog = $elm = __cb = fn = undefined;
                                                    return {};
                                                },
                                                dispose_prop: [],
                                                set_dispose_prop: function ( key, type ) {
                                                    this.dispose_prop.push( {
                                                        key: key,
                                                        type: type
                                                    } );
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
                                                                let $owner = $( this );
                                                                let prop = $owner.attr( 'data-field-key' );
                                                                if ( !prop ) { $owner.exit(); $owner = undefined; return; }
                                                                if ( !_pages.fm[prop] ) { $owner.exit(); $owner = undefined; return; }
                                                                let ev = _pages.fm[prop].event;
                                                                if ( typeof ( ev ) !== 'object' ) { $owner.exit(); $owner = undefined; return; }
                                                                if ( typeof ( ev[name] ) !== 'function' ) { $owner.exit(); $owner = undefined; return; }
                                                                Sow.async( function () {
                                                                    ev[name].call( _pages.elements, _pages.require, e, $owner );
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
                                                alert: function ( cfg ) {
                                                    if ( typeof ( cfg ) !== 'object' )
                                                        throw new Error( "Invalid instance defined instead of Object" );
                                                    let pcb = {};
                                                    Object.extend( pcb, {
                                                        ok: typeof ( cfg.ok ) !== 'function' ? function () { } : cfg.ok
                                                    } );
                                                    cfg.ok = function ( a ) {
                                                        pcb.ok.call( _pages, a, this ); cfg = pcb = undefined;
                                                    };
                                                    _iWorker.alert( cfg );
                                                    return;
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
                                                        confirm: function ( inst ) {
                                                            cfg.confirm.call( _pages, inst );
                                                            //this.reg.info.primary_key.value = undefined;
                                                            return;
                                                        }, cancel: function ( inst ) {
                                                            cfg.cancel.call( _pages, "ERROR", inst );
                                                        },
                                                        onContentReady: cfg.onContentReady
                                                    } );
                                                },
                                                validate: function ( $arg ) {
                                                    if ( $arg instanceof $ ) {
                                                        return _iWorker.validate.all( $arg );
                                                    }
                                                    return _iWorker.validate.all( $( '[data-field-key]', $elm ).not( '[data-not-validate]' ) );
                                                },
                                                validateKeyup: function ( $arg, async ) {
                                                    if ( !( $arg instanceof $ ) )
                                                        throw new Error( "Argument should be jQuery instance!!!" );
                                                    return async === true ? _iWorker.validate.keyupAsync( $arg ) : _iWorker.validate.keyup( $arg );
                                                },
                                                createDropDown: function ( obj ) {
                                                    return _iWorker.createDropdown( obj );
                                                },
                                                _xhr: function ( cfg, s, e ) {
                                                    return $.ajax( cfg ).done( function ( data, status, xhr ) {
                                                        let errorCode = xhr.getResponseHeader( "x-response-error-code" ) || "";
                                                        if ( errorCode && errorCode !== null ) {
                                                            let err = parseInt( errorCode );
                                                            if ( err === 501 ) {
                                                                Sow.hook( "Manager" ).fire( "onSginOut", [] );
                                                                return;
                                                            }
                                                            e.call( _pages, {
                                                                error: true,
                                                                response: data
                                                            } );
                                                            return;
                                                        }
                                                        if ( data !== null && typeof ( data ) === 'object' && data.ret_val < 0 ) {
                                                            e.call( _pages, {
                                                                error: true,
                                                                response: data.ret_msg || "Error"
                                                            } );
                                                            data = undefined;
                                                            return;
                                                        }
                                                        s.call( _pages, {
                                                            error: false,
                                                            response: data
                                                        } );
                                                    } ).fail( function ( jqXHR, textStatus, error ) {
                                                        e.call( _pages, {
                                                            error: true,
                                                            jqXHR: jqXHR,
                                                            textStatus: textStatus,
                                                            response: error
                                                        } );
                                                    } );
                                                },
                                                xhr: function ( cfg ) {
                                                    cfg.done = typeof ( cfg.done ) !== 'function' ? function () { } : cfg.done;
                                                    cfg.fail = typeof ( cfg.fail ) !== 'function' ? function () { } : cfg.fail;
                                                    return _iWorker.xhr.post( {
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
                                                        fail: function ( jqXHR, textStatus, error ) {
                                                            cfg.fail.call( _pages, "ERROR", jqXHR, textStatus, error );
                                                        },
                                                    } );
                                                    return this;
                                                },
                                                populateDetail: function ( data, cb, $owner ) {
                                                    let tname = this.reg.info.search_detail.template;
                                                    Sow.async( function () {
                                                        let rfn = {
                                                            fn: function ( resp ) {
                                                                if ( !( $owner instanceof $ ) ) {
                                                                    $owner = $( '[data-body-part="result"]', $elm );
                                                                    $owner.children().remove();
                                                                }
                                                                $owner.htmla( resp );
                                                                //$owner.exit();
                                                                //$owner = undefined;
                                                                if ( typeof ( _pages.reg.info.search_detail.onRender ) === 'function' )
                                                                    _pages.reg.info.search_detail.onRender.call( _pages, _pages.require );
                                                                typeof ( cb ) === 'function' ? cb.call( _pages, "SUCCESS", $owner ) : undefined;
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
                                                                typeof ( cb ) === 'function' ? cb.call( _pages, "ERROR" ) : undefined;
                                                            } );
                                                        }
                                                    } );
                                                    return;
                                                },
                                                onSearch: function ( data, cb ) {
                                                    $( '[data-change-elm]', $elm ).removeClass( 'disabled' );
                                                    if ( this.reg.info.navigator && this._navigator ) {
                                                        if ( this.reg.info.search_detail.show ) {
                                                            this.populateDetail( data, function ( s, $tabel ) {
                                                                this._navigator.set_data( data, $tabel );
                                                                cb.call( this, s );
                                                            }, this._navigator.get_detail$() );
                                                            return;
                                                        }
                                                        this._navigator.set_data( data );
                                                        cb.call( this, s );
                                                        return;
                                                    }
                                                    if ( this.reg.info.has_master ) {
                                                        let row = data[0];
                                                        _iWorker.populateMaster.call( this, row, $( '[data-field-key]', $elm ) );
                                                        this.reg.info.primary_key.value = row[this.reg.info.primary_key.id];
                                                    } else {
                                                        if ( this.reg.info.primary_key.id ) {
                                                            this.reg.info.primary_key.value = data[0][this.reg.info.primary_key.id];
                                                        }
                                                    }
                                                    if ( this.reg.info.search_detail.show === true ) {
                                                        this.populateDetail( data, function () {
                                                            Sow.hook( this.reg.key ).firea( "__on_data_populate", data );
                                                            cb.apply( this, Array.prototype.slice.call( arguments, 0 ) );
                                                        } );
                                                        return;
                                                    } else {
                                                        Sow.hook( this.reg.key ).firea( "__on_data_populate", data );
                                                    }
                                                    typeof ( cb ) === 'function' ? cb.call( _pages ) : undefined;
                                                    return;
                                                }
                                            } );
                                            Object.extend( _pages, {
                                                __data_navigate: false,
                                                print_preview: function (id, val) {
                                                    let out_opt = this.reg.print_settings.call( this, id, val );
                                                    if ( typeof ( out_opt ) !== "object" )
                                                        throw new Error( "Invalid print_settings defined in print method....." );
                                                    _iWorker.print_preview( out_opt );
                                                    return this;
                                                },
                                                print: function ( cb ) {
                                                    if ( typeof ( this.reg.print_settings ) !== "function" ) {
                                                        cb.call( this, "ERROR" );
                                                        return;
                                                    }
                                                    if ( !this.reg.info.primary_key.value ) {
                                                        console.log( "Unable to print this document!!!" );
                                                        cb.call( this, "ERROR" );
                                                        return;
                                                    }
                                                    _iWorker.confirm( {
                                                        content: String.format( 'Are you sure to Print <b style="font-size:14px">{0}</b> ?', this.reg.info.primary_key.value ),
                                                        confirm: function () {
                                                            let out_opt = _pages.reg.print_settings.call( _pages, _pages.reg.info.primary_key.id, _pages.reg.info.primary_key.value );
                                                            if ( typeof ( out_opt ) !== "object" )
                                                                throw new Error( "Invalid print_settings defined in print method....." );
                                                            _iWorker.print_preview( out_opt );
                                                            cb.call( _pages, "SUCCESS", _pages.reg.info.primary_key.value );
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
                                                clear: function () {
                                                    _iWorker.clean( $( '[data-field-key]', $elm ) );
                                                    return this;
                                                },
                                                clean: function ( cb ) {
                                                    this.reg.info.primary_key.value = 0;
                                                    $( '[data-change-elm]', $elm ).addClass( 'disabled' );
                                                    _iWorker.clean( $( '[data-field-key]', $elm ) );
                                                    $( '[data-body-part="result"]', $elm ).children().remove().exit();
                                                    if ( this._navigator ) {
                                                        this._navigator.reset();
                                                    }
                                                    typeof ( cb ) === 'function' ? cb.call( this, "SUCCESS" ) : undefined;
                                                    return this;
                                                },
                                                save: function ( cb ) {
                                                    let formobj = _iWorker.validate.all( $( '[data-field-key]', $elm ) );
                                                    if ( formobj === null ) {
                                                        Sow.Show.e( "Required field should not left blank!!" );
                                                        cb.call( this, "ERROR" );
                                                        return;
                                                    }
                                                    formobj[this.reg.info.primary_key.id] = this.reg.info.primary_key.value;
                                                    let isUpdate = false;
                                                    if ( this.reg.info.primary_key.value ) {
                                                        isUpdate = true;
                                                    }
                                                    Object.nullify( formobj );
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
                                                                    if ( _pages._navigator ) {
                                                                        _pages._navigator.update( formobj );
                                                                    }
                                                                    formobj = undefined;
                                                                    Sow.Show.s( "Data has been Saved." );
                                                                    if ( !isUpdate ) {
                                                                        _pages.clean();
                                                                    }
                                                                    cb.call( _pages, "SUCCESS", isUpdate ); return;
                                                                },
                                                                fail: function ( xhr, status, message ) {
                                                                    $( '.page-loader-wrapper' ).fadeOut( "solow" );
                                                                    Sow.Show.e( message || "Error" );
                                                                    cb.call( _iWorker, "ERROR" ); return;
                                                                },
                                                            } );
                                                            return;
                                                        }, cancel: function () {
                                                            formobj = undefined;
                                                            cb.call( this, "ERROR" );
                                                        }
                                                    } );
                                                },
                                                search: function ( cb, obj ) {
                                                    if ( _pages._navigator ) {
                                                        _pages._navigator.reset();
                                                    } else {
                                                        if ( _pages.reg.info.has_detail ) {
                                                            $( '[data-body-part="result"] table tbody', $elm ).remove();
                                                        }
                                                    }
                                                    let def = {};
                                                    if ( _pages.cmd.s.type === "SQL" ) {
                                                        if ( !_pages.cmd.s.sql )
                                                            throw new Error( "No select statement found!!!" );
                                                        if ( typeof ( obj ) !== 'object' ) {
                                                            obj = _iWorker.getSearchObj( $( '[data-sql-field][data-search="true"]', $elm ) );
                                                        }
                                                        let where = "";
                                                        if ( Object.keys( obj ).length > 0 ) {
                                                            let whq = _iWorker.create_query.call( _pages, obj );
                                                            if ( "undefined" === typeof ( whq ) ) {
                                                                cb.call( _pages, "ERROR" );
                                                                return;
                                                            }
                                                            where = " where " + whq;
                                                        }
                                                        let sql = String.format( _pages.cmd.s.sql.replace( /\r\n/gi, "" ).replace( /\n/gi, "" ).replace( /\\t/gi, " " ).replace( /\s+/g, " " ), where );
                                                        sql = sql.trim();
                                                        where = obj = undefined;
                                                        def = {
                                                            sql: sql,
                                                            table: _pages.cmd.s.table,
                                                            schema: _pages.cmd.s.schema,
                                                        };
                                                    } else {
                                                        //{"poperty":"stakeholder_type_id","value":"3"}
                                                        if ( typeof ( obj ) === 'object' ) {
                                                            if ( typeof ( _pages.cmd.s.def_type ) === 'undefined' || _pages.cmd.s.def_type !== 'query' ) {
                                                                def = {
                                                                    param: ( function () {
                                                                        let out = [];
                                                                        for ( let p in obj )
                                                                            out.push( { "poperty": p, "value": obj[p] } );
                                                                        return out;
                                                                    }() )
                                                                };
                                                            } else {
                                                                let whq = _iWorker.create_query.call( _pages, obj );
                                                                if ( "undefined" === typeof ( whq ) ) {
                                                                    cb.call( _pages, "ERROR" );
                                                                    return;
                                                                }
                                                                def = {
                                                                    param: whq
                                                                };
                                                            }
                                                        } else {
                                                            if ( typeof ( _pages.cmd.s.def_type ) === 'undefined' || _pages.cmd.s.def_type !== 'query' ) {
                                                                def = {
                                                                    param: _iWorker.getSearchObj( $( '[data-field-key][data-search="true"]', $elm ), "array" )
                                                                };
                                                            } else {
                                                                obj = _iWorker.getSearchObj( $( '[data-field-key][data-search="true"]', $elm ), "object" );
                                                                let whq = _iWorker.create_query.call( _pages, obj );
                                                                if ( "undefined" === typeof ( whq ) ) {
                                                                    cb.call( _pages, "ERROR" );
                                                                    return;
                                                                }
                                                                def = {
                                                                    param: whq
                                                                };
                                                                obj = undefined;
                                                            } 
                                                        }
                                                    }
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
                                                                            if ( row.drop_type === "selectize" ) {
                                                                                let sel_set = Object.clone( row.drop_def );
                                                                                sel_set.options = typeof ( obj[p] ) === 'string' ? JSON.parse( obj[p] ) : obj[p];
                                                                                let $e = _pages.elements[row.owner].$elm;
                                                                                if ( typeof ( $e[0].selectize ) !== 'undefined' )
                                                                                    $e[0].selectize.destroy();
                                                                                else
                                                                                    $e.removeClass( 'form-control' );
                                                                                $e.selectize( sel_set ); $e.exit(); $e = undefined;
                                                                                continue;
                                                                            }
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
                                            /*if ( _pages.cmd.s.type === "SQL" ) {
                                                if ( _pages.cmd.s.sql ) {
                                                    _pages.cmd.s.sql = _pages.cmd.s.sql.replace( /\r\n/gi, "" ).replace( /\n/gi, "" ).replace( /\\t/gi, " " ).replace( /\s+/g, " " );
                                                }
                                            }*/
                                            Object.extend( _pages, {
                                                require: function ( fn ) {
                                                    if ( 'function' !== typeof ( fn ) )
                                                        throw new Error( "Invalid instance defined instead of Function" );
                                                    if ( typeof ( _pages ) === 'undefined' ) {
                                                        /*page disposed*/
                                                        return false;
                                                    };
                                                    return fn.call( _pages );
                                                }
                                            } );
                                            Object.extend( _pages, {
                                                notification: {
                                                    clean: function () {
                                                        _iWorker.notification.clean( $elm );
                                                        return this;
                                                    },
                                                    exit: function ( $el ) {
                                                        _iWorker.notification.exit( $el );
                                                        return this;
                                                    },
                                                    show: function ( msg, cls, interval ) {
                                                        return _iWorker.notification.show( $elm, msg, cls, interval );
                                                    }
                                                }
                                            } );
                                            $( '.window-content-body', $elm ).prepend( '<div data-msg-area="true"></div>' );
                                            $( '[data-field-key]', $elm ).not( '[data-not-include]' ).each( function () {
                                                _pages.getMap.call( _pages.elements, $( this ).attr( "data-field-key" ) );
                                            } );
                                            _pages.children = {};
                                            let link_settings = _iWorker.link.get_default_settings();
                                            link_settings.dependency = route;
                                            for ( let p in _pages.fm ) {
                                                let inf = _pages.fm[p];
                                                if ( inf.t === "html" ) {
                                                    delete _pages.fm[p]; continue;
                                                }
                                                if ( 'function' === typeof ( inf.external_link ) ) {
                                                    let ex_link_s = inf.external_link.call( Object.clone( link_settings ), _pages.require );
                                                    if ( typeof ( ex_link_s ) !== "object" )
                                                        throw new Error( "external_link settings are missing in " + inf.name );
                                                    _pages.children[inf.name] = ex_link_s;
                                                }
                                                if ( inf.t !== 'dropdown' ) continue;
                                                if ( inf.source === "OWN" ) continue;
                                                if ( typeof ( inf.source ) !== 'object' )
                                                    throw new Error( String.format( "Invalid source type defined instead of Object for ==>{0}", inf.name ) );
                                                if ( inf.source.drop_type === "selectize" )
                                                    _pages.set_dispose_prop( inf.name, inf.source.drop_type );
                                                if ( inf.source.load === false ) {
                                                    if ( inf.source.search_poperty )
                                                        _pages.drop_srch_map[inf.name] = inf.source.search_poperty;
                                                    if ( inf.source.drop_type !== "selectize" )
                                                        continue;
                                                    let sel_set = {};
                                                    if ( typeof ( inf.source.drop_def ) === "function" ) {
                                                        inf.source.drop_def.call( sel_set, _pages );
                                                    } else {
                                                        sel_set = Object.clone( inf.source.drop_def );
                                                    }
                                                    let $e = _pages.elements[inf.name].$elm;
                                                    if ( typeof ( $e[0].selectize ) !== 'undefined' )
                                                        $e[0].selectize.destroy();
                                                    else
                                                        $e.removeClass( 'form-control' );
                                                    $e.selectize( sel_set ); $e.exit(); $e = undefined;
                                                    continue;
                                                }
                                                if ( _pages.source.map[inf.source.poperty] ) {
                                                    _pages.source.map[inf.source.poperty].push( {
                                                        add_new: inf.source.add_new,
                                                        owner: inf.name,
                                                        drop_type: inf.source.drop_type || "select",
                                                        drop_def: Object.clone( inf.source.drop_def || {} )
                                                    } );
                                                } else {
                                                    _pages.source.map[inf.source.poperty] = [{
                                                        add_new: inf.source.add_new,
                                                        owner: inf.name,
                                                        drop_type: inf.source.drop_type || "select",
                                                        drop_def: Object.clone( inf.source.drop_def || {} )
                                                    }];
                                                }
                                                if ( inf.source.drop_def )
                                                    delete inf.source.drop_def;
                                                _pages.source.param.push( inf.source );
                                            }
                                            link_settings = undefined;
                                            $( 'select', $elm ).not( '[data-not-include]' ).on( "change", function ( e ) {
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
                                            $( '[data-validation-rules]', $elm ).not( 'select' ).on( "input", function ( e ) {
                                                _iWorker.validate.keyupAsync( $( this ) );
                                            } );
                                            $( '[data-switch="true"]', $elm ).on( 'click', function ( e ) {
                                                let $input = $( this ).parent().parent().find( 'input' );
                                                let val = $input.prop( 'checked' );
                                                $input.prop( 'checked', ( val === true ? false : true ) );
                                                $input.exit(); $input = undefined;
                                            } );
                                            if ( _pages.reg.info.navigator ) {
                                                Object.extend( _pages, { _navigator: _iWorker.export_navigator( _pages ) } );
                                            }
                                            if ( _pages.reg.info.search_detail.show ) {
                                                if ( typeof ( _pages.reg.info.search_detail.detail_event ) === 'object' ) {
                                                    if ( typeof ( _pages.reg.info.search_detail.detail_event.on_page_ready ) === 'function' ) {
                                                        _pages.reg.info.search_detail.detail_event.on_page_ready.call( _pages, $elm, _pages.require );
                                                    }
                                                } else {
                                                    if ( _pages.reg.info.search_detail.detail_event !== false ) {
                                                        _iWorker.event.register.detailEvent( $elm, _pages.reg.key, _pages.reg.info.navigator, _pages.require );
                                                        if ( _pages.reg.info.navigator ) {
                                                            Sow.hook( _pages.reg.key ).add( "__on_index_change", function ( index_key, $tr ) {
                                                                _pages._navigator.change_index( index_key, function () {
                                                                    $tr.closest( "tbody" ).find( ".active" ).removeClass( "active" );
                                                                    $tr.addClass( "active" ).css( {
                                                                        opacity: '0.0'
                                                                    } ).delay( 50 ).animate( {
                                                                        opacity: '1.0'
                                                                    }, 300 );
                                                                }, true );
                                                            } );
                                                        }
                                                    }
                                                }
                                            }
                                            ( function ( $e ) {
                                                if ( $e.length <= 0 ) return;
                                                $e.datepicker( {
                                                    dateFormat: 'yy-mm-dd',
                                                    prevText: '<i class="fa fa-chevron-left"></i>',
                                                    nextText: '<i class="fa fa-chevron-right"></i>',
                                                } ).not( '[data-default-value="false"]' ).val( Sow.date.get() );
                                            }( $( '[data-date-field]', $elm ) ) );
                                            if ( Object.keys( _pages.children ).length > 0 ) {
                                                /**[data-external-link]*/
                                                ( function ( $e ) {
                                                    if ( $e.length <= 0 ) return;
                                                    $e.on( "click", function ( e ) {
                                                        e.preventDefault();
                                                        let $ilink = $( this );
                                                        let prop = $ilink.attr( "data-external-link" );
                                                        if ( !prop ) return;
                                                        if ( !_pages.children[prop] ) return;
                                                        Sow.async( function () {
                                                            let child_obj = Object.clone( _pages.children[prop] );
                                                            let query = [];
                                                            if ( child_obj.param && typeof ( child_obj.param ) === "object" ) {
                                                                for ( let i = 0, l = child_obj.param.length; i < l; i++ ) {
                                                                    let p_prop = child_obj.param[i];
                                                                    if ( !p_prop ) continue;
                                                                    let p = _pages.elements[p_prop];
                                                                    if ( !p ) continue;
                                                                    let val = p.$elm.val();
                                                                    if ( !val ) continue;
                                                                    query.push( p_prop + "=" + encodeURIComponent( val ) );
                                                                }
                                                            } else if ( typeof ( child_obj.param ) === "function" ) {
                                                                query = child_obj.param.call( _pages );
                                                                if ( !query ) return;
                                                            }
                                                            if ( $.isArray( query ) ) {
                                                                if ( query.length > 0 )
                                                                    child_obj.route = child_obj.route + "?" + query.join( "&" );
                                                            }
                                                            Sow.hook( "__web__page" ).fire( "__open__new", [child_obj] );
                                                            child_obj = undefined;
                                                        } );
                                                    } );
                                                }( $( '[data-external-link]', $elm ) ) );
                                                /**[/data-external-link]*/
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
                                                                $towner.attr( "disabled", "disabled" ).addClass( "disabled" );
                                                            }
                                                            $towner.exit(); $towner = undefined;
                                                        } );
                                                        delete _pages.reg.toolbar.enabled;
                                                    }
                                                }
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
                                                if ( !_pages._navigator ) {
                                                    $( ".__tools", $elm ).parent().remove();
                                                } else {
                                                    $( ".__tools a", $elm ).not( '[data-task-type="navigator"]' ).remove();
                                                }
                                            }
                                            if ( _pages._navigator ) {
                                                $( ".__tools", $elm ).on( "click", function ( e ) {
                                                    Sow.Show.h();
                                                    let $owner = $( e.target );
                                                    let task = $owner.attr( 'data-name' );
                                                    if ( !task ) return;
                                                    if ( $owner.attr( 'data-task-type' ) === "navigator" ) {
                                                        if ( !_pages._navigator ) return;
                                                        if ( typeof ( _pages._navigator[task] ) !== 'function' ) return;
                                                        Sow.async( function () {
                                                            if ( typeof ( _pages ) === 'undefined' ) return;
                                                            //$owner.attr( "disabled", "disabled" );
                                                            _pages._navigator[task]( $owner );
                                                            //$owner.removeAttr( "disabled" );
                                                            $owner.exit(); $owner = undefined;
                                                        } );
                                                        return;
                                                    }
                                                    if ( typeof ( _pages[task] ) !== 'function' ) return;
                                                    if ( typeof ( _pages.reg.toolbar[task] ) === 'object' && typeof ( _pages.reg.toolbar[task]['before'] ) === 'function' )
                                                        _pages.reg.toolbar[task]['before'].call( this );
                                                    Sow.async( function () {
                                                        if ( typeof ( _pages ) === 'undefined' ) return;
                                                        $owner.attr( "disabled", "disabled" );
                                                        _pages[task]( function ( s, v ) {
                                                            if ( typeof ( this ) === 'undefined' ) return;
                                                            $owner.removeAttr( "disabled" );
                                                            if ( typeof ( this.reg.toolbar[task] ) === 'object' && typeof ( this.reg.toolbar[task]['after'] ) === 'function' )
                                                                this.reg.toolbar[task]['after'].call( this, s, v );
                                                        } );
                                                    } );
                                                } );
                                            }
                                            
                                            if ( _pages.source.param.length > 0 ) {
                                                _pages.loadDropDown( function () {
                                                    if ( typeof ( __pages[route].customEvent ) === 'function' )
                                                        __pages[route].customEvent( _pages.require );
                                                    __pages[route].onRender( _pages.require, _query );
                                                    //if ( _query.param[_pages.reg.info.primary_key.id] ) {
                                                    if ( Object.keys( _query.param ).length > 0 ) {
                                                        _pages.search( function () {
                                                            __cb.call( this, "LOADED" );
                                                        }, _query.param );
                                                    } else {
                                                        __cb.call( this, "LOADED" );
                                                    }
                                                } );
                                                return this;
                                            }
                                            if ( typeof ( __pages[route].customEvent ) === 'function' )
                                                __pages[route].customEvent( _pages.require );
                                            __pages[route].onRender( _pages.require, _query );
                                            //if ( _query.param[_pages.reg.info.primary_key.id] ) {
                                            if ( Object.keys( _query.param ).length > 0 ) {
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
                                } ),
                                dispose: function ( route, cb ) {
                                    if ( !__pages[route] ) {
                                        typeof ( cb ) === 'function' ? cb.call( this, "DONE" ) : undefined;
                                        return this;
                                    }
                                    let page = __pages[route];
                                    if ( $.isArray( page.ajax ) ) {
                                        let ajax = page.ajax;
                                        for ( let x = 0, l = ajax.length; x < l; x++ ) {
                                            if ( ajax[x] && "function" === typeof ( ajax[x].abort ) ) {
                                                ajax[x].abort();
                                            }
                                        }
                                        ajax = undefined;
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
                                        delete __dependency[route];
                                    }
                                    for ( let p in __dependency ) {
                                        if ( __dependency[p].find( function ( a ) { return a === route; } ) ) {
                                            let dindex = __dependency[p].indexOf( route );
                                            __dependency[p].splice( dindex, 1 );
                                        }
                                    }
                                    typeof ( cb ) === 'function' ? cb.call( this, "DONE" ) : undefined;
                                    return this;
                                }
                            };
                        }, function () {
                            var __worker = {
                                prepare_tab: function ( o, a, tab ) {
                                    if ( 'object' !== typeof ( o ) )
                                        throw new Error( "Invalid instance defined instead of Object" );
                                    let p = Object.keys( o )[0];
                                    if ( 'undefined' === typeof ( p ) )
                                        throw new Error( "No poperty key defined in Object" );
                                    let info = o[p];
                                    info.name = p;
                                    if ( "undefined" === typeof ( info.sql ) ) info.sql = info.name;
                                    info.tab = tab;
                                    a.push( info );
                                    return {
                                        p: p,
                                        v: info
                                    };
                                },
                                prepare: function ( o, a, b ) {
                                    if ( 'object' !== typeof ( o ) )
                                        throw new Error( "Invalid instance defined instead of Object" );
                                    let p = Object.keys( o )[0];
                                    if ( 'undefined' === typeof ( p ) )
                                        throw new Error( "No poperty key defined in Object" );
                                    let info = o[p];
                                    info.name = p;
                                    if ( "undefined" === typeof ( info.sql ) ) info.sql = info.name;
                                    a.push( info );
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
													<label for="{3}">{4}{11}:</label>
													<input type="text" data-field-key="{3}"{2}{10} class="form-control" placeholder="{5}" {6} {7} {8}{9} style="{12}"/>
													<span class="form-control-feedback" aria-hidden="true"></span>
												</div>
											</div>`, /*0*/info.w,
												/*1*/( info.disabled === true || info.read_only === true ? ' disabled' : '' ),
												/*2*/( info.disabled === true ? ' disabled="disabled"' : ( info.read_only === true ? 'readonly="true"' : "" ) ),
												/*3*/info.name,
												/*4*/info.title,
												/*5*/( info.p || "" ),
												/*6*/( info.attr || "" ),
												/*7*/( info.src === true ? ' data-search="true"' : "" ),
												/*8*/event_attr,
												/*9*/( 'object' === typeof ( info.rules ) ? " data-validation-rules='" + JSON.stringify( info.rules ) + "'" : "" ),
												/*10*/info.sql ? ' data-sql-field="' + ( info.sql === "O" ? info.name : info.sql ) + '"' : "",
                                                /*11*/( 'function' === typeof ( info.external_link ) ? String.format( ' (<i class="fa fa-external-link external-link" data-external-link="{0}"></i>)', info.name ) : "" ),
                                                /*12*/( info.style ? info.style : "" )
                                            ) );
                                        },
                                        date: function ( info ) {
                                            let event_attr = this.getEventAttr( info.event );
                                            return ( String.format( `
												<div class="col-sm-{0}">
													<div class="form-group has-feedback{1}">
														<label for="{3}">{4}:</label>
														<input type="text" data-field-key="{3}"{2}{9}{10} class="form-control" placeholder="{5}" data-date-field="true"{6} {7}{8}{10} style="{11}"/>
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
												/*9*/( info.sql ? ' data-sql-field="' + ( info.sql === "O" ? info.name : info.sql ) + '"' : "" ),
												/*10*/( info.default_value === false ? ' data-default-value="false"' : "" ),
                                                /*11*/( info.style ? info.style : "" )
                                            ) );
                                        },
                                        dropdown: function ( info ) {
                                            let drop = "";
                                            if ( info.data ) {
                                                for ( let x = 0, l = info.data.length; x < l; x++ ) {
                                                    let row = info.data[x];
                                                    for ( let p in row ) {
                                                        //let val = row[p];
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
														<label for="{3}">{4}{11}:</label>
														<select class="form-control"{2} data-toggle="tooltip" data-field-key="{3}" {5}{6} {7}{9}{10} style="{12}">
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
												/*10*/( info.sql ? ' data-sql-field="' + ( info.sql === "O" ? info.name : info.sql ) + '"' : "" ),
                                                /*11*/( 'function' === typeof ( info.external_link ) ? String.format( ' (<i class="fa fa-external-link external-link" data-external-link="{0}"></i>)', info.name ) : "" ),
                                                /*12*/( info.style ? info.style : "" )
                                            ) );
                                        },
                                        textarea: function ( info ) {
                                            let event_attr = this.getEventAttr( info.event );
                                            return ( String.format( `
												<div class="col-sm-{0}">
													<div class="form-group has-feedback{1}">
														<label for="{3}">{4}:</label>
														<textarea {2}style="height: 75px; border:solid 1px #428bca;" class="form-control" rows="10"  data-field-key="{3}" placeholder="{5}" {6} {7}{8}{9}></textarea>
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
                                                            throw new Error( String.format( "Row should not greater than 12 in tab ==>{0}", info.tab ) );

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
                                                        throw new Error( '"this footer" is not instanceof Object' );
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
                                                            throw new Error( String.format( "Row should not greater than 12 in row ==>{0}", ( i + 1 ) ) );
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

                                    let __inf = {
                                        fields: {},
                                        sql_def: {}
                                    };
                                    let _tabHeaderArr = [], _tabFooterArr = [], _bodyHeaderArr = [], _bodyFooterArr = [];
                                    if ( $.isArray( fm.header ) ) {
                                        fm.header.find( function ( o ) {
                                            let resp = __worker.prepare( o, _bodyHeaderArr );
                                            __inf.fields[resp.p] = resp.v;
                                            if ( typeof ( resp.v.sql_def ) === 'function' )
                                                __inf.sql_def[resp.p] = resp.v.sql_def;
                                            return false;
                                        } );
                                    }
                                    if ( $.isArray( fm.footer ) ) {
                                        fm.footer.find( function ( o ) {
                                            let resp = __worker.prepare( o, _bodyFooterArr );
                                            __inf.fields[resp.p] = resp.v;
                                            if ( typeof ( resp.v.sql_def ) === 'function' )
                                                __inf.sql_def[resp.p] = resp.v.sql_def;
                                            return false;
                                        } );
                                    }
                                    let tabs = {
                                        header: {},
                                        footer: {}
                                    };
                                    if ( $.isArray( fm.tabs.header ) ) {
                                        fm.tabs.header.find( function ( o ) {
                                            if ( $.isArray( o.fields ) ) {
                                                o.fields.find( function ( r ) {
                                                    let resp = __worker.prepare_tab( r, _tabHeaderArr, o.key );
                                                    __inf.fields[resp.p] = resp.v;
                                                    if ( typeof ( resp.v.sql_def ) === 'function' )
                                                        __inf.sql_def[resp.p] = resp.v.sql_def;
                                                } );
                                                tabs.header[o.key] = o.title;
                                            }
                                            return false;
                                        } );
                                        delete fm.tabs.header;
                                    }
                                    if ( $.isArray( fm.tabs.footer ) ) {
                                        fm.tabs.footer.find( function ( o ) {
                                            if ( $.isArray( o.fields ) ) {
                                                o.fields.find( function ( r ) {
                                                    let resp = __worker.prepare_tab( r, _tabFooterArr, o.key );
                                                    __inf.fields[resp.p] = resp.v;
                                                    if ( typeof ( resp.v.sql_def ) === 'function' )
                                                        __inf.sql_def[resp.p] = resp.v.sql_def;
                                                } );
                                                tabs.footer[o.key] = o.title;
                                            }
                                            return false;
                                        } );
                                        delete fm.tabs.footer;
                                    }
                                    ( function () {
                                        let $inst = $( '[data-body-part="header"]', $elm );
                                        this.tab.header( tabs.header, _tabHeaderArr, $inst.find( '.nav.nav-tabs' ), $inst.find( '.tab-content' ) );
                                        this.body.header( _bodyHeaderArr, $inst.find( '[data-body="header"]' ) );
                                        $inst.exit(); $inst = undefined;
                                        $inst = $( '[data-body-part="footer"]', $elm );
                                        this.tab.footer( tabs.footer, _tabFooterArr, $inst.find( '.nav.nav-tabs' ), $inst.find( '.tab-content' ) );
                                        this.body.footer( _bodyFooterArr, $inst.find( '[data-body="footer"]' ) );
                                        $inst.exit(); $inst = tabs = undefined;
                                    }.call( __worker.render ) );
                                    fm = _tabHeaderArr = _tabFooterArr = _bodyHeaderArr = _bodyFooterArr = undefined;
                                    return __inf;
                                }
                            };
                        } )
                    };
                }, {
                    'Sow.Net.Hub': 2,
                    'Sow.Net.Web.XHR': 7,
                    'Sow.Net.Web.Validate': 8,
                    'Sow.Net.Api': 9,
                    'Renderer': "Page.Renderer",
                    owner: 'Page.Renderer',
                    public: true
                }]
            }, {/**[cache]*/ }, /**[entry]*/["Page.Renderer"]];
        } ).mapPageNamespace( ["Sow.Net.Web.Page.Renderer"] );
    Sow.parse_param = function ( str ) {
        if ( str !== null && typeof ( str ) === 'object' ) return str;
        if ( !str || typeof ( str ) !== 'string' ) return undefined;
        try { return JSON.parse( decodeURIComponent( str ) ); } catch ( e ) { return undefined; }
    };
    if ( $.ui && typeof ( $.ui.dialog ) === "function" ) {
        $.ui.dialog.prototype.___destroy = function () {
            var names = Object.keys( this );
            for ( var i = 0, l = names.length; i < l; i++ ) {
                var key = names[i];
                if ( key !== "constructor" && key !== "prototype" && key !== "name" ) {
                    delete this[key];
                }
            }
        };
    }
    Sow.define( "Sow.Net.Web.Page.Renderer", function () {
        this.reRegisterNamespace( "Sow.Net.Web.Page.Renderer" );
        var _instance = this.exportNamespace( "Sow.Net.Web.Page.Renderer" );
        this.hook( "__web__page" ).add( "before_route_change", function ( a, c ) {
            if ( Sow.App.app_type_const === "S" ) {
                typeof ( c ) === "function" ? c.call( this, "SUCCESS" ) : undefined;
                return;
            };
            _instance.renderer.dispose( a, c );
            return;
        } ).add( "dispose", function ( a, c ) {
            _instance.renderer.dispose( a, c );
            return;
        } ).add( "on_route_change", function ( a, $b, script, c, isdialog, $ui ) {
            typeof ( c ) !== 'function' ? c = function () { } : undefined;
            _instance.renderer.script.append( a, script, function ( s ) {
                script = undefined;
                if ( s === "ERROR" ) {
                    $b = undefined;
                    c( "ERROR" );
                    return;
                }
                _instance.renderer.init( a, $b, c, isdialog, $ui );
            } );
        } ).add( "__open__new", function ( opt ) {
            _instance.renderer.openNew( opt );
            return;
        } ).add( "__transport", function ( route, obj ) {
            _instance.renderer.transportRequest( route, obj );
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
                    $container.htmla( resp ).find( '.error-description' ).html( oldResponse );
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
