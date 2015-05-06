// JSONP receiver
var cachedData = [];
var getAlternativeDisputeResolutionData = function( data ) {
	cachedData = data;
};


// basic angular
angular.module( 'disputeResolution', [] )


// custom filter to match pathway and prevent duplicates
.filter( 'resolutionFilter', function() {

	return function( records, resolution ) {
		return records.filter(function( record ) {
			console.log( 'resolutionFilter', record, resolution );
			var matched = record.resolution.indexOf( resolution ) > -1;
			var alreadySeen = ( resolution === 'Assisted' && /Self/.test( record.resolution )) ||
			                  ( resolution === 'Formal'   && /Self|Assisted/.test( record.resolution ));

			return matched && ! alreadySeen;
		})
	};
})


// controller
.controller( 'resultsController', function( $scope ) {
	'use strict';

	$scope.results = cachedData;

	$scope.model = {
		disputeType: [],
		party: [],
		disputeSubject: []
	};

	// filters
	$scope.resultFilter = {
		documentType: {}
	};
	$scope.documentTypeFilter = function( record ) {
		return record.documentType !== 'act' && $scope.resultFilter.documentType[ record.documentType ] === true;
	};

	for ( var i = 0, len = cachedData.length; i < len; i++ ) {
		// ES6: let, exploder
		var type = cachedData[ i ].disputeType.split( /\s*;\s*/ );
		var party = cachedData[ i ].party.split( /\s*;\s*/ );
		var subject = cachedData[ i ].disputeSubject.split( /\s*;\s*/ );

		// collect all document types in use
		if ( cachedData[ i ].documentType ) {
			$scope.resultFilter.documentType[ cachedData[ i ].documentType ] = true;
		}

		// create lists of disputes, parties and topics
		$scope.model.disputeType = $scope.model.disputeType.concat( type.filter(function( item ) {
			return item.length && item !== 'undefined' && $scope.model.disputeType.indexOf( item ) === -1;
		}));
		$scope.model.party = $scope.model.party.concat( party.filter(function( item ) {
			return item.length && item !== 'undefined' && $scope.model.party.indexOf( item ) === -1;
		}));
		$scope.model.disputeSubject = $scope.model.disputeSubject.concat( subject.filter(function( item ) {
			return item.length && item !== 'undefined' && $scope.model.disputeSubject.indexOf( item ) === -1;
		}));
	}

	$scope.story = {
		disputeSubject: $scope.model.disputeSubject[ 0 ],
		disputeType: $scope.model.disputeType[ 0 ],
		party: $scope.model.party[ 0 ]
	};

	$scope.storySituation = {
		location: ''
	};

	$scope.storyHistory = {
		Self: { tried: false },
		Assisted: { tried: false },
		Formal: { tried: false }
	};


});
