// convert HTML table (extracted from excel) to JSON
// hardcoded to match the table layout used on data
// first record starts on row 2
// each record is 13 rows long, some cells spanning columns
// 14th row is always blank
// some data is spread over 2 columns for compact layout in the spreadsheet
// first row is column headings
document.addEventListener( 'DOMContentLoaded', function() {



var records = [];


// map table elements to text content
function tableText( td ) {
	return td.textContent;
}


// URL	I have a	with		about		pathway types
function newRecord( rowData ) {
	// console.log( 'newRecord', rowData );
	var data = {
		URL: rowData[ 0 ],
		disputeType: rowData[ 1 ],
		party: rowData[ 2 ] + ';' + rowData[ 3 ],
		disputeSubject: rowData[ 4 ] + ';' + rowData[ 5 ],
		resolution: rowData[ 6 ],
		documentType: rowData[ 7 ]
	};

	return data;
}


function appendData( disputeType, party, disputeSubject, resolution ) {
	var data = records[ records.length - 1 ];
	// console.log( 'appendData', rowData );
	data.disputeType += disputeType ? ';' + disputeType : '';
	data.party += party ? ';' + party.join( ';' ) : '';
	data.disputeSubject += ';' + disputeSubject.join( ';' );
	data.resolution += resolution ? ';' + resolution : '';
}


// data cleanup
function clean() {
	records.forEach(function( record ) {
		[ 'disputeType', 'party', 'disputeSubject', 'resolution' ].forEach(function( key ) {
			record[ key ] = record[ key ].replace( /;(\s+;)+/g, ';' );
		});
		// trim leading/trailing whitespace
		// serialise whitespace
		Object.keys( record ).forEach(function( key ) {
			record[ key ] = record[ key ].replace( /^\s+/, '' ).replace( /\s+$/, '' ).replace( /\s{2,}/g, ' ' );
		});

		// fix typo
		record.resolution = record.resolution.replace( 'Assited', 'Assisted' );
	});
}


// get each row
var tr = document.querySelectorAll( 'tr' );
for ( i = 1, len = tr.length; i < len; i += 14 ) {
	var rowData = Array.prototype.map.call( tr[ i ].querySelectorAll( 'td' ), tableText );

	// skip blank rows (no URL)
	if ( ! /^https?:/.test( rowData[ 0 ] )) {
		// catch copy/paste errors
		if ( /https?:/.test( rowData[ 0 ] )) {
			rowData[ 0 ] = rowData[ 0 ].replace( /^.*?http/, 'http' );
		} else if ( /^www./.test( rowData[ 0 ] )) {
			rowData[ 0 ] = 'http://' + rowData[ 0 ];

		} else if ( ! /\S/.test( rowData[ 0 ] ) && /\S/.test( rowData[ 1 ] )) {
			// missing URL
			rowData[ 0 ] = '';

		} else {
			console.log( '-> skip', i, len, rowData[ 0 ] );
			break;
		}
	}

	// it is a new record
	console.log( 'parsing', i, len, rowData[ 0 ] );
	records.push(newRecord( rowData ));

	// extra data from rows i + 1..7

	// 1, 2 = ordinary rows (no first column)
	for ( j = 1; j <= 2; j++ ) {
		rowData = Array.prototype.map.call( tr[ i + j ].querySelectorAll( 'td' ), tableText );
		appendData( rowData[ 0 ], [ rowData[ 1 ], rowData[ 2 ]], [ rowData[ 3 ], rowData[ 4 ]], rowData[ 5 ]);
	}
	// rows 3..5 = no first column, no last column
	for ( j = 3; j <= 5; j++ ) {
		rowData = Array.prototype.map.call( tr[ i + j ].querySelectorAll( 'td' ), tableText );
		appendData( rowData[ 0 ], [ rowData[ 1 ], rowData[ 2 ]], [ rowData[ 3 ], rowData[ 4 ]]);
	}
	// row 6 and 7: ignore first cell ("comments" label)
	for ( j = 6; j <= 7; j++ ) {
		rowData = Array.prototype.map.call( tr[ i + j ].querySelectorAll( 'td' ), tableText );
		appendData( rowData[ 1 ], [ rowData[ 2 ], rowData[ 3 ]], [ rowData[ 4 ], rowData[ 5 ]]);
	}
	// get comment from row 7
	records[ records.length - 1 ].Comments = rowData[ 0 ];
	// row 8:
	rowData = Array.prototype.map.call( tr[ i + 8 ].querySelectorAll( 'td' ), tableText );
	appendData( '', [ rowData[ 2 ]], [ rowData[ 3 ], rowData[ 4 ]]);
	// row 9:
	rowData = Array.prototype.map.call( tr[ i + 8 ].querySelectorAll( 'td' ), tableText );
	appendData( '', '', [ rowData[ 1 ], rowData[ 2 ]]);
	// row 10..12:
	for ( j = 10; j <= 12; j++ ) {
		rowData = Array.prototype.map.call( tr[ i + j ].querySelectorAll( 'td' ), tableText );
		appendData( '', '', [ rowData[ 0 ], rowData[ 1 ]] );
	}
	// row 13 = description (sometimes omitted)
	// look ahead
	rowData = Array.prototype.map.call( tr[ i + 13 ].querySelectorAll( 'td' ), tableText );
	if ( /^\s*Description:\s*$/.test( rowData[ 0 ] )) {
		records.Description = rowData[ 1 ];
		// skip this row on next pass
		i++;
	}
}

// log the final JSON output
clean();
// console.log( JSON.stringify( records ));

var code = document.createElement( 'pre' );
code.textContent = JSON.stringify( records, null, '\t' );
document.body.appendChild( code );


});
