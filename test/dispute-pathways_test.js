var DEFAULT_URL = 'http://localhost/law/legal-mediation-and-justice-of-the-peace/setting-disputes-out-of-court/neighbourhood-mediation/neighbourhood-dispute-resolution/';
var STORY1_QUERY = '?have=dispute&with=a%20neighbour&about=fences';

// Given a customer visits the tool,
// when they use the default web address
// then they will see the default form asking for their story
// and the form is not prefilled
casper.test.begin( 'form state', 11, function suite( test ) {
	casper.start( DEFAULT_URL, function() {
		var options;

		test.assertTitle( 'Neighbourhood dispute resolution | Your rights, crime and the law | Queensland Government', 'loaded neighbourhood dispute page' );

		// questions for each story component are present
		// test.assertFieldName( 'have', '', 'question exists: I have a', { formSelector: '#content form' });
		test.assertExists( 'select[name="have"]', 'question exists: have' );
		test.assertField( 'have', '', 'I have a ___ (is blank)' );
		test.assertExists( 'select[name="with"]', 'question exists: with' );
		test.assertField( 'with', '', 'with ___ (is blank)' );
		test.assertExists( 'select[name="about"]', 'question exists: about' );
		test.assertField( 'about', '', 'about ___ (is blank)' );

		// have list is in priority order (ignore first blank option)
		test.assertSelectorHasText( 'select[name="have"] > option:nth-child(2)', 'question', 'first option is "question"' );
		test.assertSelectorHasText( 'select[name="have"] > option:last-child', 'dispute', 'last option is "dispute"' );

		// with and about lists are in alphabetical order (ignore first blank option)
		options = casper.getElementsInfo( 'select[name="with"] > option' ).map(function( info ) { return info.text; });
		test.assertEquals( options.slice( 1 ), options.slice( 1 ).sort(), 'with options are in alphabetical order' );
		options = casper.getElementsInfo( 'select[name="about"] > option' ).map(function( info ) { return info.text; });
		test.assertEquals( options.slice( 1 ), options.slice( 1 ).sort(), 'about options are in alphabetical order' );


	});

	casper.run(function() {
		test.done();
	});
});

// Given a customer visits the tool,
// when the URL contains a complete story
// then they will see search results
casper.test.begin( 'search results state', 2, function suite( test ) {
	casper.start( DEFAULT_URL + STORY1_QUERY, function() {
		test.assertTitle( 'Neighbourhood dispute resolution | Your rights, crime and the law | Queensland Government', 'loaded neighbourhood dispute page' );
		test.assertSelectorHasText( '#dispute-pathways-view', 'RESULTS', 'loaded results view' );
	});

	casper.run(function() {
		test.done();
	});
});
