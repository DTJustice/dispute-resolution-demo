/* global Handlebars */
(function( $ ) {
	'use strict';

	// handlebars helpers

	// set selected options
	// http://stackoverflow.com/questions/13046401/how-to-set-selected-select-option-in-handlebars-template
	Handlebars.registerHelper( 'select', function( value, options ) {
		var $el = $( '<select />' ).html( options.fn( this ));
		$el.find( '[value="' + value + '"]' ).attr({ 'selected' : 'selected' });
		return $el.html();
	});

	// TODO get lists of options from data
	var model = {
		have: [ 'question', 'concern', 'problem', 'issue', 'disagreement', 'conflict', 'complaint', 'dispute' ],
		'with': [ 'a neighbour', 'a neighbour in my body corporate', 'a neighbour in my building', 'a neighbour in my street', 'a neighbour next door', 'an adjoining landowners', 'another unit owner/lot owner', 'someone in my neighbourhood', 'the body corporate' ],
		about: [ 'abuse', 'access', 'behaviours', 'by-law breaches (body corporate)', 'cameras', 'children', 'common property (body corporate)', 'dogs and other pets', 'drainage', 'easements', 'fences', 'harassment', 'lighting', 'noise', 'objects', 'overgrown gardens', 'parking', 'pools', 'privacy', 'renovations', 'retaining walls', 'rubbish bins', 'security', 'smells', 'threats', 'trees', 'wildlife' ]
	};

	// alphabetical order for with and about
	model[ 'with' ].sort();
	model.about.sort();

	// map values: lower case for display
	function mapToOption( s ) {
		return { label: s, value: s };
	}
	function queryFromObject( params ) {
		var s = Object.keys( params ).map(function( key ) {
			return params[ key ].length ? encodeURIComponent( key ) + '=' + encodeURIComponent( params[ key ]) : null;
		}).join( '&' );
		return s.length ? '?' + s : '';
	}


	// current page url
	var story = $.url().param();

	// check against valid values
	if ( story.have && model.have.indexOf( story.have ) === -1 ) {
		delete story.have;
	}
	if ( story[ 'with' ] && model[ 'with' ].indexOf( story[ 'with' ] ) === -1 ) {
		delete story[ 'with' ];
	}
	if ( story.about && model.about.indexOf( story.about ) === -1 ) {
		delete story.about;
	}
	// redirect if parameter was invalid
	var queryString = queryFromObject( story );
	if ( window.location.search !== queryString ) {
		if ( queryString.length > 0 ) {
			window.location.search = queryString;
		} else if ( window.location.search.length > 0 ) {
			window.location.href = window.location.href.replace( /\?.*$/, '' );
		}
	}

	// do we have a complete story?
	story.complete = story.have && story[ 'with' ] && story.about;

	// route template
	var template = Handlebars.compile( $( story.complete ? '#results-template' : '#form-template' ).html() );


	// update view
	if ( story.complete ) {
		// show results
		$( '#dispute-pathways-view' ).html(template({ story: story }));

	} else {
		// show form
		$( '#dispute-pathways-view' ).html(template({
			story: story,
			form: {
				haveOptions: $.map( model.have, mapToOption ),
				withOptions: $.map( model[ 'with' ], mapToOption ),
				aboutOptions: $.map( model.about, mapToOption )
			}
		}));
	}


}( jQuery ));
