const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

// Define the user schema
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        // unique: true // Ensure email uniqueness
    }
});

// Apply the passport-local-mongoose plugin to the schema
userSchema.plugin(passportLocalMongoose);

// Export the User model
module.exports = mongoose.model('User', userSchema);
