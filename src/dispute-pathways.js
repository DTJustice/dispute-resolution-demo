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


	// current page url
	var story = $.url().param();
	story.complete = story.have && story[ 'with' ] && story.about;

	// route template
	var template = Handlebars.compile( $( story.complete ? '#results-template' : '#form-template' ).html() );

	// TODO get lists of options from data
	var model = {
		have: [ 'Question', 'Concern', 'Problem', 'Issue', 'Disagreement', 'Conflict', 'Complaint', 'Dispute' ],
		'with': [ 'a neighbour', 'a neighbour in my body corporate', 'a neighbour in my building', 'a neighbour in my street', 'a neighbour next door', 'an adjoining landowners', 'another unit owner/lot owner', 'someone in my neighbourhood', 'the body corporate' ],
		about: [ 'Abuse', 'Access', 'Behaviours', 'By-law breaches (body corporate)', 'Cameras', 'Children', 'Common property (body corporate)', 'Dogs and other pets', 'Drainage', 'Easements', 'Fences', 'Harassment', 'Lighting', 'Noise', 'Objects', 'Overgrown gardens', 'Parking', 'Pools', 'Privacy', 'Renovations', 'Retaining walls', 'Rubbish bins', 'Security', 'Smells', 'Threats', 'Trees', 'Wildlife' ]
	};

	// alphabetical order for with and about
	model[ 'with' ].sort();
	model.about.sort();

	// map values: lower case for display
	function mapToOption( s ) {
		return { label: s.toLowerCase(), value: s.toLowerCase() };
	}


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
