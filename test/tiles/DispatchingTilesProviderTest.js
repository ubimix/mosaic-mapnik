var fs = require('fs');
var expect = require('expect.js');
var DispatchingTilesProvider = require('../..').tiles.DispatchingTilesProvider;
var Utils = require('../..').Utils;
var extend = Utils.extend;
var TestUtils = require('../TestUtils');

describe('DispatchingTilesProviderTest', function() {

    function f(msg) {
        return {
            loadTile : function(options) {
                return extend({}, options, {
                    tile : msg
                });
            }
        };
    }

    describe('should dispatch requests ' + // 
    'based on the "format" parameter', function() {
        var provider = new DispatchingTilesProvider({
            providers : {
                'pbf' : f('pbf vector'),
                'png' : f('png image'),
                'json' : f('utf grid'),
                'utf' : f('utf grid')
            }
        });
        function test(msg, format, tile) {
            return TestUtils.runTest(msg, function() {
                return provider.loadTile({
                    params : {
                        format : format
                    },
                }).then(function(result) {
                    expect(result).to.eql({
                        params : {
                            format : format
                        },
                        tile : tile
                    });
                });
            });
        }
        test('should call right external providers '
                + 'based on requested tile types', 'utf', 'utf grid'),

        test('should call right external providers '
                + 'based on requested tile types', 'png', 'png image'),

        TestUtils.runTest('should throw an exception ' + //
        'for unknown formats', function() {
            return provider.loadTile({
                params : {
                    format : 'foobar'
                },
            }).then(function(result) {
                throw new Error();
            }, function(err) {
                expect(err.message).to.eql('No providers ' + // 
                'were found for the "foobar" key.')
            });
        });
    });

    TestUtils.runTest('should be able to re-define key method', function() {
        var provider = new DispatchingTilesProvider({
            providers : {
                'foo' : f('FOO'),
                'bar' : f('BAR'),
            },
            providerKey : function(options) {
                return options.mykey;
            }
        });
        return provider.loadTile({
            params : {},
            mykey : 'foo'
        }).then(function(result) {
            expect(result.tile).to.eql('FOO');
        });
    });

});
