var bcrypt = require('bcrypt-nodejs');
module.exports = function (dbHandler) {

	var Schema = dbHandler.Schema;

	var userSchema = dbHandler.Schema({
	    username: String,
	    password: String,
	    profileImageId: String,
	    scopes: [],
	    role: String,
	    nick: String,
	    slug: String,
	    mainScope:Schema.Types.ObjectId,
	    created: { type: Date, default: Date.now },
	});


	userSchema.pre('save', function (next) {
		var user = this;


		if (this.isModified('password') || this.isNew) {
			user.password = bcrypt.hashSync(user.password);
			next();
		} else {
			return next();
		}
	});

	userSchema.methods.comparePassword = function (passw, cb) {
		bcrypt.compare(passw, this.password, function (err, isMatch) {
			if (err) {
				return cb(err);
			}
			cb(null, isMatch);
		});
	};

	var scopeSchema = dbHandler.Schema({
		title: String,
		members: [],
		created: { type: Date, default: Date.now }
	});

	var noteSchema = dbHandler.Schema({
		userId: Schema.Types.ObjectId,
		scopeId: Schema.Types.ObjectId,
		note: String,
		status: String
		onDate: { type: Date, default: Date.now }
	});


	var convertToObjectId = function (idString) {
		return dbHandler.Types.ObjectId(idString);
	};


	return {
		User : dbHandler.model('User', userSchema),
		Scope : dbHandler.model('Scope', scopeSchema),
		Note : dbHandler.model('Note', noteSchema),
		convertToObjectId: convertToObjectId
	}
}