/**
 * SubmissionController
 */

module.exports = {

create: function (req, res) {
    console.log("creating submission");
    var submissionDetails = {
      user: req.user.username,
      problem: req.param("problem"),
      code: req.param("code"),
      style: JSON.parse(req.param("style")),
      value: {correct: 2, style: 2},
      fbRequested: false
    };
    Submission.create(submissionDetails).done(function(err, submission) {
    console.log("creating submission...");

      if (err) {
            console.log("err:" + err);

        res.send(500, {error: "DB Error creating new team"});
                console.log(err);
      } else {
            console.log("creating submission!!!");

        var currentScore = parseFloat(submissionDetails.value.correct).toFixed(4) + parseFloat(submissionDetails.value.style).toFixed(4);
        res.send(submission);
      } 
    });
  },


  /**
   * Action blueprints:
   *    `/submission/read`
   */
   read: function (req, res) {
        var problem = req.param("id");
        var subId = req.param("subId");
        var student = req.param("student");
        var recent = req.param("recent");
        var feedback = req.param("feedback");
        var feedbackSeen = req.param("feedbackSeen");
        var currentUser = req.param("currentUser");
        var mostRecent = req.param("mostRecent");
        var deleteCount = req.param("deleteCount");

        var ascending = req.param("ascending");
        var limitOne = req.param("limitOne");

        if(subId){  // Get Submission by its Id
          console.log("get submission by id");
            Submission.findOne({id:subId}).exec(function (err, submission) {
                if (err) {
                    console.log("error getting submission from database");
                } else {
                    res.send(submission);
                }
            });
        }else if(mostRecent){ // Get most recent submission for a problem
            var now = new Date();
            var currentSeconds = parseFloat(now.getSeconds());
            var changeSeconds = parseFloat(mostRecent);
            var seconds = currentSeconds - changeSeconds - 5; ///FUDGE FACTOR of 5 seconds so stuff doesn't slip between cracks
            now.setSeconds(seconds);
            Submission.find({problem: problem, mostRecent: null, updatedAt: { '>': now }}).exec(function(err, submissions) {
                if (err) {
                    console.log(err);
                } else {
                    res.send(submissions);
                }
            });
        }else {

          var opts = {};
          if(problem){
            opts['problem'] = problem;
          }
          if(student){
            opts['user'] = student;
          }
          if(currentUser){
            opts['user'] = req.user.username;
          }
          if(feedback){
            opts['fbRequested'] = true;
            opts['fbResponseTime'] = null;
          }
          if(feedbackSeen){
            opts['feedbackSeen'] = feedbackSeen;
          }

          ///////////////////////////

          var sort = {};
          if(feedback){
            if(ascending){
              sort['fbRequestTime'] = 1;
            }else {
              sort['fbRequestTime'] = -1;
            }     
          }else if(feedbackSeen){
            if(ascending){
              sort['fbResponseTime'] = 1;
            }else {
              sort['fbResponseTime'] = -1;
            }     
          }else {
            if(ascending){
              sort['createdAt'] = 1;
            }else {
              sort['createdAt'] = -1;
            }
          }

          ///////////////////////////

          var limit = "";
          if(limitOne){
            limit = 1;
          }

          Submission.find(opts).sort(sort).limit(limit).exec(function(err, submissions) {
                if (err) {
                    console.log("error getting submissions from database");
                } else {
                    res.send(submissions);
                }
            });

        }

        /*

        } else if(deleteCount){ 
          console.log("deleteCount");
            Submission.find({problem: problem}).exec(function(err, submissions) {
                if (err) {
                    console.log("error getting submissions from database");
                } else {
                    res.send(submissions);
                }
            });
        }else if(mostRecent){ // Get most recent submission for a problem
            var now = new Date();
            console.log("-------------------------" );
            var currentSeconds = parseFloat(now.getSeconds());
            var changeSeconds = parseFloat(mostRecent);
            var seconds = currentSeconds - changeSeconds - 5; ///FUDGE FACTOR of 5 seconds so stuff doesn't slip between cracks
            now.setSeconds(seconds);
            console.log(now);
            Submission.find({problem: problem, mostRecent: null, updatedAt: { '>': now }}).exec(function(err, submissions) {
                if (err) {
                    console.log(err);
                } else {
                    res.send(submissions);
                }
            });
        }else if(feedback){ // Get all Submission awaiting feedback
            Submission.find({fbRequested: true, fbResponseTime: null}).sort({fbRequestTime: direction}).exec(function(err, submissions) {
                if (err) {
                    console.log("error getting submissions from database");
                } else {
                    res.send(submissions);
                }
            });
        }else if(recent){ // Get User's problems sorted by most recent first
            Submission.find({problem: problem, user: req.user.username}).sort({createdAt: direction}).limit(1).exec(function(err, submissions) {
                if (err) {
                    console.log("error getting submissions from database");
                } else {
                    res.send(submissions);
                }
            });
        } else if (problem && !student) { //Gets all my Submissions for problem
            Submission.find({problem: problem, user: req.user.username}).sort({createdAt: direction}).exec(function(err, submissions) {
                if (err) {
                    console.log("error getting submissions from database");
                } else {
                    res.send(submissions);
                }
            });
        } else if (problem && student) { //Gets all specific user's submisions for a problem
            Submission.find({problem: problem, user: student}).sort({createdAt: direction}).exec(function(err, submissions) {
                if (err) {
                    console.log("error getting submissions from database");
                } else {
                    res.send(submissions);
                }
            });
        } else if (!problem && student) { //Gets all a user's submissions
            Submission.find({user: student}).sort({createdAt: direction}).exec(function(err, submissions) {
                if (err) {
                    console.log("error getting submissions from database");
                } else {
                    res.send(submissions);
                }
            });
        } else if(!currentUser){ 
            Submission.find().sort({createdAt: direction}).exec(function(err, submissions) {
                if (err) {
                    console.log("error getting submissions from database");
                } else {
                    res.send(submissions);
                }
            });
       } else {
            Submission.find({user: req.user.username}).sort({createdAt: direction}).exec(function(err, submissions) {
                if (err) {
                    console.log("error getting submissions from database");
                } else {
                    res.send(submissions);
                }
            });
       }
      */
  },


  /**
   * Action blueprints:
   *    `/submission/update`
   */
   update: function (req, res) {
    var id = req.param("id");
    var fbRequested = req.param("fbRequested");
    var fbRequestTime = req.param("fbRequestTime");
    var fbRequestMsg = req.param("fbRequestMsg");

    var fbResponder = req.param("fbResponder");
    var fbResponseTime = req.param("fbResponseTime");
    var fbResponseMsg = req.param("fbResponseMsg");
    var fbCode = req.param("fbCode");

    var shareOK = req.param("shareOK");
    var shared = req.param("shared");
    var feedbackSeen = req.param("feedbackSeen");


    if(feedbackSeen){
      if(shared == "true"){
        shared = true;
      }else {
        shared = false;
      }
      Submission.update({id: id},{feedbackSeen:Boolean(feedbackSeen)},{ upsert: true }).exec(function(err, submission) {
          if(err) {
              console.log(err);
          } else {
            Submission.findOne({id: id}).exec(function(err, submission) {
                if (err) {
                    console.log("error getting submission from database");
                } else {
                    res.send(submission);
                }
            });
          }
      });
    }else if(shared){
      if(shared == "true"){
        shared = true;
      }else {
        shared = false;
      }
      Submission.update({id: id},{shared:shared},{ upsert: true }).exec(function(err, submission) {
          if(err) {
              console.log(err);
          } else {
            Submission.findOne({id: id}).exec(function(err, submission) {
                if (err) {
                    console.log("error getting submission from database");
                } else {
                    res.send(submission);
                }
            });
          }
      });
    }else if(shareOK){
      if(shareOK == "true"){
        shareOK = true;
      }else {
        shareOK = false;
      }
      Submission.update({id: id},{shareOK:shareOK},{ upsert: true }).exec(function(err, submission) {
          if(err) {
              console.log(err);
          } else {
            Submission.findOne({id: id}).exec(function(err, submission) {
                if (err) {
                    console.log("error getting submission from database");
                } else {
                    res.send(submission);
                }
            });
          }
      });
    }else if(fbRequested){
      if(fbRequested == "true"){
        fbRequested = true;
      }else {
        fbRequested = false;
      }
      Submission.update({id: id},{fbRequested:fbRequested, fbRequestTime:fbRequestTime, fbRequestMsg:fbRequestMsg},{ upsert: true }).exec(function(err, submission) {
          if(err) {
              console.log(err);
          } else {
            Submission.findOne({id: id}).exec(function(err, submission) {
                if (err) {
                    console.log("error getting submission from database");
                } else {
                    res.send(submission);
                }
            });
          }
      });
    }else {
      Submission.update({id: id},{fbResponder:fbResponder, fbResponseTime:fbResponseTime, fbResponseMsg:fbResponseMsg, fbCode:fbCode, feedbackSeen:false},{ upsert: true }).exec(function(err, submission) {
          if(err) {
              console.log(err);
          } else {
            Submission.findOne({id: id}).exec(function(err, submission) {
                if (err) {
                    console.log("error getting submission from database");
                } else {
                    res.send(submission);
                }
            });
          }
      });

    }

  },


  /**
   * Action blueprints:
   *    `/submission/delete`
   */
   delete: function (req, res) {
    var id = req.param("id");
    Submission.destroy({id: id}).done(function(err, submission){
        if(err){
            console.log(err);
        } else {
        }
    });
    // Send a JSON response
    /*return res.json({
      hello: 'world'
    });*/
  },




  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to SubbmissionController)
   */
  _config: {}

  
};
