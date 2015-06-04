var casper = require( 'casper' ).create();
var filename = 'demo/neighbourhood-data-import.js';

var records = JSON.parse( require( 'fs' ).read( filename ));
var len = records.length;


var councils = JSON.parse( require( 'fs' ).read( 'demo/council-domains.json' ));


function inferJurisdiction( host ) {
	// councils within Queensland (check against known domains)
	var council = Object.keys( councils ).filter(function( key ) {
		// if ( host.indexOf( councils[ key ] ) > -1 ) {
		// 	casper.echo( 'council match! ' + host + ' === ' + councils[ key ] );
		// }
		return host.indexOf( councils[ key ] ) > -1;
	});


	if ( council.length > 0 ) {
		casper.echo( 'found council! ' + council.length + ' for ' + host );
		return council[ 0 ];

	} else if ( /qld/.test( host )) {
		// Queensland State
		return 'Queensland';

	} else if ( /\.au/.test( host )) {
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
	if ( /\bform\b/i.test( record.URL ) || /\bform\b/i.test( record.Title )) {
		return 'form';
	} else if ( /legislation\.qld\.gov\.au/.test( record.URL )) {
		// acts and other forms of legislation
		return 'legislation';
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


function handleSpecialCharacters( s ) {
	return s ? s
		// known special characters
		.replace( /’/g, '\'' )
		.replace( /»/g, '-' )
		// unknown special characters become spaces
		.replace( /[^\x00-\x7F]+/g, ' ' )
		// normalise whitespace
		.replace( /\n/g, ' ' )
		.replace( /\s\s+/g, ' ' )
		// trim
		.replace( /^\s+/, '' )
		.replace( /\s+$/, '' )
	: s;
}


casper.start();
records.forEach(function( record, i ) {
	// open the page
	casper.thenOpen( record.URL, function( response ) {
		casper.echo( 'parsing ' + ( i + 1 ) + '/' + len + ': ' + record.URL + '…', 'INFO' );
		// sanity check the URL (allow for trailing slash)
		if ( response.url && record.URL.replace( / /g, '%20' ).replace( /\/$/, '' ) === response.url.replace( /\/$/, '' )) {
			// record.httpResponse = response;
			// grab metadata
			record.Title = parseTitle( this.getTitle() );
			record.Description = this.getElementAttribute( 'meta[name="DCTERMS.description"]', 'content' ) || this.getElementAttribute( 'meta[name="DC.description"]', 'content' ) || this.getElementAttribute( 'meta[name="description"]', 'content' );
			record.Publisher = parsePublisher( this.getElementAttribute( 'meta[name="DCTERMS.Publisher"]', 'content' ) || this.getElementAttribute( 'meta[name="DC.Publisher"]', 'content' ));
			record.documentType = record.documentType || this.getElementAttribute( 'meta[name="AGLSTERMS.documentType"]', 'content' ) || inferDocumentType( record, response );

			// normalise characters and whitespace
			record.Description = handleSpecialCharacters( record.Description );
			record.Title = handleSpecialCharacters( record.Title );

		} else {
			// couldn't get a response
			casper.echo( '-> NO RESPONSE! ' + record.URL, 'WARNING' );
			// infer title from filename, replace -_ with spaces and remove file extension
			record.Title = decodeURIComponent( record.URL.replace( /^.*\//, '' )).replace( /[-_]+/g, ' ' ).replace( /\.[^.]*$/, '' );
			record.documentType = record.documentType || inferDocumentType( record, record );
		}
		record.format = inferFormat( record, response );
		record.jurisdiction = inferJurisdiction( record.URL );
		require( 'fs' ).write( filename, ( i > 0 ? ', ' : '' ) + JSON.stringify( record, null, '\t' ), 'a' );
	});
});

casper.run(function() {
	// completed: close JSONP
	require( 'fs' ).write( filename, ']);', 'a' );
	casper.echo( 'Done.\n\n', 'GREEN_BAR' );

	casper.exit();
});
