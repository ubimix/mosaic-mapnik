var TilesProvider = require('../TilesProvider');
var toTilesProvider = require('../toTilesProvider');
var Utils = require('../../Utils');
var extend = Utils.extend;

function CachingTilesProvider(options) {
    this.initialize(options);
}
extend(CachingTilesProvider.prototype, TilesProvider.prototype, {

    initialize : function(options) {
        this.options = options || {};
        var provider = this.options.provider || this.options;
        this.provider = toTilesProvider(provider);
    },

    loadTile : function(options) {
        var that = this;
        return Promise.resolve().then(function() {
            var cacheId = that._cacheId(options);
            if (!cacheId) {
                return that.provider.loadTile(options);
            }
            options = extend({}, options, {
                cacheId : cacheId
            });
            return that._loadFromCache(options).then(function(result) {
                return result || that.provider.loadTile(options)//
                .then(function(result) {
                    return that._storeToCache(options, result)//
                    .then(function() {
                        return result;
                    });
                });
            });
        });
    },

    // ---------------------------------------------------------------------
    // Methods to re-define in subclasses.

    clearCache : function(options) {
    },

    _loadFromCache : function(options) {
        return Promise.resolve();
    },

    _storeToCache : function(options, result) {
        return Promise.resolve();
    },

    _cacheId : function(options) {
        var cacheId = this._getOptionsValue('cacheId', options);
        if (cacheId === undefined) {
            cacheId = this._getOptionsValue('dataId', options) || '';
            var params = options.params;
            var query = options.query;
            var format = 'format=' + merge(params.format || 'png');
            var layers = 'layers='
                    + merge(query.layer || query.layers || 'all');
            cacheId = [ cacheId, format, layers ].join('&');
        }
        return cacheId;
        function merge(val) {
            if (Array.isArray(val)) {
                val = val.join(',');
            }
            if (!val)
                return '';
            return val;
        }
    },

});
module.exports = CachingTilesProvider;
