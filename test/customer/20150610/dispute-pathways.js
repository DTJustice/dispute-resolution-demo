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

	// pluralise
	// https://github.com/wycats/handlebars.js/issues/249
	Handlebars.registerHelper( 'pluralize', function( number, single, plural ) {
		if ( number === 1 ) {
			return single;
		} else {
			return plural;
		}
	});

	// handle a/an
	Handlebars.registerHelper( 'vowelSound', function( phrase, vowelPhrase, consonantPhrase ) {
		if ( /^[aeiou]/.test( phrase )) {
			return vowelPhrase;
		} else {
			return consonantPhrase;
		}
	});


	// map values: lower case for display
	function mapToOption( s ) {
		return { label: s, value: s };
	}


	// render view
	function render( view, viewModel ) {
		var template = Handlebars.compile( $( '#' + view + '-template' ).html() );
		var viewContainer = $( '#dispute-pathways-view' );

		viewContainer
		// hide it
		.relevance( 'relevant', false )
		// update it
		.html( template( viewModel ));

		// datatables init
		var dataTables = $( '.data-table', viewContainer );
		$( '.even, .odd', dataTables ).removeClass( 'even odd' );
		dataTables.dataTable({
			lengthChange: false,
			pageLength: 3,
			pagingType: 'simple_numbers',
			order: [[ 2, 'desc' ]],
			searching: false,
			saveState: true,
			stripeClasses: [ 'even', 'odd' ]
		});

		viewContainer
		// show view
		.relevance( 'relevant', true )
		// SWE template reflow
		.trigger( 'x-height-change' );
	}


	// replace template with rendered content
	function renderInPlace( view, viewModel ) {
		var templateElement = $( '#' + view + '-template' );
		var template = Handlebars.compile( templateElement.html() );

		templateElement.replaceWith( template( viewModel ))
		// SWE template reflow
		.trigger( 'x-height-change' );
	}


	// build the app model from the data
	function constructModel( data ) {
		mappedData = $.map( data, function( record ) {
			var explode;

			// convert { have: 'a;b;c;' } to { have: { a: true, b: true, c: true }}
			$.each([ 'have', 'with', 'about', 'pathway' ], function( i, key ) {
				explode = record[ key ] ? record[ key ].toLowerCase().split( /\s*;\s*/ ) : [];
				record[ key ] = {};
				$.each( explode, function( j, value ) {
					if ( value.length ) {
						record[ key ][ value ] = true;
					}
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
		$.each([ 'have', 'with', 'about' ], function( i, key ) {
			if ( story[ key ] && model[ key ].indexOf( story[ key ]) === -1 ) {
				delete story[ key ];
			}
		});

		// do we have a complete story?
		return story.have && story[ 'with' ] && story.about;
	}


	// find matches by pathway
	function findMatchesByPathway() {
		results = {
			self: [],
			assisted: [],
			formal: [],
			legislation: [],
			totalMatches: 0
		};

		$.each( mappedData, function( i, result ) {
			if ( result[ 'with' ][ story[ 'with' ]] && result.about[ story.about ]) {
				if ( result.documentType === 'legislation' ) {
					results.legislation.push( result );
				} else {
					results.totalMatches++;
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
			}
		});
	}


	// choose which results are relevant
	function relevantResults( id, scroll ) {
		scroll = scroll !== false;
		id = $( id );

		$( '.section', '#dispute-pathways-view' ).not( id )
		.addClass( 'irrelevant' )
		.find( '.data-table, .search-results' ).hide();

		id.removeClass( 'irrelevant' )
		.find( '.data-table, .search-results' ).show();

		if ( scroll ) {
			$( 'html, body' ).animate({
				scrollTop: id.offset().top
			}, 200 );
		}
	}


	// behaviour of links in summary
	$( document ).on( 'click', '.success a', function() {
		relevantResults( this.href.replace( /^[^#]*/, '' ));
	});


	// toggle section by clicking h2
	$( document ).on( 'click', '.section h2', function() {
		relevantResults( '#' + $( this ).closest( '.section' ).attr( 'id' ));
	});


	// show results
	function renderResults() {
		if ( results.legislation ) {
			// create asides
			renderInPlace( 'aside-legislation', { results: results });
		}
		render( 'results', { story: story, results: results });

		// hide sections
		relevantResults( '#self-resolution', false );
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

		// enable form validation polyfill
		// https://github.com/qld-gov-au/swe_template/blob/master/src/qgov/assets/v2/script/initialise-forms.js#L8
		window.initConstraintValidationAPI();
		$( 'form' ).formValidation( 'validate' );
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
		History.pushState( getStateFromForm( this ));
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
