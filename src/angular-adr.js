// JSONP receiver
var cachedData = [];
var getAlternativeDisputeResolutionData = function( data ) {
	cachedData = data;
};

angular.module( 'disputeResolution', [] )

.controller( 'resultsController', function( $scope ) {
	'use strict';

	$scope.results = cachedData;

});
