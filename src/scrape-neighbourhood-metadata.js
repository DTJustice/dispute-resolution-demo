var casper = require( 'casper' ).create();
var filename = 'src/neighbourhood-data-import.js';

var records = JSON.parse( require( 'fs' ).read( filename ));
var len = records.length;


function inferJurisdiction( host ) {
	if ( /\.qld\.gov\.au/.test( host )) {
		// councils within Queensland? how to tell councils from other qgov subdomains?
		// Queensland State
		return 'Queensland';

	} else if ( /\.gov\.au/.test( host )) {
		// other Australian states
		// federal Australia
		return 'Australia';

	} else {
		// non-government
		// international (other)
		return 'Other';
	}
}


function parseTitle( title ) {
	if ( /\|[^|]+\| Queensland Government$/.test( title )) {
		return title.replace( /\s*\|.*$/, '' );
	}
	return title;
}


function inferDocumentType( record, response ) {
	if ( /\bform\b/i.test( record.URL )) {
		return 'form';
	} else if ( /legislation\.qld\.gov\.au/.test( record.URL )) {
		// other forms of legislation
		return 'act';
	}
	return 'guidelines';
}


function inferFormat( record, response ) {
	var format;

	if ( response.contentType === 'string' ) {
		return response.contentType.replace( /;.*$/, '' );

	// infer from URL
	} else if ( /\.pdf/.test( record.URL )) {
		return 'application/pdf';
	} else {
		// assume html
		return 'text/html';
	}
}


function parsePublisher( publisher ) {
	return publisher ? publisher.replace( /^.*CorporateName=(.*?);.*$/, '$1' ) : null;
}


// get ready to write output
filename = filename.replace( /.js$/, '-out.js' );
// write JSONP wrapper
require( 'fs' ).write( filename, 'getAlternativeDisputeResolutionData([', 'w' );


casper.start();
records.forEach(function( record, i ) {
	// open the page
	casper.thenOpen( record.URL, function( response ) {
		casper.echo( 'parsing ' + ( i + 1 ) + '/' + len + ': ' + record.URL + '…' );
		// grab metadata
		// record.http = response;
		record.title = parseTitle( this.getTitle() );
		record.format = inferFormat( record, response );
		record.description = this.getElementAttribute( 'meta[name="DCTERMS.description"]', 'content' ) || this.getElementAttribute( 'meta[name="DC.description"]', 'content' ) || this.getElementAttribute( 'meta[name="description"]', 'content' );
		record.documentType = this.getElementAttribute( 'meta[name="AGLSTERMS.documentType"]', 'content' ) || inferDocumentType( record, response );
		record.jurisdiction = inferJurisdiction( records[ 0 ].URL );
		record.Publisher = parsePublisher( this.getElementAttribute( 'meta[name="DCTERMS.Publisher"]', 'content' ) || this.getElementAttribute( 'meta[name="DC.Publisher"]', 'content' ));

		require( 'fs' ).write( filename, JSON.stringify( record, null, '\t' ), 'a' );
	});
});

casper.run(function() {
	// completed: close JSONP
	require( 'fs' ).write( filename, ']);', 'a' );
	casper.echo( 'Done.\n\n' );

	casper.exit();
});
