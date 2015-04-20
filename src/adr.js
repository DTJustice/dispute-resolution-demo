(function() {
	'use strict';


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
