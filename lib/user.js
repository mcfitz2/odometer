var mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
	_id: {type:String, required:true},
	username: {type:String, required:true},
	first_name: {type:String, required:true},
	last_name: {type:String, required:true},
	email: {type:String, required:true},
	access_token: {
		type:String,
	},
	refresh_token:{
		type:String
	}
});
var User = mongoose.model('User', userSchema);
module.exports = User;

