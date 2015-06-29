// JSONP receiver
var cachedData = [];
var getAlternativeDisputeResolutionData = function( data ) {
	cachedData = data;
};

// basic angular
angular.module( 'disputeResolutionCSV', [ 'ngSanitize', 'ngCsv' ])


// controller
.controller( 'csvController', [ '$scope',
	                  function(  $scope ) {
	// 'use strict';

	$scope.results = cachedData;

	// fieldnames
	$scope.csvHeader = [
		'have', 'with', 'about', 'pathway',
		'title', 'description', 'url',
		'format', 'documentType',
		'publisher', 'jurisdiction',
		'comments'
	];

	$scope.csvData = $scope.results.map(function( item ) {
		return {
			have: item.disputeType,
			"with": item.party,
			about: item.disputeSubject,
			pathway: item.resolution,
			title: item.Title ? item.Title.replace( /»/, '-' ) : '',
			description: item.Description ? item.Description.replace( '’', '\'' ).replace( /\s*[^\x00-\x7F]+\s*/, ' ' ) : '',
			url: item.URL,
			format: item.format,
			documentType: item.documentType,
			publisher: item.Publisher || item.jurisdiction,
			jurisdiction: item.jurisdiction,
			comments: item.Comments
		};
	});

	$scope.csvDataConsolidated = $scope.results.map(function( item ) {
		var withValues = item.party;

		withValues = withValues.replace( /(^|;)\s*(a neighbour|an adjoining landowners|someone in my neighbourhood|a neighbour next door|a neighbour in my street)\s*(;|$)/, '$1a neighbour;someone in my neighbourhood;a neighbour next door;a neighbour in my street;an adjoining landowners$3' );
		withValues = withValues.replace( /(^|;)\s*(the body corporate|another unit owner\/lot owner|a neighbour in my body corporate|a neighbour in my building)\s*(;|$)/, '$1the body corporate;another unit owner/lot owner;a neighbour in my body corporate;a neighbour in my building$3' );
		// unique values
		withValues = withValues.split( /\s*;\s*/ ).filter(function( value, index, values ) {
			// keep if haven't already seen this value
			return values.slice( 0, index ).indexOf( value ) === -1;
		}).join( ';' );

		return {
			have: item.disputeType,
			"with": withValues,
			about: item.disputeSubject,
			pathway: item.resolution,
			title: item.Title ? item.Title.replace( /»/, '-' ) : '',
			description: item.Description ? item.Description.replace( '’', '\'' ).replace( /\s*[^\x00-\x7F]+\s*/, ' ' ) : '',
			url: item.URL,
			format: item.format,
			documentType: item.documentType,
			publisher: item.Publisher || item.jurisdiction,
			jurisdiction: item.jurisdiction,
			comments: item.Comments
		};
	});
}]);
