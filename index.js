var csv = require('fast-csv');
var fs = require('fs');
var changeCase = require('change-case');
var Promise = require('es6-promise').Promise;
var _ = require('underscore');

var gtfs = {};
var shortCodes = {};

readGtfsPromise().
    then(readShortCodesPromise).
    then(readOverridesPromise).
    then(mapPromise);

function readGtfsPromise() {

    return new Promise(readGtfs);

    function readGtfs(resolve) {

        var stream = fs.createReadStream('stops.txt');
        var csvStream = csv({headers: true}).
            on('data', data).
            on('end', resolve);
        stream.pipe(csvStream);

        function data(data) {
            var id = data['stop_id'];
            var name = changeCase.upperCase(data['stop_name']);
            gtfs[name] = id;
        }
    }
}

function readShortCodesPromise() {
    
    return new Promise(readShortCodes);

    function readShortCodes(resolve) {

        var gfts = {};

        var stream = fs.createReadStream('short-codes.csv');
        var csvStream = csv({headers: true}).
            on('data', data).
            on('end', resolve);
        stream.pipe(csvStream);

        function data(data) {
            var code = data['STATION 2CHAR'];
            var name = changeCase.upperCase(data['STATION NAME']);
            shortCodes[name] = code;
        }
    }    
}

function readOverridesPromise() {

    return new Promise(readOverrides);

    function readOverrides(resolve) {
        fs.readFile('overrides.json', 'utf8', function (err, data) {
            if (err) throw err;
            overrides = JSON.parse(data);
            resolve();
        });
    }
}

function mapPromise() {

    return new Promise(map);

    function map(resolve) {

        var mappings = {};
        var reverseMappings = {};
        _.each(gtfs, mapper);
        function mapper(id, name) {
            var shortCode = shortCodes[name];
            if(!shortCode) {
                var override = overrides.override[name];
                if(override) {
                    mappings[id] = override;
                    reverseMappings[override] = id;
                } else {
                    if(!_.contains(overrides.exclude, name)) {
                        console.error('Missing mapping for ' + name);
                    }
                }
            }
            else {
                mappings[id] = shortCode;
                reverseMappings[shortCode] = id;
            }
        }
        console.log("GTFS > Shortcode:\n" + JSON.stringify(mappings));
        console.log("Shortcode > GTFS:\n" + JSON.stringify(reverseMappings));
        console.log("Name > Shortcode:\n" + JSON.stringify(shortCodes));

        resolve();
    }
}
