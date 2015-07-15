/**
 * SubmissionController
 */

module.exports = {

	create: function (req, res) {
		var submissionDetails = {
			user: req.user.username,
			problem: req.param("problem"),
			code: req.param("code"),
			style: JSON.parse(req.param("style")),
			value: {correct: 2, style: 2},
      fbRequested: false

		};
		Submission.create(submissionDetails).done(function(err, submission) {
			if (err) {
				res.send(500, {error: "DB Error creating new team"});
                console.log(err);
			} else {
        var currentScore = parseInt(submissionDetails.value.correct) + parseInt(submissionDetails.value.style);
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
        var highest = req.param("highest");
        var student = req.param("student");
        var reverse = req.param("reverse");
        var recent = req.param("recent");
        var feedback = req.param("feedback");
        var currentUser = req.param("currentUser");

        var direction = 1;
        if(reverse){
          direction = -1;
        }

        if(subId){
          console.log("get submission by id");
            Submission.findOne({id:subId}).exec(function (err, submission) {
                if (err) {
                    console.log("error getting submission from database");
                } else {
                    res.send(submission);
                }
            });
        }else if(feedback){
            Submission.find({fbRequested: true, fbResponseTime: null}).sort({fbRequestTime: direction}).exec(function(err, submissions) {
                if (err) {
                    console.log("error getting submissions from database");
                } else {
                    res.send(submissions);
                }
            });
        }else if(recent){
            Submission.find({problem: problem, user: req.user.username}).sort({createdAt: direction}).limit(1).exec(function(err, submissions) {
                if (err) {
                    console.log("error getting submissions from database");
                } else {
                    res.send(submissions);
                }
            });
        } else if (problem && !student) {
            Submission.find({problem: problem, user: req.user.username}).sort({createdAt: direction}).exec(function(err, submissions) {
                if (err) {
                    console.log("error getting submissions from database");
                } else {
                    res.send(submissions);
                }
            });
        } else if (problem && student) {
            Submission.find({problem: problem, user: student}).sort({createdAt: direction}).exec(function(err, submissions) {
                if (err) {
                    console.log("error getting submissions from database");
                } else {
                    res.send(submissions);
                }
            });
        } else if (!problem && student) {
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
    console.log(id);
    console.log(fbRequested);
    console.log(fbRequestTime);
    console.log(fbRequestMsg);

    var fbResponder = req.param("fbResponder");
    var fbResponseTime = req.param("fbResponseTime");
    var fbResponseMsg = req.param("fbResponseMsg");
    var fbCode = req.param("fbCode");
    console.log(fbResponder);
    console.log(fbResponseTime);
    console.log(fbResponseMsg);
    console.log(fbCode);

    var shareOK = req.param("shareOK");
    var shared = req.param("shared");
    var feedbackSeen = req.param("feedbackSeen");


    if(feedbackSeen){
      if(shared == "true"){
        shared = true;
      }else {
        shared = false;
      }
      Submission.update({id: id},{feedbackSeen:feedbackSeen},{ upsert: true }).exec(function(err, submission) {
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
      Submission.update({id: id},{fbResponder:fbResponder, fbResponseTime:fbResponseTime, fbResponseMsg:fbResponseMsg, fbCode:fbCode},{ upsert: true }).exec(function(err, submission) {
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
