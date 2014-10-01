module.exports = function (mongoose) {

    var UserSchema = new mongoose.Schema({
        username: { type: String, required: true },
        age: { type: Number, min: 9, max: 18 }
    });

    var model = mongoose.model('User', UserSchema);

    return {
        model: model,
        Schema: UserSchema
    };
}