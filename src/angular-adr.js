// JSONP receiver
var cachedData = [];
var getAlternativeDisputeResolutionData = function( data ) {
	cachedData = data;
};

// TODO service for council data
var URI_DATA_COUNCIL = 


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
.controller( 'resultsController', function( $scope, $http ) {
	'use strict';

	$scope.results = cachedData;

	$scope.model = {
		disputeType: [],
		party: [],
		disputeSubject: [],
		// TODO how is this list maintained? data portal?
		councilSubject: [
			'Dogs and other pets',
			'Fences',
			'Noise'
		]
	};

	// filters
	$scope.resultFilter = {
		documentType: {}
	};
	$scope.documentTypeFilter = function( record ) {
		return record.documentType !== 'act' && $scope.resultFilter.documentType[ record.documentType ] === true;
	};


	// init
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

		// councils
		// TODO create a service wrapper
		// fetch from data portal
		// https://data.qld.gov.au/dataset/local-government-contacts
		// https://data.qld.gov.au/api/action/datastore_search?resource_id=e5eed270-880f-4226-b640-4fa5bae6ddb7&fields=Council,Generic%20council%20email%20address&limit=500
		$http.jsonp( 'https://data.qld.gov.au/api/action/datastore_search', {
			params: {
				resource_id: 'e5eed270-880f-4226-b640-4fa5bae6ddb7',
				fields: 'Council,Generic council email address',
				limit: 500, // make sure we get them all!
				callback: 'JSON_CALLBACK'
			},
			cache: true
		}).success(function( data ) {
			$scope.model.councils = {};
			data.result.records.forEach(function( record ) {
				$scope.model.councils[ record.Council ] = {
					domain: record[ 'Generic council email address' ].replace( /^.*@/, '' )
				};
			});
		});
	}

	// TODO initial state!?
	// $scope.story = {
	// 	disputeSubject: $scope.model.disputeSubject[ 0 ],
	// 	disputeType: $scope.model.disputeType[ 0 ],
	// 	party: $scope.model.party[ 0 ]
	// };

	$scope.storySituation = {
		outcome: '',
		blocker: '',
		council: ''
	};

	$scope.storyHistory = {
		Self: { tried: false },
		Assisted: { tried: false },
		Formal: { tried: false }
	};


});
