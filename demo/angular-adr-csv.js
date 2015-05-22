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
			title: item.Title,
			description: item.Description,
			url: item.URL,
			format: item.format,
			documentType: item.documentType,
			publisher: item.Publisher,
			jurisdiction: item.jurisdiction,
			comments: item.Comments
		};
	});
}]);
