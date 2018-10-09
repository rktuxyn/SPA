/**
* Copyright (c) 2018, SOW (https://www.facebook.com/safeonlineworld). (https://github.com/RKTUXYN) All rights reserved.
* @author {SOW}
* @description {sow.api.hub.default.js}
* @example { }
* Copyrights licensed under the New BSD License.
* See the accompanying LICENSE file for terms.
*/
( function () {
	Sow.usingNamespace( 'Sow.Net.Hub' );
	Sow.hook( "Manager" ).add( "onSginOut", function ( a ) {
		location.href = "/sginout.aspx?path=/&next=task";
	} );
	Sow.exportNamespace( 'Sow.Net.Hub' ).init( {
		pingInterval: 300000,
		waitForPageLoad: true,
		jsonp: false,
		withCredentials: true,
		loging: false,
		transport: 'webSockets'
	} ).start().done( () => {
		console.log( 'CONNECTED' );
	} ).fail( () => {
		console.log( 'NOT_CONNECTED' );
	} );
}() );