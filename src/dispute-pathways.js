(function( $ ) {
	'use strict';

	// current page url
	var story = $.url().param();

	story.complete = story.have && story[ 'with' ] && story.about;

	if ( story.complete ) {
		$( '#dispute-pathways-view' ).text( 'RESULTS' );
	} else {
		$( '#dispute-pathways-view' ).text( 'FORM' );
	}


}( jQuery ));
