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