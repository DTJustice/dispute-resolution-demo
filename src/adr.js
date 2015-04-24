// JSONP receiver
var getAlternativeDisputeResolutionData;


(function() {
	'use strict';


	var data, disputeType = [], party = [], disputeSubject = [];

	getAlternativeDisputeResolutionData = function( d ) {
		function createOptionsFromArray( item ) {
			var span = document.createElement( 'span' );
			span.textContent = item; // escape HTML
			return '<option>' + span.innerHTML + '</option>';
		}

		data = d;

		for ( var i = 0, len = d.length; i < len; i++ ) {
			// ES6: let, exploder
			var disputeTypeValues = d[ i ].disputeType.split( /\s*;\s*/ );
			var partyValues = d[ i ].party.split( /\s*;\s*/ );
			var disputeSubjectValues = d[ i ].disputeSubject.split( /\s*;\s*/ );

			disputeType = disputeType.concat( disputeTypeValues.filter(function( item ) {
				return disputeType.indexOf( item ) === -1;
			}));
			party = party.concat( partyValues.filter(function( item ) {
				return party.indexOf( item ) === -1;
			}));
			disputeSubject = disputeSubject.concat( disputeSubjectValues.filter(function( item ) {
				return disputeSubject.indexOf( item ) === -1;
			}));
		}

		disputeType.sort();
		party.sort();
		disputeSubject.sort();

		// create option elements from arrays
		// easy to do with angular scope variable and ng-repeat
		// what about backbone? angular2?
		document.getElementById( 'dispute-level-list' ).innerHTML = disputeType.map( createOptionsFromArray ).join( '' );
		document.getElementById( 'party-type-list' ).innerHTML = party.map( createOptionsFromArray ).join( '' );
		document.getElementById( 'dispute-type-list' ).innerHTML = disputeSubject.map( createOptionsFromArray ).join( '' );
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
