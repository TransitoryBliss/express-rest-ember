var assert = require('assert');
var http = require('http');
var request = require('supertest');
var express = require('express');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var mockgoose = require('mockgoose');

var rest = require('..');

describe('express-rest-ember', function () {
    var app;
    var existing_id = null;

    this.timeout(5000);

    before(function (callback) {
        // Mock mongoose
        mockgoose(mongoose);
        // Initialize app
        app = express();
        // setup express-rest-ember
        rest.setup({ mongoose: mongoose, resources: (__dirname + '/env/resources') });

        //
        // setup some test routes
        //
        app.use('/api/users', rest.routes.user);

        // Scaffold one existing post before beginning..
        var scaffold = rest.resources.user.model({ username: "scaffolded" });
        scaffold.save(function (err, doc) {
            if (err) throw new Error(err);

            existing_id = doc._id;

            app.listen(8888, function() {
                return callback();
            });
        });
    });


    it('should return { plural: [...] } on [GET] "/"', function (done) {
        request(app)
            .get('/api/users')
            .expect(200) // "OK"
            .end(function (err, res) {
                assert.equal(typeof(res.body.users), typeof([]))
                if (err) return done(err);
                done();
            });
    });


    it('should return { singular: {...} } on [GET] "/:id"', function (done) {
        request(app)
            .get('/api/users/' + existing_id)
            .expect(200) // "OK"
            .end(function (err, res) {
                if (err) return done(err);
                assert.equal(typeof(res.body.user), typeof({}));
                assert.equal(res.body.user.username, "scaffolded");
                done();
            });
    });

    it('should create one and return { singular: {...} } on [POST] "/"', function (done) {
        request(app)
            .post('/api/users')
            .send({ username: "Robert", age: 15 })
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201) // "created"
            .end(function (err, res) {
                if (err) return done(err);
                assert.equal(typeof(res.body.user), typeof({}));
                assert.equal(res.body.user.username, "Robert");
                done();
            });
    });

    it('should update one on and return { singular: {...} } [PUT] "/:id"', function (done) {
        request(app)
            .put('/api/users/' + existing_id)
            .send({ username: "New Scaffolded" })
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200) // "OK"
            .end(function (err, res) {
                if (err) return done(err);
                assert.equal(typeof(res.body.user), typeof({}))
                assert.equal(res.body.user._id, existing_id);
                assert.equal(res.body.user.username, "New Scaffolded");
                done();
            });
    });

    it('should send 400 "bad request" on [POST] "/" validation error', function (done) {
        request(app)
            .post('/api/users')
            .send({})
            .set('Content-Type', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400) // "Bad Request"
            .end(function (err, res) {
                if (err) return done(err);
                assert.equal(res.body.message, 'Validation failed');
                assert.equal(res.body.errors.username.type, 'required');
                done();
            });
    });


    it('should delete one and return {} on [DELETE] "/:id"', function (done) {
        request(app)
            .delete('/api/users/' + existing_id)
            .expect('Content-Type', /json/)
            .expect(200) // "OK"
            .end(function (err, res) {
                if (err) return done(err);
                assert.equal(typeof(res.body), typeof({}))
                done();
            });
    });

    it('should return { singular: {} } on [GET] non-existing "/:id"', function (done) {
        request(app)
            .get('/api/users/' + existing_id) // the existing ID has been deleted here...
            .expect(200) // "OK"
            .end(function (err, res) {
                if (err) return done(err);
                assert.equal(typeof(res.body), typeof({}))
                assert.deepEqual(res.body, { user: {} });
                done();
            });
    });
});