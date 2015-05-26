/* global Handlebars */
(function( $ ) {
	'use strict';

	// current page url
	var story = $.url().param();

	story.complete = story.have && story[ 'with' ] && story.about;

	var template = Handlebars.compile( $( story.complete ? '#results-template' : '#form-template' ).html() );

	if ( story.complete ) {
		$( '#dispute-pathways-view' ).text( 'RESULTS' );
	} else {
		$( '#dispute-pathways-view' ).html( template() );
	}


}( jQuery ));
