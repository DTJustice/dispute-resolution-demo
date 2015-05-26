var DEFAULT_URL = 'http://localhost/law/legal-mediation-and-justice-of-the-peace/setting-disputes-out-of-court/neighbourhood-mediation/neighbourhood-dispute-resolution/';
var STORY1_QUERY = '?have=dispute&with=a%20neighbour&about=fences';

// Given a customer visits the tool,
// when they use the default web address
// then they will see the default form asking for their story
casper.test.begin( 'form state', 4, function suite( test ) {
	casper.start( DEFAULT_URL, function() {
		test.assertTitle( 'Neighbourhood dispute resolution | Your rights, crime and the law | Queensland Government', 'loaded neighbourhood dispute page' );

		// questions for each story component are present
		test.assertExists( 'select[name="have"]', 'question exists: I have a' );
		test.assertExists( 'select[name="with"]', 'question exists: with' );
		test.assertExists( 'select[name="about"]', 'question exists: about' );

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
