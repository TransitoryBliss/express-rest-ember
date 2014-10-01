express-rest-ember
==================
Automatically create REST endpoints based on your mongoose models. This is by __no means limited to ember__. The ember in the name means that it's compatible with Embers rest adapter out of the box.

```javascript
var express = require('express');
var app = express();
var mongoose = require('mongoose');

mongoose.connect(...)

var rest = require('express-rest-ember');

rest.setup({mongoose: mongoose, resources: '/path/to/models' });

//
// Register all REST-ful routes
//
app.use('/api/myResource', rest.routes.myResource); // Your resource will now be avilable at http://host/api/myResource

//
// If you want to protect resources you can ofcourse do it using middleware
// (like passport)
//
app.use('/api/myProtectedResource', myAuthMiddleware, rest.routesmyProtectedResource);

app.listen(3000);

```

Look in the example folder for a full working example.

## Models
All your models should be stored in the same directory (e.g. resources/).

### A Model
```js
module.exports = function (mongoose) {

    var PostSchema = new mongoose.Schema({
        title: { type: String, required: true },
        body: { type: String }
    });

    var model = mongoose.model('Post', PostSchema);

    //
    // For express-rest-ember to work you MUST
    // return an object containing model and Schema
    // properties...
    //
    return {
        model: model,
        Schema: PostSchema
    };
}
```

Notice that you __must__ export it as a function where mongoose will be injected as the first argument.

## Testing
Run the tests for a better understanding of how the routes work, as the output will give you a good hint.

Install mocha globally

    $ npm install mocha -g

Run the tests

    $ npm test