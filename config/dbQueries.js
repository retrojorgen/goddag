var crypto = require('crypto');
var _ = require('underscore');
var bcrypt = require('bcrypt-nodejs');

module.exports = function (models, slug) {

	
	var User = models.User;
	var Game = models.Game;

	var Event = models.Event;

	var ResetPassword = models.ResetPasswordSchema;

	function generateSecureVal(callback) {
		crypto.randomBytes(3, function(err, buffer) {
			callback(parseInt(buffer.toString('hex'), 16).toString().substr(0,6));
		});
	};


	return {
		createUser: function (username, password, nick, callback) {
			var newUser = new User({
				username: username,
				password: password,
				nick: nick,
				slug: slug(nick),
				role: 'user'
			});
			newUser.save(function (err) {
				if(!err) {
					callback(newUser);
				} else {
					callback(false);
				}
			});
		},

		getUserFromId: function (userId, callback) {
			User.findById(userId, function (err, user) {
				if(!err) {
					callback(user);
				} else {
					callback(false);
				}
			})
		},
		getEvents : function (callback) {
			Event.find({}, function (err, events) {
				if(!err) {
					callback(events);
				} else {
					callback(false);
				}
			});
		},
		insertEvent : function (event, callback) {
			var newEvent = new Event(event);
			newEvent.save(function (err) {
				if(!err) {
					callback(newEvent);
				} else {
					callback(false);
				}
			});
		},
		getUserFromUsername: function (username, callback) {
			 User.findOne({ 'username' :  username }, function(err, user) {
			 	if(err)
			 		callback(false);
			 	if(!user)
			 		callback(false);
			 	if(user)
			 		callback(user);
			});
		},

		setPasswordCode: function (email, callback) {
			User.findOne({username: email}, function (err, user) {

				if(!err) {
					generateSecureVal(function (secureVal) {
						var newPasswordCode = new ResetPassword({
							userId: user._id,
							generatedKey: secureVal
						});

						newPasswordCode.save(function (err) {
							if(!err) {
								callback({
									status: true,
									email: user.username,
									code: newPasswordCode.generatedKey
								});
							} else {
								callback({
									status: false
								});
							}
						});
					});

				} else {
					callback({
						status: false
					});
				}
			});
		},

		setPasswordFromCodeAndEmail: function (email, code, newPassword) {
			this.verifyPasswordCode(email, code, true, function (response) {
				if(response.status) {
					response.user.password = bcrypt.hashSync(newPassword);
					response.user.save(function (err) {
						if(!err) {
							callback({
								status: true,
								statusMessage: "Passordet har blitt resatt"
							});
						} else {
							callback({
								status: false,
								statusMessage: "Kunne ikke lagre passordet. Prøv igjen"
							});
						}
					});
				} else {
					callback({
						status: false,
						statusMessage: "Kunne ikke verifisere kode"
					})
				}
			});
		},

		verifyPasswordCode: function (email, code, userReturnToggle, callback) {
			User.findOne({username: email}, function (err, user) {
				if(!err) {
					ResetPassword.findOne({userId: user._id, generatedKey: code}, null, {sort: {date: -1}},	 function (err, resetPasswordCode) {
						if(!err) {
							callback({
									status: true,
									statusMessage: "Fant kode",
									user: userReturnToggle ? user : false
								});
						} else {
							callback({
								status: false,
								statusMessage: "Fant ikke kode"
							});
						}
					});
				} else {
					callback({
						status: false,
						statusMessage: "Fant ikke bruker"
					});
				}
			});
		},

		getUserFromSlug: function (nickSlug, callback) {
			User.findOne({'slug': nickSlug}, function (err, user) {
				if(err)
					callback(false);
				if(!user)
					callback(false);
				if(user)
					callback(user);
			});
		},

		addProfileImageToUser: function (userId, imageId, callback) {
			User.findById(userId, function (err, user) {
				if(!err) {
					user.profileImageId = imageId;

					user.save(function (err) {
						if(!err)
							if(callback)
								callback(user);
					});
				}
			})
		},
		setProfilePhotoAvatar: function (userId, avatarString, callback) {
			User.findByIdAndUpdate(userId, { $set: { profileImageId: avatarString }}, {new: true}, function (err, user) {
				callback(user.profileImageId);
			});
		},


		searchConsoles: function (phrase, callback) {

			Console.find(
				{ "console": { "$regex": phrase, "$options": "i" } },
				function(err,results) {
					if(err) {
						callback([]);
					}
					else {
						callback(results);
					}
				}
			);
		}
	}
}

