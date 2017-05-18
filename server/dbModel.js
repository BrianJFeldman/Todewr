const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listSchema = new Schema({
    name: { type: String, required: true },
    items: [String]
})

const dbSchema = new Schema({
    number: { type: String, required: true },
    lists: [listSchema]
});

module.exports = mongoose.model('lists', dbSchema);
