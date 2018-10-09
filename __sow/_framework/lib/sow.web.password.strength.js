/**
* Copyright (c) 2018, SOW (https://www.facebook.com/safeonlineworld). (https://github.com/RKTUXYN) All rights reserved.
* @author {SOW}
* @description {sow.web.password.strength.js}
* @example { }
* Copyrights licensed under the New BSD License.
* See the accompanying LICENSE file for terms.
*/
( typeof window.Sow.define !== 'function'
|| typeof window.Sow.registerNamespace !== 'function'
? console.error( 'sow.web.password.strength.js couldn\'t be initilize. One of its dependency `Sow.Frameworkjs` couldn\t load properly... Please re-try...' )
: ( ( Sow.registerNamespace(/**[Namespace Name]*/'Sow.Web.Password.Strength', function () {
	return /**[modules]*/[{
		/** [Public instance module] */
		1: [function ( require, module, exports ) {
			var p_worker = {
				checkMark: function ( msg, mark ) {
					let strength, status = true;
					switch ( mark ) {
						case 1: strength = '<b style="color: rgb(255, 56, 106);"> Password strength: Weak...</b>'; break;
						case 2: strength = '<b style="color: rgb(255, 56, 106);"> Password strength: Semi-weak...</b>'; break;
						case 3: strength = '<b style="color:#00d977"> Password strength: Medium...</b>'; break;
						case 4: strength = '<b style="color:#00d977"> Password strength: Strong...</b>'; break;
						default: status = false; break;
					}
					return { status: status/*[is valid or not]*/, cur_strength: strength/**[strength msg]*/, req_msg: msg/**[required msg]*/, mark: mark/**[strength mark]*/ };
				},
				check: function ( value ) {
					if ( null === value || !value || value === "" ) {
						let msg = "";
						for ( let p in this.setting ) {
							msg += String.format( '<b style="color: rgb(255, 56, 106);">{0}</b>', this.setting[p].msg );
						}
						return { status: false/*[is valid or not]*/, cur_strength: '<b style="color: rgb(255, 56, 106);"> Password strength: Required...</b>'/**[strength msg]*/, req_msg: msg/**[required msg]*/, mark: 0/**[strength mark]*/ };
					}
					if ( "string" !== typeof ( value ) )
						throw new Error( String.format( "Invalid value defined instead of {0}", typeof ( value ) ) );

					let msg = "", mark = 0, c = 0;
					for ( let i in p_worker.setting ) {
						if ( !p_worker.setting[i]['rgx'].test( value ) ) {
							if ( c === 3 ) {
								msg += String.format( '<d style="color:rgba(219, 177, 177, 0.96)">[*] {0}</d>', p_worker.setting[i]['msg'] );
								c++; continue;
							}
							msg += String.format( '<d style="color:rgba(219, 177, 177, 0.96)">[*] {0},</d></br>', p_worker.setting[i]['msg'] );
							c++; continue;
						}
						if ( c === 3 ) {
							msg += String.format( '<img src="/__sow/images/accept.png" /> <d style="color:green">{0}</d>', p_worker.setting[i]['msg'] );
							mark++; c++; continue;
						}
						msg += String.format( '<img src="/__sow/images/accept.png" /> <d style="color:green">{0},</d></br>', p_worker.setting[i]['msg'] );
						mark++; c++;
					}
					return p_worker.checkMark( msg, mark );
				},
				setting: {
					n: { rgx: /[0-9]/, msg: '1 Numeric character' },
					c: { rgx: /[A-Z]/, msg: '1 Alphabet character' },
					s: { rgx: /[a-z]/, msg: '1 Small character' },
					sp: { rgx: /[@#$\.%^&+=]/, msg: '1 Special character' },
				}
			};

			return {
				register: function ( selector, cb, clean ) {
					let $inst = $( selector );
					this.$ = function () {
						return $inst;
					};
					if ( $inst.length <= 0 )
						throw new Erorr( String.format( "No element found the given selector {0}", selector ) );
					var hascb = typeof ( cb ) === 'function';
					$inst.on( 'keyup', function ( e ) {
						e.preventDefault();
						let $el = $( this );
						Sow.async( function () {
							$el.next().remove();
							let rsp = p_worker.check( $el.val() );
							if ( hascb ) {
								cb.call( $el, rsp );
								$el = undefined;
								return;
							}
							$el.after( '<small data-type="___msg" class="form-text error"> ' + rsp.req_msg + '</small >' );
							$el = undefined;
							return;
						}, 0 );
						return;
					} );
					if ( clean === true )
						$inst = undefined;
					return;
				},
				check: function ( value ) {
					return p_worker.check( value );
				}
			};

		}, {
			public: true,
			owner: 'Sow.Web.Password.Strength'
		}]
	}, {/**[cache]*/ }, /**[entry]*/[1]];
} ) ) ) );