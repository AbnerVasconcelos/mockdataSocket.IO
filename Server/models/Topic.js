import mongoose from "mongoose";

const TopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 2,
    max: 100,
  },
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true,
  },
  topic: {
    type: [String], // Alterado para um array de strings
    required: true,
  },
});

const Topic = mongoose.model("Topic", TopicSchema);
export default Topic;
