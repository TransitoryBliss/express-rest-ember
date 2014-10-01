//
// This is just an example, please note that you also
// will most likely have no data. Just visit /scaffold
// to create a single blog post.
//

var express = require('express');
var mongoose = require('mongoose');
var rest = require('..');

var app = express();

mongoose.connect('mongodb://localhost:27017/express-rest-ember');
//
// rest.setup loads all the resources in the specified dir
// and makes them available through rest.routes.resourcename
//
rest.setup({ mongoose: mongoose, resources: (__dirname + '/resources') });


//
// Register the generated router for blog posts...
//  [GET] "/api/posts/": find all
//  [GET] "/api/posts/:id" find one by id
//  [POST] "/api/posts/" create one
//  [DELETE] "/api/posts/:id" delete one
//  [PUT] "/api/posts/:id" update one
//
app.use('/api/posts', rest.routes.post);

//
// You can access the models and schemas registered via the
// following syntax
//
var PostModel = rest.resources.post.model;
var PostSchema = rest.resources.post.Schema;

//
// For the purpose of this example file, here is a scaffold route
// which will create a test post...
//
app.get('/scaffold', function (req, res) {
    var post = new PostModel({
        title: "My scaffolded post", body: "I have no body because my developer is lazy"
    });

    post.save(function (err, doc) {
        if (err) throw new Error(err);
        res.status(200).send("scaffolded...")
    })
});

//
// You can also of course use an authentication middleware of choice..
// eg:
//      app.use('/api/posts', ensureAuthenticated, rest.routes.post)
//
// @todo allow finer control of middleware for specific HTTP methods...
//

app.listen(3000);