/* global Handlebars, History */
(function( $ ) {
	'use strict';

	var model = {
		have: [],
		'with': [],
		about: []
	};
	var mappedData, results;
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
		mappedData = $.map( data, function( record ) {
			var explode;

			// convert { have: 'a;b;c;' } to { have: { a: true, b: true, c: true }}
			$.each([ 'have', 'with', 'about', 'pathway' ], function( i, key ) {
				explode = record[ key ].toLowerCase().split( /\s*;\s*/ );
				record[ key ] = {};
				$.each( explode, function( j, value ) {
					record[ key ][ value ] = true;
				});
			});

			return record;
		});

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


	// find matches by pathway
	function findMatchesByPathway() {
		results = {
			self: [],
			assisted: [],
			formal: []
		};

		$.each( mappedData, function( i, result ) {
			if ( result.have[ story.have ] && result[ 'with' ][ story[ 'with' ]] && result.about[ story.about ]) {
				if ( result.pathway[ 'self resolution' ]) {
					results.self.push( result );
				}
				if ( result.pathway[ 'assisted resolution' ]) {
					results.assisted.push( result );
				}
				if ( result.pathway[ 'formal resolution' ]) {
					results.formal.push( result );
				}
			}
		});
	}


	// show results
	function renderResults() {
		render( 'results', { story: story, results: results });
	}

	// show the form
	function renderForm() {
		render( 'form', {
			story: $.extend( story, History.getState().data ),
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
			// organise results by pathway
			findMatchesByPathway();
			renderResults();
		} else {
			renderForm();
		}
	}


	// when an error occurs loading data
	function handleDataError() {
		render( 'error' );
	}


	// get state from form
	function getStateFromForm( form ) {
		form = $( form );
		return {
			have:   $( 'select[name="have"]', form ).val(),
			'with': $( 'select[name="with"]', form ).val(),
			about:  $( 'select[name="about"]', form ).val()
		};
	}

	// when form is submitted
	$( document ).on( 'submit', '#dispute-pathways-view form', function() {
		// update history state
		History.replaceState( getStateFromForm( this ));
		// passthrough (do not prevent default)
	});


	// get data
	function init() {
		// infer API uri from source metadata
		var source = $( 'meta[name="DCTERMS.source"]' ).attr( 'content' );
		// extract UUID
		var uuid = source.replace( /^.*?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}).*$/, '$1' );
		var host = $.url( source );
		host = host.attr( 'protocol' ) + '://' + host.attr( 'host' );

		$.ajax( host + '/api/action/datastore_search', {
			cache: true,
			data: {
				resource_id: uuid,
				// CKAN default limit is 100
				limit: 500
			},
			datatype: 'jsonp'
		})
		.done( loadedData )
		.error( handleDataError );
	}

	init();


}( jQuery ));
