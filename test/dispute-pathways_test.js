var URL = 'http://localhost:9999/test/acceptance/simulate-results.html';
var TITLE = 'Simulate results';

// turns an object into GET query string
function queryFromObject( params ) {
	var s = Object.keys( params ).map(function( key ) {
		return encodeURIComponent( key ) + '=' + encodeURIComponent( params[ key ]);
	}).join( '&' );
	return s.length ? '?' + s : '';
}


// Given a customer visits the tool,
// when they use the default web address
// then they will see the default form asking for their story
// and the form is not prefilled
casper.test.begin( 'form state', 11, function suite( test ) {
	casper.start( URL )
	.then(function() {
		var options;

		test.assertTitle( TITLE, 'loaded neighbourhood dispute page' );

		// questions for each story component are present
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
var states = [
	{ have: 'dispute',      'with': 'a neighbour',                      about: 'fences' },
	{ have: 'disagreement', 'with': 'a neighbour in my body corporate', about: 'common property (body corporate)' }
];
casper.each( states, function( self, state ) {
	casper.test.begin( 'search results state', 9, function suite( test ) {
		self.start( URL + queryFromObject( state ))
		.then(function() {
			test.assertTitle( TITLE, 'loaded neighbourhood dispute page' );
			// story is displayed
			test.assertExists( '.story', 'story is present' );
			test.assertSelectorHasText( '.story', 'I have a ' + state.have + ' with ' + state[ 'with' ] + ' about ' + state.about + '.' );

			test.assertExists( '.section.self', 'Self resolution section exists' );
			test.assertSelectorHasText( '.section.self h2', 'Try resolving the ' + state.have + ' yourself', 'self resolution heading is correct' );

			test.assertExists( '.section.assisted', 'Assisted resolution section exists' );
			test.assertSelectorHasText( '.section.assisted h2', 'Assistance resolving your ' + state.have, 'assisted resolution heading is correct' );

			test.assertExists( '.section.formal', 'Formal resolution section exists' );
			test.assertSelectorHasText( '.section.formal h2', 'Formal resolution to your ' + state.have, 'formal resolution heading is correct' );
		});

		self.run(function() {
			test.done();
		});
	});
});
// check results for fences
casper.test.begin( 'search results for fences', 8, function suite( test ) {
	casper.start( URL + queryFromObject({ have: 'dispute', 'with': 'a neighbour', about: 'fences' }))
	.then(function() {
		var options;

		test.assertTitle( TITLE, 'loaded neighbourhood dispute page' );

		// success message shown
		test.assertExists( '.status.success', 'success message is shown' );
		test.assertSelectorHasText( '.status.success h2', 'We have found 1 result', 'heading displays: 1 result' );

		// 1 result for self resolution present
		test.assertElementCount( '.self li', 1, '1 result for self resolution' );
		test.assertSelectorHasText( '.self li a', 'A', 'first result has correct title' );
		test.assertEquals( casper.getElementAttribute( '.self li a', 'href' ), 'http://www.example.com/a', 'first result has correct URL' );

	})

	.thenOpen( URL + queryFromObject({ have: 'dispute', 'with': 'a neighbour', about: 'dogs and other pets' }))
	.then(function() {
		// success message shown
		test.assertExists( '.status.success', 'success message is shown' );
		test.assertSelectorHasText( '.status.success h2', 'We have found 2 results', 'heading displays: 2 results' );

	});

	casper.run(function() {
		test.done();
	});
});


// Given a custom visits the tool,
// when the URL contains part of a story
// then they will see the form with those values prefilled
casper.test.begin( 'partial state prefills form', 21, function suite( test ) {
	casper.start()
	.thenOpen( URL + queryFromObject({ have: 'dispute' }), function() {
		test.assertTitle( TITLE, 'loaded neighbourhood dispute page' );

		// questions for each story component are present
		test.assertExists( 'select[name="have"]', 'question exists: have' );
		test.assertField( 'have', 'dispute', 'I have a dispute (is prefilled)' );
		test.assertExists( 'select[name="with"]', 'question exists: with' );
		test.assertField( 'with', '', 'with ___ (is blank)' );
		test.assertExists( 'select[name="about"]', 'question exists: about' );
		test.assertField( 'about', '', 'about ___ (is blank)' );
	})
	.thenOpen( URL + queryFromObject({ have: 'dispute', 'with': 'a neighbour' }), function() {
		test.assertTitle( TITLE, 'loaded neighbourhood dispute page' );

		// questions for each story component are present
		test.assertExists( 'select[name="have"]', 'question exists: have' );
		test.assertField( 'have', 'dispute', 'I have a dispute (is prefilled)' );
		test.assertExists( 'select[name="with"]', 'question exists: with' );
		test.assertField( 'with', 'a neighbour', 'with a neighbour (is prefilled)' );
		test.assertExists( 'select[name="about"]', 'question exists: about' );
		test.assertField( 'about', '', 'about ___ (is blank)' );
	})
	.thenOpen( URL + queryFromObject({ about: 'fences' }), function() {
		test.assertTitle( TITLE, 'loaded neighbourhood dispute page' );

		// questions for each story component are present
		test.assertExists( 'select[name="have"]', 'question exists: have' );
		test.assertField( 'have', '', 'I have a ___ (is blank)' );
		test.assertExists( 'select[name="with"]', 'question exists: with' );
		test.assertField( 'with', '', 'with ___ (is blank)' );
		test.assertExists( 'select[name="about"]', 'question exists: about' );
		test.assertField( 'about', 'fences', 'about fences (is prefilled)' );
	});

	casper.run(function() {
		test.done();
	});
});


// Given the customer visits the tool
// when there are invalid values in the URL
// then they are ignored (treated as blank/unsupplied)
casper.test.begin( 'invalid values in URL ignored', 14, function suite( test ) {
	casper.start()
	.thenOpen( URL + queryFromObject({ have: 'foo', 'with': 'bar', about: 'baz' }), function() {
		test.assertTitle( TITLE, 'loaded neighbourhood dispute page' );

		// questions for each story component are present
		test.assertExists( 'select[name="have"]', 'question exists: have' );
		test.assertField( 'have', '', 'I have ___ (is blank)' );
		test.assertExists( 'select[name="with"]', 'question exists: with' );
		test.assertField( 'with', '', 'with ___ (is blank)' );
		test.assertExists( 'select[name="about"]', 'question exists: about' );
		test.assertField( 'about', '', 'about ___ (is blank)' );
	})
	.thenOpen( URL + queryFromObject({ have: 'dispute', 'with': 'a neighbour', about: 'baz' }), function() {
		test.assertTitle( TITLE, 'loaded neighbourhood dispute page' );

		// questions for each story component are present
		test.assertExists( 'select[name="have"]', 'question exists: have' );
		test.assertField( 'have', 'dispute', 'I have a dispute (is prefilled)' );
		test.assertExists( 'select[name="with"]', 'question exists: with' );
		test.assertField( 'with', 'a neighbour', 'with a neighbour (is prefilled)' );
		test.assertExists( 'select[name="about"]', 'question exists: about' );
		test.assertField( 'about', '', 'about ___ (is blank)' );
	});

	casper.run(function() {
		test.done();
	});
});


// Given a customer is viewing results,
// when they select a result and return to tool,
// then they should see the same results

// Given a customer is viewing results,
// when they go back to the form
// then they should see the form prefilled
casper.test.begin( 'back button behaves as expected', 19, function suite( test ) {
	casper.start()

	.thenOpen( URL, function() {
		test.assertTitle( TITLE, 'loaded neighbourhood dispute page' );
		// questions for each story component are present
		test.assertExists( 'select[name="have"]', 'question exists: have' );
		test.assertExists( 'select[name="with"]', 'question exists: with' );
		test.assertExists( 'select[name="about"]', 'question exists: about' );

		casper.fill( '#dispute-pathways-view form', { have: 'dispute', 'with': 'a neighbour', about: 'fences' });
		casper.click( '#dispute-pathways-view .actions strong input' );
	})

	// wait for querystring in URL
	.waitForUrl( '?' )

	.then(function() {
		test.assertTitle( TITLE, 'loaded neighbourhood dispute page' );
		// 1 result for self resolution present
		test.assertElementCount( '.self li', 1, '1 result for self resolution' );
		test.assertSelectorHasText( '.self li a', 'A', 'first result has correct title' );
		test.assertEquals( casper.getElementAttribute( '.self li a', 'href' ), 'http://www.example.com/a', 'first result has correct URL' );

		casper.click( '.self li a' );
	})

	.waitForUrl( 'example.com' )
	.back()
	.waitForUrl( 'localhost' )

	.then(function() {
		test.assertTitle( TITLE, 'loaded neighbourhood dispute page' );
		// 1 result for self resolution present
		test.assertElementCount( '.self li', 1, '1 result for self resolution' );
		test.assertSelectorHasText( '.self li a', 'A', 'first result has correct title' );
		test.assertEquals( casper.getElementAttribute( '.self li a', 'href' ), 'http://www.example.com/a', 'first result has correct URL' );
	})

	.back()
	// no querystring
	.waitForUrl( /html$/ )

	.then(function() {
		test.assertTitle( TITLE, 'loaded neighbourhood dispute page' );
		// questions for each story component are present
		test.assertExists( 'select[name="have"]', 'question exists: have' );
		test.assertField( 'have', 'dispute', 'I have a dispute (is prefilled)' );
		test.assertExists( 'select[name="with"]', 'question exists: with' );
		test.assertField( 'with', 'a neighbour', 'with a neighbour (is prefilled)' );
		test.assertExists( 'select[name="about"]', 'question exists: about' );
		test.assertField( 'about', 'fences', 'about fences (is prefilled)' );
	});

	casper.run(function() {
		test.done();
	});
});


// Given the customer has not completed all form fields,
// when they submit the form,
// then the form status should be shown
casper.test.begin( 'form validation integration', 6, function suite( test ) {
	casper.start()

	.thenOpen( URL, function() {
		test.assertTitle( TITLE, 'loaded neighbourhood dispute page' );
		// questions for each story component are present
		test.assertExists( 'select[name="have"]', 'question exists: have' );
		test.assertExists( 'select[name="with"]', 'question exists: with' );
		test.assertExists( 'select[name="about"]', 'question exists: about' );

		casper.fill( '#dispute-pathways-view form', { have: '', 'with': '', about: '' });
		casper.click( '#dispute-pathways-view .actions strong input' );

		// 1 result for self resolution present
		test.assertExists( '.warn', 'form validation warning is shown' );
		test.assertSelectorHasText( '.warn h2', 'Please check your answers', 'form validation warning is displayed' );
	});


	casper.run(function() {
		test.done();
	});
});