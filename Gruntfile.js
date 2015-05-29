module.exports = function( grunt ) {
	require( 'time-grunt' )( grunt );

	var pkg = grunt.file.readJSON( 'package.json' );

	// config
	grunt.initConfig({

		// local web server
		connect: {
			options: {
				base: './',
				// SSI support
				middleware: function( connect, options, middlewares ) {
					options = options || {};
					options.index = options.index || 'index.html';
					middlewares.unshift(function globalIncludes( req, res, next ) {
						var fs = require( 'fs' );
						var filename = require( 'url' ).parse( req.url ).pathname;
						if ( /\/$/.test( filename )) {
							filename += options.index;
						}

						if ( /\.html$/.test( filename )) {
							fs.readFile( options.base + filename, 'utf-8', function( err, data ) {
								var path = '';
								if ( err ) {
									next( err );
								} else {
									res.writeHead( 200, { 'Content-Type': 'text/html' });
									// SWE global includes
									data = data.split( '<!--#include virtual="' );
									res.write( data.shift(), 'utf-8' );
									data.forEach(function( chunk ) {
										path = chunk.substring( 0, chunk.indexOf( '"-->' ));
										// handle SWE global includes
										if ( path.indexOf( '/assets' ) === 0 ) {
											path = path.replace( '/assets/includes/global', options.base + '/lib/global' );
										} else {
											// local includes
											path = options.base + require( 'url' ).parse( req.url ).pathname.replace( /[^\/]+$/, '' ) + path;
										}
										res.write( fs.readFileSync( path, 'utf-8' ), 'utf-8' );
										res.write( chunk.substring( chunk.indexOf( '-->' ) + 3 ), 'utf-8' );
									});
									res.end();
								}
							});

						} else {
							next();
						}
					});
					return middlewares;
				}
			},
			testserver: {
				options: {
					port: 9999
				}
			}
		},

		// code qa
		jshint: {
			app: {
				options: {
					jshintrc: '.jshintrc'
				},
				src: 'src/**.js'
			},
			tests: {
				src: 'test/**.js'
			}
		},

		// acceptance tests
		casper: {
			acceptance: {
				options: {
					test: true,
					concise: true,
					failFast: true
				},
				files: {
					'logs/casper-acceptance.xml' : [ 'test/*.js' ]
				}
			}
		},

		// watch
		watch: {
			options: {
				spawn: false
			},
			js: {
				files: 'src/*.js',
				tasks: [ 'jshint:app', 'casper:acceptance' ]
			},
			templates: {
				files: 'src/**/*.html',
				tasks: [ 'casper:acceptance' ]
			},
			tests: {
				files: 'test/**',
				tasks: [ 'jshint:tests', 'casper:acceptance' ]
			}
		}
	});


	// plugins
	grunt.loadNpmTasks( 'grunt-casper' );
	grunt.loadNpmTasks( 'grunt-contrib-connect' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );


	// helpers
	grunt.registerTask( 'test', [ 'jshint', 'casper' ]);
	grunt.registerTask( 'default', [ 'connect:testserver', 'test', 'watch' ]);
};
