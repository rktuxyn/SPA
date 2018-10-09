Sow.registerNamespace(/**[settings]*/'Sow.Net.Web.default', function () {
	var isConnected = false;
	return /**[modules]*/[{
		//[Extend VIEW]
		100: [function ( require, module, exports ) {

			return module.aggregate( function () {
				return {
					onExecuteIo: function ( a, b, c ) {
						if ( typeof ( this[c] ) === 'function' )
							this[c]( a, b );
					},
					onSignalRReady: function ( c, a, b, s ) {
						console.log( arguments ); isConnected = true;
						/**this.server.executeIo( c.call( this, function () {
							console.log( arguments );
						} ), "client._check", JSON.stringify( { a: 1, b: 2 } ) );*/
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
					ready: function ( a ) {
						console.log( a );
						require( 'Sow.Net.Web.Data' ).a( "I'm Ready..." );
					},
					onLoad: function ( a ) {
						if ( a === "FIRST_LOADED" ) return;
						console.log( a );
					},
				};
			} );

		}, {
			'Sow.Net.Web.Controller': 3,
			'Sow.Net.Hub': 2,
			'Sow.Net.Web.Data': 4,
			'Sow.Net.Web.View': 5
		}],
		102: [function ( require, module, exports ) {

			return module.aggregate( function () {
				return {
					onPageLoad: function ( a ) {
						require( 'Sow.Net.Hub' ).execute( true, function ( c ) {
							if ( c === "NOT_CONNECTED" ) return;
							/**this.server.executeIo( c.call( this, function () {
								console.log( arguments );
							} ), "client._check", JSON.stringify( { a: 1, b: 2 } ) );*/
							this.server.onTaskEnd( c.call( this, function () {
								console.log( arguments );
							} ), 'Welcome!!!' );
						} );
						console.log( a );
					},
				};
			} );

		}, {
			'Sow.Net.Hub': 2,
		}]
	}, {/**[cache]*/ }, /**[entry]*/[100, 101]];
} ).mapPageNamespace();