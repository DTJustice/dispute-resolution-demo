/* global Handlebars, History */
(function( $ ) {
	'use strict';

	var RESULTS_PER_PAGE = 5;

	var model;
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

	// map keys in hash to array of unique values
	function mapHashKeysToArray( value, key ) {
		return key.length ? key : null;
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
			dom: '<"top"i>rt<"bottom"p><"clear">',
			language: {
				info: 'Displaying results <strong>_START_</strong>–<strong>_END_</strong> of <strong>_TOTAL_</strong>'
			},
			lengthChange: false,
			pageLength: RESULTS_PER_PAGE,
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
		model = {
			'with': {},
			about: {}
		};

		mappedData = $.map( data, function( record ) {
			var explode;

			// convert { with: 'a;b;c;' } to { with: { a: true, b: true, c: true }}
			$.each([ 'with', 'about', 'pathway' ], function( i, key ) {
				explode = record[ key ] ? record[ key ].toLowerCase().split( /\s*;\s*/ ) : [];
				record[ key ] = {};
				$.each( explode, function( j, value ) {
					if ( value.length ) {
						record[ key ][ value ] = true;
					}
					// capture with/about terms
					if ( i < 2 ) {
						model[ key ][ value ] = true;
					}
				});
			});

			return record;
		});

		// alphabetical order for with and about
		model[ 'with' ] = $.map( model[ 'with' ], mapHashKeysToArray ).sort();
		model.about = $.map( model.about, mapHashKeysToArray ).sort();
	}


	function checkStoryIsComplete() {
		var complete;

		// current page url
		story = $.url().param();

		// check against valid values
		$.each([ 'with', 'about' ], function( i, key ) {
			if ( story[ key ] && model[ key ].indexOf( story[ key ]) === -1 ) {
				delete story[ key ];
			}
		});

		complete = story.have && story[ 'with' ] && story.about;

		if ( complete ) {
			story[ 'have_' + story.have.replace( /\s+/g, '_' )] = true;
			story[ 'with_' + story[ 'with' ].replace( /\s+/g, '_')] = true;
			story[ 'about_' + story.about.replace( /\s+/g, '_' )] = true;
		}

		// do we have a complete story?
		return complete;
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
			if ( result.about[ story.about ] && result[ 'with' ][ story[ 'with' ]]) {
				// filter council results
				if ( ! /Council|City|Town/i.test( result.publisher ) || result.publisher === story.council ) {
					// separate legislation results
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
			}
		});
	}


	// show results
	function renderResults() {
		if ( results.legislation ) {
			// create asides
			renderInPlace( 'aside-legislation', { results: results });
		}
		render( results.totalMatches > 0 ? 'results' : 'no-results', { story: story, results: results });
	}

	// show the form
	function renderForm() {
		// grab template for councils
		var councilQuestionTemplate = Handlebars.compile( $( $( '#form-template' ).html() ).find( '#dispute-pathway-council' ).closest( 'li' ).html() );

		// render initial form
		render( 'form', {
			story: $.extend( story, History.getState().data ),
			form: {
				withOptions: $.map( model[ 'with' ], mapToOption ),
				aboutOptions: $.map( model.about, mapToOption )
			}
		});

		// enable form validation polyfill
		// https://github.com/qld-gov-au/swe_template/blob/master/src/qgov/assets/v2/script/initialise-forms.js#L8
		window.initConstraintValidationAPI();
		$( 'form' ).formValidation( 'validate' );

		var councilQuestion = $( '#dispute-pathway-council' ).closest( 'li' );
		var form = councilQuestion.closest( 'form' );

		// find relevant councils
		function councilRelevance() {
			var withValue = $( form[ 0 ][ 'with'] ).val();
			var aboutValue = $( form[ 0 ].about ).val();
			var councils = {};

			if ( withValue && aboutValue ) {
				$.each( mappedData, function( i, result ) {
					if ( /Council|City|Town/i.test( result.publisher ) && result.about[ aboutValue ] && result[ 'with' ][ withValue ]) {
						councils[ result.publisher ] = true;
					}
				});
			}
			// update council options
			councils = $.map( councils, mapHashKeysToArray ).sort();
			if ( councils.length > 0 ) {
				councilQuestion.html( councilQuestionTemplate({
					story: $.extend( {}, story, {
						have: $( form[ 0 ].have ).val() || 'dispute',
						'with': withValue,
						about: aboutValue
					}),
					form: { councilOptions: $.map( councils, mapToOption ) }
				}));
			}
			councilQuestion.relevance( 'relevant', councils.length > 0 );
		}
		$( form ).on( 'change', 'select[name="with"],select[name="about"]', councilRelevance );

		// council question initial state
		councilRelevance();
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
			about:  $( 'select[name="about"]', form ).val(),
			council:  $( 'select[name="council"]', form ).val()
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
