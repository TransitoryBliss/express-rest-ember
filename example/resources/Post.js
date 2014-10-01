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