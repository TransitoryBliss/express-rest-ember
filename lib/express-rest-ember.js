var fs = require('fs');
var merge = require('utils-merge');
var structure = require('dstruc').sync;
var inflection = require('inflection');
var express = require('express');
var bodyParser = require('body-parser');

require('coffee-script/register'); // needed to required coffee files (?)

function ExpressRestEmber() {
    this.mongoose = null;
    this.resource_dir = null;
    this.resource_map = {}; // 'User': 'filename'
    this.resources = {};
    this.routes = {};
}

ExpressRestEmber.prototype.addResourceMap = function (name, filename) {
    return this.resource_map[name] = filename;
};

ExpressRestEmber.prototype.setup = function (obj) {
    if (!obj) throw new Error("Missing configuration object");
    this.mongoose = obj.mongoose;
    this.resource_dir = obj.resources;

    // Parse the resource directory..
    this.parseResources();
    this.registerResources();
    this.addRoutes();
}
// @returns object of resource files
ExpressRestEmber.prototype.parseResources = function () {
    var self = this;
    var files = structure(this.resource_dir, { extensionAsKey: true }).files;

    Object.keys(files).forEach(function (key, index) {
        var f = files[key];

        // Loop through all files and add them to the resourcemap (key is filename without ext)
        f.forEach(function (data, index) {
            self.addResourceMap(data.split('.').shift(), f[index]);
        });
    });
};

ExpressRestEmber.prototype.registerResources = function () {
    var self = this;

    Object.keys(this.resource_map).forEach(function (key, index) {
        var name = key;
        self.resources[name.toLowerCase()] = require(self.resource_dir + '/' + self.resource_map[key])(self.mongoose)
    });
};

// This is the magic method...
ExpressRestEmber.prototype.addRoutes = function () {
    var self = this;
    Object.keys(this.resources).forEach(function (key, index) {
        var router = self.routes[key] = express.Router();
        var model = self.resources[key].model;

        // We depend on the bodyparser... and we are
        // not a middleware :(
        // @todo make option?
        router.use(bodyParser.urlencoded({ extended: false }))
        router.use(bodyParser.json())

        // Register all the "magic" routes...
        router.get('/', function (req, res) {
            model.find({}, function (err, docs) {
                if (err) return res.status(400).send(err);
                var responseObj = {};
                responseObj[inflection.pluralize(key)] = docs;
                return res.status(200).send(responseObj);
            });
        });

        router.get('/:id', function (req, res) {
            model.findOne({ _id: req.params.id }, function (err, doc) {
                if (err) return res.status(400).send(err);
                var responseObj = {};
                responseObj[key] = doc || {};
                return res.status(200).send(responseObj);
            });
        });

        router.post('/', function (req, res) {
            var instance = new model(req.body);
            return instance.save(function (err, doc) {
                if (err) return res.status(400).send(err);
                var responseObj = {};
                responseObj[key] = doc;
                return res.status(201).send(responseObj);
            });
        });

        router.put('/:id', function (req, res) {
            model.findByIdAndUpdate(req.params.id, req.body, function (err, doc) {
                if (err) return res.status(400).send(err);
                var responseObj = {};
                responseObj[key] = doc;
                return res.status(200).send(responseObj);
            });
        });

        router.delete('/:id', function (req, res) {
            model.findByIdAndRemove(req.params.id, function (err, doc) {
                if (err) return res.status(400).send(err);
                var responseObj = {};
                responseObj[key] = doc;
                return res.status(200).send({});
            });
        });

    });
};

exports = module.exports = new ExpressRestEmber;