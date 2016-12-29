var lwip = require('lwip');
var fs = require('fs');
var Mailgun = require('mailgun-js');
var ExifImage = require('exif').ExifImage;

//Your api key, from Mailgun’s Control Panel
var api_key = 'key-67450a7ebf6ca4d9b351030681b8f1d5';

//Your domain, from the Mailgun Control Panel
var domain = 'email.samledb.com';

//Your sending email address
var noReplyAddress = 'no-reply@samledb.com';

var sendCodeMail = function (email, code, callback) {
  var mailgun = new Mailgun({apiKey: api_key, domain: domain});
  var data = {
    from: noReplyAddress,
    to: email,
    subject: 'Ny passordkode fra samledb',
    html: 'Heisann, skriv inn denne koden på reset-passordsiden <b>' + code + '</b><br><br>Hilsen SamleDB'
  };


  mailgun.messages().send(data, function (err, body) {
    //If there is an error, render the error page
    if (err) {
      callback({
        status: false
      });
    }
    else {
      callback({
        status: true
      });
    }
  });
};

module.exports = function(app, passport, dbQueries, config) {

  app.get('/api', function (req, res, next) {
    
  });


  app.get('/404', function(req, res) {
        res.send("error");
  });

  app.post('/api/signup', function(req, res) {
    if (!req.body.username || !req.body.password || !req.body.nick) {
      res.json({success: false, msg: 'Please pass name and password.'});
    } else {
      dbQueries.createUser(req.body.username, req.body.password, req.body.nick, function (user) {
        var token = jwt.encode(user, config.secret);
        if(user) {
          res.json({success: true, msg: 'Successful created new user.', token: 'JWT ' + token, user: user});
        } else {
          res.json({success: false, msg: 'Username already exists.'});
        }
      });
    }
  });


  app.post('/api/authenticate', function(req, res) {
    dbQueries.getUserFromUsername(req.body.username, function (user) {
      if(user) {
        user.comparePassword(req.body.password, function (err, isMatch) {
          if (isMatch && !err) {
            // if user is found and password is right create a token
            var token = jwt.encode(user, config.secret);
            // return the information including token as JSON
            res.json({success: true, token: 'JWT ' + token, user: user});
          } else {
            res.send({success: false, msg: 'Authentication failed. Wrong password.'});
          }
        });
      } else {
        res.send({success: false, msg: 'Authentication failed. User not found.'});
      }
    });
  });


  app.get('/api/jwt/me', passport.authenticate('jwt', { session: false}), function(req, res) {
    res.json(req.user);
  });



  app.get('/api/search/console/:phrase', function (req, res, next) {

    var searchPhrase = req.params.phrase;
    dbQueries.searchConsoles(searchPhrase, function (results) {
      res.json(results);
    });
  });

  app.get('/api/search/publisher/:phrase', function (req, res, next) {

    var searchPhrase = req.params.phrase;
    dbQueries.searchPublishers(searchPhrase, function (results) {
      res.json(results);
    });
  });

  app.get('/api/reset/password/:email', function (req, res) {
    dbQueries.setPasswordCode(req.params.email, function (response){
      if(response.status) {
        sendCodeMail(response.email, response.code, function(mailResponse) {
          if(mailResponse.status) {
            res.json({
              status: true,
              statusMessage: "E-post sendt"
            });
          } else {
            res.json({
              status: false,
              statusMessage: "Kunne ikke sende e-post"
            });
          }
        });
      } else {

      }
    });
  });

  app.get('/api/reset/password/verify/:email/:code', function (req, res) {
    dbQueries.verifyPasswordCode(req.params.email, req.params.code, false, function (response) {
      res.json(response);
    });
  });

  app.post("/api/reset/password", function (req, res) {
    dbQueries.setPasswordFromCodeAndEmail(req.body.email, req.body.code, req.body.newPassword, function (response) {
      if(response.status) {
        res.json({
          status: true
        });
      } else {
        res.json({
          status: false
        });
      }
    })
  });

  app.get('/api/search/title/:phrase', function (req, res, next) {

    var searchPhrase = req.params.phrase;
    dbQueries.searchGames(searchPhrase, function (results) {
      res.json(results);
    });
  });

  app.get('/api/events/get', function (req, res) {
    dbQueries.getEvents(function (events) {
      res.json(events);
    });
  });

  app.post('/api/jwt/event', passport.authenticate('jwt', { session: false}), function (req,res) {
    var event = req.body.event;
    event.referenceUserSlug = req.user.slug;
    event.referenceUserNick = req.user.nick;
    event.referenceUserId = req.user._id;
    event.referenceUserProfileImageId = req.user.profileImageId;

    dbQueries.insertEvent(event, function (event) {
      res.json(event);
    })
  });

  app.post('/api/check/username', function (req,res,next) {
    dbQueries.getUserFromUsername(req.body.username, function (user) {

      if(user)
        res.json(user);
      else
        res.json(401, user);
    });
  });

  app.post('/api/get/user/complete', function (req,res,next) {
    dbQueries.getSettings(function (settings) {
      
      dbQueries.getUserFromSlug(req.body.nickSlug, function (user) {
        dbQueries.getCollectionsFromUserId(user.id, function (collections) {
          dbQueries.getGamesForUserFromUserId(user.id, function (newGames) {
            res.json({
              games: newGames,
              newGames: newGames,
              user: user,
              settings: settings,
              collections: collections
            });
          });  
        });
      });
    });
  });



  app.post('/api/get/user/collection', function (req,res,next) {
    dbQueries.getCollectionFromId(req.body.collectionId, function (collection) {
      res.json(collection);
    });
  });

  app.get('/api/get/user/game/:gameId', function (req, res) {
    dbQueries.getGameFromId(req.params.gameId, function (game) {
      if(game) {
        dbQueries.getUserFromId(game.userId, function (user) {
          dbQueries.getCollectionFromId(game.collectionId, function (collection) {
            res.json({
              game: game,
              user: user,
              collection: collection
            })
          });
        });
      }
    });
  });

  app.post('/api/check/nick', function (req,res,next) {
    
    dbQueries.getUserFromNick(req.body.nick, function (user) {
      if(user)
        res.json(user);
      else
        res.json(401, user);
    });
  });

  app.get('/api/logout', function (req, res, next) {

    req.logout();
    res.json({
      status: 'logged out'
    });
  });

  app.get('/api/jwt/me/complete', passport.authenticate('jwt', { session: false}), function (req,res,next) {
    dbQueries.getSettings(function (settings) {
        dbQueries.getCollectionsFromUserId(req.user._id, function (collections) {
          dbQueries.getGamesForUserFromUserId(req.user._id, function (newGames) {
            res.json({
              games: newGames,
              newGames: newGames,
              user: req.user,
              settings: settings,
              collections: collections
            });
          });  
        });
      });
  });

  app.get('/api/jwt/me/collections', passport.authenticate('jwt', { session: false}), function (req, res, next) {
    dbQueries.getCollectionsFromUserId(req.user._id, function (collections) {
      res.json(collections);
    });
  });

  app.post('/api/jwt/me/bulk/delete', passport.authenticate('jwt', { session: false}), function (req, res) {
    var ids = req.body;
    dbQueries.deleteGames(ids, function (response) {
      res.json(response);
    });
  });

  app.post('/api/jwt/me/bulk/move', passport.authenticate('jwt', { session: false}), function (req, res) {
    var ids = req.body.games;
    var collectionId = req.body.collectionId;
    dbQueries.moveGames(ids, collectionId, function (response) {
      res.json(response);
    });
  });

  app.post('/api/jwt/me/bulk/copy', passport.authenticate('jwt', { session: false}), function (req, res) {
    var ids = req.body.games;
    var collectionId = req.body.collectionId;
    dbQueries.copyGames(ids, collectionId, function (response) {
      res.json(response);
    });
  });

  app.post('/api/jwt/me/update/collection', passport.authenticate('jwt', { session: false}), function (req, res) {
    
    dbQueries.updateCollection(req.body.collection, function (collection) {
      res.json(collection);
    });
  });

  app.post('/api/jwt/me/create/collection', passport.authenticate('jwt', { session: false}), function (req, res) {
    var title = req.body.title;
    var type = req.body.type;
    dbQueries.addCollection(title, req.user._id, type, function (collection) {
      res.json(collection);
    });
  });

  app.post("/api/jwt/me/update/description", passport.authenticate('jwt', { session: false}), function (req, res) {
    dbQueries.updateDescription(req.user._id, req.body.description, function () {
      res.json({
        description: req.body.description
      })
    });
  });

  app.post('/api/jwt/me/upload/userphoto', passport.authenticate('jwt', { session: false}), function (req, res) {
    addImage(req.body.image, function (addedImage) {
      dbQueries.addImageToUser(req.user._id, addedImage._id, function () {
        res.json({
          imageId: addedImage._id
        });
      });
    });
  });

  app.post('/api/jwt/me/upload/photo', passport.authenticate('jwt', { session: false}), function (req, res) {
    addImage(req.body.image, function (addedImage) {
        res.json({
          imageId: addedImage._id
        });
    });
  });


  app.post('/api/jwt/me/remove/userphoto', passport.authenticate('jwt', { session: false}), function (req, res) {
      dbQueries.removeImageFromUser(req.user._id, req.body.imageId, function () {
        res.json({
          imageId: req.body.imageId
        });
    });
  });


  app.post('/api/jwt/me/upload/profilephoto', passport.authenticate('jwt', { session: false}), function (req, res) {
    addImage(req.body.image, function (addedImage) {
      dbQueries.addProfileImageToUser(req.user._id, addedImage._id, function () {
        res.json({
          imageId: addedImage._id
        });
      });
    });
  });

  app.post('/api/jwt/me/upload/collectionphoto', passport.authenticate('jwt', { session: false}), function (req, res) {
    dbQueries.getCollectionFromId(req.body.collectionId, function (collection) {

      if(req.user._id.toString() == collection.collection.userId.toString()) {

        addImage(req.body.image, function (addedImage) {
          dbQueries.addCollectionPhotoToCollection(collection.collection._id, addedImage._id, function () {
            res.json({
              imageId: addedImage._id
            });
          });
        });

      }
    });
  });

  app.get("/api/add/consoles", function (req,res) {
    dbQueries.addConsoles(function (docs) {
      res.json(docs);
    });
  });

  app.get("/api/add/publishers", function (req,res) {
    dbQueries.addPublishers(function (docs) {
      res.json(docs);
    });
  });

  app.get("/api/add/games", function (req,res) {
    dbQueries.addGames(function (docs) {
      res.json(docs);
    });
  });

  app.get("/api/add/settings", function (req,res) {
    dbQueries.addSettings(function (docs) {
      res.json(docs);
    });
  });


  app.post('/api/add/game', function (req,res,next) {
    dbQueries.addGame(req.body, function (game) {
      res.json(game);
    });
  });

  app.post('/api/update/game', function (req,res,next) {

    dbQueries.updateGame(req.body, function (game) {
      res.json(game);
    });
  });


  app.post('/api/remove/game', function (req,res,next) {

    dbQueries.removeGame(req.body.gameId, function () {
      res.json({});
    });
  });

  app.post('/api/jwt/me/upload/image', passport.authenticate('jwt', { session: false}), function (req, res, next) {
    dbQueries.addImage(req.body.image, function (addedImage) {
      res.json({
        imageId: addedImage._id,
        image: addedImage
      });
    });
  });

  app.post('/api/jwt/me/set/profilephoto/:avatarnr', passport.authenticate('jwt', { session: false}), function (req, res, next) {
    dbQueries.setProfilePhotoAvatar(req.user._id, "avatar-" + req.params.avatarnr, function (avatarString) {
      res.json(avatarString);
    });
  });



  app.get('/api/send/testemail', function (req, res) {
    var mailgun = new Mailgun({apiKey: api_key, domain: domain});

    var data = {
      //Specify email data
      from: noReplyAddress,
      //The email to contact
      to: "jorgeja@gmail.com",
      //Subject and text data
      subject: 'Hello from Mailgun',
      html: 'Hello, This is not a plain-text email, I wanted to test some spicy Mailgun sauce in NodeJS! <a href="http://0.0.0.0:3030/validate?jorgeja@gmail.com">Click here to add your email address to a mailing list</a>'
    }

    //Invokes the method to send emails given the above data with the helper library
    mailgun.messages().send(data, function (err, body) {
      //If there is an error, render the error page
      if (err) {
        res.json('fail');
      }
      //Else we can greet    and leave
      else {
        //Here "submitted.jade" is the view file for this landing page
        //We pass the variable "email" from the url parameter in an object rendered by Jade
        res.json('success');
      }
    });
  });

  app.get('/*', function (req, res) {
    res.render('index');
  });

  var writeImageToFile = function (image, addedImage, callback) {
    image.toBuffer('jpg', {quality: 80}, function (err, buffer) {
      fs.writeFile(addedImage.location + addedImage._id + "." + addedImage.type, buffer, function (err) {
        callback(addedImage);
      });
    });
  };

  var constrainImage = function (image, callback) {
    var width = image.width();
    var height = image.height();
    if(width > 1400) {
      height = (image.height() / image.width()) * 1400;
      width = 1400;
    }
    image.resize(width, height, function (err, image) {
      callback(image);
    });
  }


  var addImage = function (newImageBuffer, callback) {
    dbQueries.addImage(function (addedImage) {

      var base64Data = newImageBuffer.replace(/^data:image\/jpeg;base64,/, '');
      var img = new Buffer(base64Data, 'base64');

      lwip.open(img, 'jpg', function (err, image) {

        new ExifImage({image: img}, function (error, exifData) {
          if(exifData && exifData.image) {
            if (exifData.image.Orientation == 2) {
              image.mirror("x", function (err, image) {
                constrainImage(image, function (image) {
                  writeImageToFile(image, addedImage, function (image) {
                    callback(image);
                  });
                });
              });
            }

            else if (exifData.image.Orientation == 3) {
              image.mirror("xy", function (err, image) {
                constrainImage(image, function (image) {
                  writeImageToFile(image, addedImage, function (image) {
                    callback(image);
                  });
                });
              });
            }

            else if (exifData.image.Orientation == 4) {
              image.mirror("y", function (err, image) {
                constrainImage(image, function (image) {
                  writeImageToFile(image, addedImage, function (image) {
                    callback(image);
                  });
                });
              });
            }

            else if (exifData.image.Orientation == 5) {
              image.rotate(90, function (err, image) {
                image.mirror("x", function (err, image) {
                  constrainImage(image, function (image) {
                    writeImageToFile(image, addedImage, function (image) {
                      callback(image);
                    });
                  });
                });
              });
            }

            else if (exifData.image.Orientation == 6) {
              image.rotate(90, function (err, image) {
                constrainImage(image, function (image) {
                  writeImageToFile(image, addedImage, function (image) {
                    callback(image);
                  });
                });
              });
            }

            else if (exifData.image.Orientation == 7) {
              image.rotate(-90, function (err, image) {
                image.mirror("x", function (err, image) {
                  constrainImage(image, function (image) {
                    writeImageToFile(image, addedImage, function (image) {
                      callback(image);
                    });
                  });
                });
              });
            }

            else if (exifData.image.Orientation == 8) {
              image.rotate(-90, function (err, image) {
                constrainImage(image, function (image) {
                  writeImageToFile(image, addedImage, function (image) {
                    callback(image);
                  });
                });
              });
            }

            else {
              constrainImage(image, function (image) {

                writeImageToFile(image, addedImage, function (image) {
                  callback(image);
                });
              });
            }
          } else {
            constrainImage(image, function (image) {

              writeImageToFile(image, addedImage, function (image) {
                callback(image);
              });
            });
          }

        });
      });
    });
  };
}