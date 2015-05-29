var URL = 'http://localhost:9999/test/acceptance/simulate-noscript.html';

// Given a customer visits the tool
// when they have javascript disabled
// then they will see a helpful message
casper.test.begin( 'test noscript experience (js disabled)', 2, function suite( test ) {
	casper.options.pageSettings.javascriptEnabled = false;
	casper.start( URL )
	.then(function() {
		// Note: the casperjs test API relies on PhantomJS javascript being enabled
		// these methods are reliable when testing title and page content with js disabled
		test.assertEquals( casper.page.title, 'Simulate noscript', 'loaded test page' );
		test.assertMatch( casper.page.plainText, /Javascript not detected/, 'noscript message is shown with js disabled' );
	});

	casper.run(function() {
		test.done();
	});
});


// verify message is NOT present when javascript is enabled
casper.test.begin( 'test noscript experience (js enabled)', 2, function suite( test ) {
	casper.options.pageSettings.javascriptEnabled = true;
	casper.start( URL )
	.then(function() {
		test.assertTitle( 'Simulate noscript', 'loaded test page' );
		// Note: need to manually remove <noscript> or test API will find contents
		casper.evaluate(function() { jQuery( 'noscript' ).remove(); });
		test.assertSelectorDoesntHaveText( '#dispute-pathways-view', 'Javascript not detected', 'noscript message is NOT shown with js enabled' );
	});

	casper.run(function() {
		test.done();
	});
});
