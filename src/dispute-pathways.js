/* global Handlebars */
(function( $ ) {
	'use strict';

	var model = {
		have: [],
		'with': [],
		about: []
	};
	var story = {};

	// handlebars helpers

	// set selected options
	// http://stackoverflow.com/questions/13046401/how-to-set-selected-select-option-in-handlebars-template
	Handlebars.registerHelper( 'select', function( value, options ) {
		var $el = $( '<select />' ).html( options.fn( this ));
		$el.find( '[value="' + value + '"]' ).attr({ 'selected' : 'selected' });
		return $el.html();
	});


	// map values: lower case for display
	function mapToOption( s ) {
		return { label: s, value: s };
	}
	// create a query string from a hash
	function queryFromObject( params ) {
		var s = Object.keys( params ).map(function( key ) {
			return params[ key ].length ? encodeURIComponent( key ) + '=' + encodeURIComponent( params[ key ]) : null;
		}).join( '&' );
		return s.length ? '?' + s : '';
	}


	// render view
	function render( view, viewModel ) {
		var template = Handlebars.compile( $( '#' + view + '-template' ).html() );
		$( '#dispute-pathways-view' ).html( template( viewModel ));
	}


	// build the app model from the data
	function constructModel( data ) {
		var mappedData = $.map( data, function( record ) {
			var explode;

			// convert { have: 'a;b;c;' } to { have: { a: true, b: true, c: true }}
			$.each([ 'have', 'with', 'about' ], function( i, key ) {
				explode = record[ key ].toLowerCase().split( /\s*;\s*/ );
				record[ key ] = {};
				$.each( explode, function( j, value ) {
					record[ key ][ value ] = true;
				});
			});

			return record;
		});
		console.log( 'mapped data', mappedData );

		// TODO get lists of options from data
		model = {
			have: [ 'question', 'concern', 'problem', 'issue', 'disagreement', 'conflict', 'complaint', 'dispute' ],
			'with': [ 'a neighbour', 'a neighbour in my body corporate', 'a neighbour in my building', 'a neighbour in my street', 'a neighbour next door', 'an adjoining landowners', 'another unit owner/lot owner', 'someone in my neighbourhood', 'the body corporate' ],
			about: [ 'abuse', 'access', 'behaviours', 'by-law breaches (body corporate)', 'cameras', 'children', 'common property (body corporate)', 'dogs and other pets', 'drainage', 'easements', 'fences', 'harassment', 'lighting', 'noise', 'objects', 'overgrown gardens', 'parking', 'pools', 'privacy', 'renovations', 'retaining walls', 'rubbish bins', 'security', 'smells', 'threats', 'trees', 'wildlife' ]
		};

		// alphabetical order for with and about
		model[ 'with' ].sort();
		model.about.sort();
	}


	function checkStoryIsComplete() {
		// current page url
		story = $.url().param();

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
		return story.have && story[ 'with' ] && story.about;
	}


	// show results
	function renderResults() {
		render( 'results', { story: story });
	}

	// show the form
	function renderForm() {
		render( 'form', {
			story: story,
			form: {
				haveOptions: $.map( model.have, mapToOption ),
				withOptions: $.map( model[ 'with' ], mapToOption ),
				aboutOptions: $.map( model.about, mapToOption )
			}
		});
	}


	// when data was successfully loaded
	function loadedData( data ) {
		constructModel( data.result.records );
		var storyComplete = checkStoryIsComplete();

		if ( storyComplete ) {
			renderResults();
		} else {
			renderForm();
		}
	}


	// when an error occurs loading data
	function handleDataError() {
		render( 'error' );
	}


	// get data
	$.ajax( 'https://staging.data.qld.gov.au/api/action/datastore_search?resource_id=56ac21ba-3de3-421a-ac40-297713e37e9d', {
		cache: true,
		data: { limit: 500 }, // CKAN default limit is 100
		datatype: 'jsonp'
	})
	.done( loadedData )
	.error( handleDataError );


}( jQuery ));
