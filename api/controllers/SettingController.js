/**
 * SettingController
 */

module.exports = {
    
  /**
   * Action blueprints:
   *    `/setting/read`
   */
   read: function (req, res) {
      var name = req.param("name") || null;
        Setting.findOne({"name":name}).exec(function (err, setting) {
          if (err) {
            res.send(500, {error: "DB error finding setting"});
            return;
          } else {
            res.send(setting);
          }
        });
  },

  
  /**
   * Action blueprints:
   *    `/folder/update`
   */
   
   update: function (req, res) {
        var name = req.param("name");
        var on = req.param("on");
        var value = req.param("value");
        console.log(name + value);

        if(on && !value){
            console.log("on is not null");
          if(on == "true"){
            on = true;
          }else {
            on = false;
          }
            Setting.update({name:name}, {on: on}).exec(function(err2, setting) {
                if(err2) {
                    console.log(err2);
                } else {
                    res.send(setting);
                }
            });
        }else {
            console.log("setting..." + name + value);

            Setting.update({name:name}, {value: parseInt(value)}).exec(function(err2, setting) {
                if(err2) {
                    console.log(err2);
                } else {
                    res.send(setting);
                }
            });
        }
  },


  /**
   * Action blueprints:
   *    `/folder/destroy`
   */

   /*
	delete: function (req, res) {
		var id = req.param("id");
		Folder.destroy({id: id}).done(function(err){
			if(err){
				console.log(err);
			} else {
			}
		});
    //delete all children problems
    Problem.find({folder: id}).done(function(err, problems){
        problems.forEach( function (problem) {
            Problem.destroy({id: problem.id}).done(function(err, problem){
              if(err){
                  console.log(err);
              } else {
              }
            });
            //delete all children submissions
            Submission.find({problem: problem.id}).done(function(err, submissions){
              submissions.forEach( function (submission) {
                  Submission.destroy({id: submission.id}).done(function(err, submission){
                    if(err){
                        console.log(err);
                    } else {
                    }
                  });
                });
            });
        });
    });
    res.end();

	},

   reorder: function (req, res) {
      Folder.find()
      .sort({"num": 1, "updatedAt":-1})
      .exec(function(err, folders) {
        var num = 0;
        folders.forEach(function(folder) {
            console.log("folder: " + folder.name);

            console.log("old: " + folder.num);
            folder.num = Number(num);
            console.log("new: " + folder.num);

            folder.save( function(err) {
                if(err) {
                    console.log(err);
                }
            });
            num++;
        });
      });
    res.end();
  },



  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to FolderController)
   */
  _config: {}

  
};
