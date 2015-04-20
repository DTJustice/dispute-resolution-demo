// JSONP receiver
var getAlternativeDisputeResolutionData;


(function() {
	'use strict';


	var data, disputeLevel = [], partyType = [], disputeType = [];

	getAlternativeDisputeResolutionData = function( d ) {
		function createOptionsFromArray( item ) {
			var span = document.createElement( 'span' );
			span.innerText = item; // escape HTML
			return '<option>' + span.innerHTML + '</option>';
		}

		data = d;

		for ( var i = 0, len = d.length; i < len; i++ ) {
			// ES6: let, exploder
			var level = d[ i ].Level.split( /\s*;\s*/ );
			var party = d[ i ].Party.split( /\s*;\s*/ );
			var type = d[ i ].Dispute.split( /\s*;\s*/ );

			disputeLevel = disputeLevel.concat( level.filter(function( item ) {
				return disputeLevel.indexOf( item ) === -1;
			}));
			partyType = partyType.concat( party.filter(function( item ) {
				return partyType.indexOf( item ) === -1;
			}));
			disputeType = disputeType.concat( type.filter(function( item ) {
				return disputeType.indexOf( item ) === -1;
			}));
		}

		disputeLevel.sort();
		partyType.sort();
		disputeType.sort();

		// create option elements from arrays
		// easy to do with angular scope variable and ng-repeat
		// what about backbone? angular2?
		document.getElementById( 'dispute-level-list' ).innerHTML = disputeLevel.map( createOptionsFromArray ).join( '' );
		document.getElementById( 'party-type-list' ).innerHTML = partyType.map( createOptionsFromArray ).join( '' );
		document.getElementById( 'dispute-type-list' ).innerHTML = disputeType.map( createOptionsFromArray ).join( '' );
	};



	function calculateWidth( event ) {
		var input = event.target;
		var width = input.value.length || input.placeholder.length || 20;
		input.style.width = ( Math.ceil( width / 2 ) + 2 ) + 'em';
	}


	function setInputWidth( event ) {
		var input = event.target;
		input.style.width = '12em';
	}


	var inputs = document.querySelectorAll( '.madlibs input' );

	// adjust size of madlibs text boxes
	Array.prototype.forEach.call( inputs, function( input ) {
		input.addEventListener( 'change', calculateWidth );
		input.addEventListener( 'focus', setInputWidth );
		calculateWidth({ target: input });
	});

}());
