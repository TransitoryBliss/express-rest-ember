module.exports = (mongoose) ->
  PostSchema = new mongoose.Schema(title: String)
  model = mongoose.model("Post", PostSchema)
  model: model
  Schema: PostSchema