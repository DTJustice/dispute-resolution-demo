// JSONP receiver
var cachedData = [];
var getAlternativeDisputeResolutionData = function( data ) {
	cachedData = data;
};


// basic angular
angular.module( 'disputeResolution', [] )

.controller( 'resultsController', function( $scope ) {
	'use strict';

	$scope.story = {
		disputeSubject: 'bullying',
		disputeType: 'concern',
		party: 'my supervisor'
	};
	$scope.results = cachedData;

	$scope.model = {
		disputeType: [],
		party: [],
		disputeSubject: []
	};

	for ( var i = 0, len = cachedData.length; i < len; i++ ) {
		// ES6: let, exploder
		var level = cachedData[ i ].disputeType.split( /\s*;\s*/ );
		var party = cachedData[ i ].party.split( /\s*;\s*/ );
		var type = cachedData[ i ].disputeSubject.split( /\s*;\s*/ );

		$scope.model.disputeType = $scope.model.disputeType.concat( level.filter(function( item ) {
			return $scope.model.disputeType.indexOf( item ) === -1;
		}));
		$scope.model.party = $scope.model.party.concat( party.filter(function( item ) {
			return $scope.model.party.indexOf( item ) === -1;
		}));
		$scope.model.disputeSubject = $scope.model.disputeSubject.concat( type.filter(function( item ) {
			return $scope.model.disputeSubject.indexOf( item ) === -1;
		}));
	}



});
