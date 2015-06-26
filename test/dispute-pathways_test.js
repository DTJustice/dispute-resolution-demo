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
casper.test.begin( 'form state', 15, function suite( test ) {
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

		// with and about options are pulled from data, sorted alphabetically (first option is blank)
		test.assertElementCount( 'select[name="with"] > option', 6, '6 options for with' );
		options = casper.getElementsInfo( 'select[name="with"] > option' ).map(function( info ) { return info.text; });
		test.assertEquals( options.slice( 1 ), options.slice( 1 ).sort(), 'with options are in alphabetical order' );
		test.assertEquals( options.slice( 1 ), [ 'a neighbour', 'apple', 'banana', 'the body corporate', 'zebra' ], 'with options extracted and trimmed correctly' );

		test.assertElementCount( 'select[name="about"] > option', 7, '7 options for about' );
		options = casper.getElementsInfo( 'select[name="about"] > option' ).map(function( info ) { return info.text; });
		test.assertEquals( options.slice( 1 ), options.slice( 1 ).sort(), 'about options are in alphabetical order' );
		test.assertEquals( options.slice( 1 ), [ 'cricket', 'dogs and other pets', 'fences', 'noise', 'soccer', 'tennis' ], 'about options extracted and trimmed correctly' );
	})

	.run(function() {
		test.done();
	});
});


// Given the customer chooses a pathway that contains council resources,
// then they will be given the option to select their council (use relevance on form)
casper.test.begin( 'council question relevance', 12, function suite( test ) {
	casper.start( URL )
	.then(function() {
		// council question is present but not visible
		test.assertExists( '#dispute-pathways-view .questions > li:nth-child(4) #dispute-pathway-council', 'council question exists' );
		test.assertNotVisible( '#dispute-pathways-view .questions > li:nth-child(4)', 'council question is hidden' );

		// question becomes relevance for pathway: with a neighbour about dogs and other pets
		casper.fill( '#dispute-pathways-view form', { 'with': 'a neighbour' });
		casper.evaluate(function() {
			$( '#dispute-pathways-view form' ).change();
		});
	})

	.then(function() {
		test.assertNotVisible( '#dispute-pathways-view .questions > li:nth-child(4)', 'council question is hidden after selecting "a neighbour"' );

		casper.fill( '#dispute-pathways-view form', { 'about': 'dogs and other pets' });
		casper.evaluate(function() {
			$( '#dispute-pathways-view form' ).change();
		});
	})

	.then(function() {
		test.assertVisible( '#dispute-pathways-view .questions > li:nth-child(4)', 'council question is visible (a neighbour, dogs and other pets)' );
		test.assertSelectorHasText( '#dispute-pathways-view .questions > li:nth-child(4) .label', 'Some disputes about dogs and other pets are handled by your local council. We can help you find the right information if you tell us where you live:', 'Correct label for council question' );
		test.assertElementCount( 'select[name="council"] option', 3, '3 council options available' );
		test.assertSelectorHasText( 'select[name="council"] option:nth-child(2)', 'A Council', 'Correct option for first council' );
		test.assertSelectorHasText( 'select[name="council"] option:nth-child(3)', 'Another Council', 'Correct option for second council' );

		casper.fill( '#dispute-pathways-view form', {
			'have': 'issue',
			'about': 'noise'
		});
		casper.evaluate(function() {
			$( '#dispute-pathways-view form' ).change();
		});
	})

	.then(function() {
		test.assertVisible( '#dispute-pathways-view .questions > li:nth-child(4)', 'council question is visible (a neighbour, noise)' );
		test.assertSelectorHasText( '#dispute-pathways-view .questions > li:nth-child(4) .label', 'Some issues about noise are handled by your local council. We can help you find the right information if you tell us where you live:', 'Correct label for council question' );
		test.assertElementCount( 'select[name="council"] option', 2, '2 council options available' );
		test.assertSelectorHasText( 'select[name="council"] option:nth-child(2)', 'A third council', 'Correct option for third council' );
	})

	.run(function() {
		test.done();
	});
});


// Given a customer visits the tool,
// when the URL contains a complete story
// then they will see search results
casper.test.begin( 'search results behaviour', 49, function suite( test ) {

	casper.start( URL + queryFromObject({ have: 'dispute', 'with': 'a neighbour', about: 'fences' }))
	.then(function() {
		test.assertTitle( TITLE, 'loaded neighbourhood dispute page' );
		test.assertSelectorHasText( '.story', 'I have a dispute with a neighbour about fences', 'story is correct (fences)' );

		test.assertExists( '.status.success', 'success message is shown (fences)' );
		test.assertSelectorHasText( '.status.success h2', 'We have found 1 option about fences', 'heading displays: 1 result' );
		test.assertElementCount( '.success li', 1, 'one list item (fences)' );
		test.assertSelectorHasText( '.success li a', '1 resource for resolving the dispute yourself', 'status text for self resolution (fences)' );
		test.assertSelectorDoesntHaveText( '.success', 'for getting help to resolve your', 'assisted resolution status not present (fences)' );
		test.assertSelectorDoesntHaveText( '.success', 'about formal resolution of your', 'formal resolution status not present (fences)' );
		test.assertSelectorDoesntHaveText( '#asides', 'Check the law', 'Check the law aside is not present' );
		// test story boolean hooks
		test.assertSelectorHasText( '#dispute-pathways-view', 'CUSTOM CONTENT FOR \'WITH A NEIGHBOUR\'', 'custom content for a neighbour shows (fences)'  );
		test.assertSelectorDoesntHaveText( '#dispute-pathways-view', 'CUSTOM CONTENT FOR ABOUT ANYTHING, EXCEPT \'FENCES\'', 'custom content for not-fences hidden (fences)' );

		// only self resolution section is shown
		test.assertExists( '#self-resolution', 'Self resolution section is present (fences)' );
		test.assertDoesntExist( '#assisted-resolution', 'Assisted resolution section is NOT present (fences)' );
		test.assertDoesntExist( '#formal-resolution', 'Formal resolution section is NOT present (fences)' );

		// 1 result for self resolution present
		test.assertElementCount( '.self tbody tr', 1, '1 result for self resolution' );
		test.assertSelectorHasText( '.self a', 'A', 'first result has correct title' );
		test.assertEquals( casper.getElementAttribute( '.self a', 'href' ), 'http://www.example.com/a', 'first result has correct URL' );
	})

	.thenOpen( URL + queryFromObject({ have: 'dispute', 'with': 'a neighbour', about: 'dogs and other pets' }))
	.then(function() {
		test.assertSelectorHasText( '.story', 'I have a dispute with a neighbour about dogs and other pets', 'story is correct (dogs)' );
		test.assertExists( '.status.success', 'success message is shown (dogs)' );
		test.assertSelectorHasText( '.status.success h2', 'We have found 2 options about dogs and other pets', 'heading displays: 2 results' );
		test.assertExists( '#assisted-resolution', 'Assisted resolution section is present (dogs)' );
		test.assertDoesntExist( '#self-resolution', 'Self resolution section is NOT present (dogs)' );
		test.assertSelectorDoesntHaveText( '.success', 'yourself', 'self resolution status not present (dogs)' );
		test.assertSelectorDoesntHaveText( '.success', 'about formal resolution of your', 'formal resolution status not present (dogs)' );
		test.assertDoesntExist( '#formal-resolution', 'Formal resolution section is NOT present (dogs)' );
		test.assertElementCount( '.success li', 1, 'one list item (dogs)' );
		test.assertSelectorHasText( '.success li a', '2 resources for getting help to resolve your dispute', 'status text for assisted resolution (dogs)' );
		// test story boolean hooks
		test.assertSelectorHasText( '#dispute-pathways-view', 'CUSTOM CONTENT FOR \'WITH A NEIGHBOUR\'', 'custom content for a neighbour shows (dogs)' );
		test.assertSelectorHasText( '#dispute-pathways-view', 'CUSTOM CONTENT FOR ABOUT ANYTHING, EXCEPT \'FENCES\'', 'custom content not-fences shows for dogs' );
	})

	.thenOpen( URL + queryFromObject({ have: 'issue', 'with': 'the body corporate', about: 'noise' }))
	.then(function() {
		test.assertSelectorHasText( '.story', 'I have an issue with the body corporate about noise', 'story is correct (noise)' );
		test.assertExists( '.status.success', 'success message is shown (noise)' );
		test.assertSelectorHasText( '.status.success h2', 'We have found 9 options about noise', 'heading displays: 9 results' );
		test.assertElementCount( '#dispute-pathways-view .section', 3, 'three sections (noise)' );
		test.assertExists( '#self-resolution', 'Self resolution section is present (noise)' );
		test.assertExists( '#assisted-resolution', 'Assisted resolution section is present (noise)' );
		test.assertExists( '#formal-resolution', 'Formal resolution section is present (noise)' );
		test.assertSelectorHasText( '.success li:nth-child(1)', '3 resources for resolving the issue yourself', 'status text for self resolution (noise)' );
		test.assertSelectorHasText( '.success li:nth-child(2)', '6 resources for getting help to resolve your issue', 'status text for assisted resolution (noise)' );
		test.assertSelectorHasText( '.success li:nth-child(3)', '1 resource about formal resolution of your issue', 'status text for formal resolution (noise)' );
		test.assertSelectorDoesntHaveText( '#dispute-pathways-view tbody', 'legislation', 'no legislation results shown in tables' );
		test.assertSelectorHasText( '.aside.tip:nth-child(2) h2', 'Check the law', 'legislation aside is present' );
		test.assertSelectorHasText( '.aside.tip:nth-child(2) li', 'J', 'legislation link is present in aside' );
		// test story boolean hooks
		test.assertSelectorDoesntHaveText( '#dispute-pathways-view', 'CUSTOM CONTENT FOR \'WITH A NEIGHBOUR\'', 'custom content for neighbour does not show for body corporate' );
		test.assertSelectorHasText( '#dispute-pathways-view', 'CUSTOM CONTENT FOR ABOUT ANYTHING, EXCEPT \'FENCES\'', 'custom content not-fences shows for noise' );

		// check initial state of datatable
		test.assertSelectorHasText( '#assisted-resolution tr:last-child', 'form', 'form result is last' );
		test.assertSelectorHasText( '#assisted-resolution tbody tr:last-child a:first-child', 'F', 'F is last' );
		// click to sort by title
		casper.click( '#assisted-resolution thead th:first-child' );
		test.assertSelectorHasText( '#assisted-resolution tbody tr:last-child a:first-child', 'L', 'table was sorted' );

		// click to second page in datatable
		casper.click( '#assisted-resolution .next' );
		test.assertElementCount( '#assisted-resolution tbody tr', 1, '1 row shown on second page' );
		test.assertSelectorHasText( '#assisted-resolution tbody tr a', 'M', '1 row shown on second page' );

		// follow link
		casper.click( '#assisted-resolution tbody tr:last-child td:first-child a' );
	})

	// TODO datatable state is not remembered?

	// navigate away then back
	// .waitForUrl( 'example.com' )
	// .back()
	// .waitForUrl( 'localhost' )

	// .then(function() {
	// 	// datatable should remember sort order and page
	// 	test.assertDoesntExist( '#assisted-resolution .next', 'datatable remembers second page' );
	// 	test.assertSelectorHasText( '#assisted-resolution tbody tr a', 'M', 'datatable remembers state' );
	// })

	.run(function() {
		test.done();
	});
});


// Given the customer has specified a council (in the URL),
// then results relating to that council will be included
casper.test.begin( 'council results', 11, function suite( test ) {
	casper.start()
	.thenOpen( URL + queryFromObject({ have: 'dispute', 'with': 'a neighbour', about: 'dogs and other pets', council: 'A Council' }), function() {
		test.assertSelectorHasText( '.story', 'I have a dispute with a neighbour about dogs and other pets', 'story is correct (dogs)' );
		test.assertExists( '.status.success', 'success message is shown (dogs)' );
		test.assertSelectorHasText( '.status.success h2', 'We have found 3 options about dogs and other pets', 'heading displays: 3 results (A Council)' );
		test.assertSelectorHasText( '#assisted-resolution', 'A Council', 'council result shown (A Council)' );
		test.assertSelectorDoesntHaveText( '#assisted-resolution', 'Another Council', 'council result from Another Council NOT shown (A Council)' );
	})

	.thenOpen( URL + queryFromObject({ have: 'dispute', 'with': 'a neighbour', about: 'dogs and other pets', council: 'Another Council' }), function() {
		test.assertSelectorHasText( '.status.success h2', 'We have found 3 options about dogs and other pets', 'heading displays: 3 results (Another Council)' );
		test.assertSelectorHasText( '#assisted-resolution', 'Another Council', 'council result shown (Another Council)' );
		test.assertSelectorDoesntHaveText( '#assisted-resolution', 'A Council', 'council result from A Council NOT shown (Another Council)' );
	})

	.thenOpen( URL + queryFromObject({ have: 'dispute', 'with': 'a neighbour', about: 'dogs and other pets', council: 'Unknown Council' }), function() {
		test.assertSelectorHasText( '.status.success h2', 'We have found 2 options about dogs and other pets', 'heading displays: 2 results (Unknown Council)' );
		test.assertSelectorDoesntHaveText( '#assisted-resolution', 'A Council', 'council result from A Council NOT shown (Unknown Council)' );
		test.assertSelectorDoesntHaveText( '#assisted-resolution', 'Another Council', 'council result from Another council NOT shown (Unknown Council)' );
	})

	.run(function() {
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
	})

	.run(function() {
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
	})

	.run(function() {
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
		test.assertElementCount( '.self tbody tr', 1, '1 result for self resolution' );
		test.assertSelectorHasText( '.self a', 'A', 'first result has correct title' );
		test.assertEquals( casper.getElementAttribute( '.self a', 'href' ), 'http://www.example.com/a', 'first result has correct URL' );

		casper.click( '.self a' );
	})

	.waitForUrl( 'example.com' )
	.back()
	.waitForUrl( 'localhost' )

	.then(function() {
		test.assertTitle( TITLE, 'loaded neighbourhood dispute page' );
		// 1 result for self resolution present
		test.assertElementCount( '.self tbody tr', 1, '1 result for self resolution' );
		test.assertSelectorHasText( '.self a', 'A', 'first result has correct title' );
		test.assertEquals( casper.getElementAttribute( '.self a', 'href' ), 'http://www.example.com/a', 'first result has correct URL' );
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
	})

	.run(function() {
		test.done();
	});
});


// Given the user is filling out the form,
// when they answer all questions
// and there are no matching results
// then a message is displayed and suggested similar stories are shown and no link to view results is visible
casper.test.begin( 'no results message', 2, function suite( test ) {
	casper.start()

	.thenOpen( URL + queryFromObject({ have: 'question', 'with': 'a neighbour', about: 'cricket' }), function() {
		test.assertTitle( TITLE, 'loaded neighbourhood dispute page' );
		test.assertSelectorHasText( '.warn h2', 'Your search for cricket did not return any results' );
	})

	.run(function() {
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
	})

	.run(function() {
		test.done();
	});
});