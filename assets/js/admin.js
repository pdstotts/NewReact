
//Color submission status boxes
function correct(){
   return $("<span class='glyphicon glyphicon-ok'></span>").css("color", "green").css("margin-right", "5px");
}
function wrong(){
   return $("<span class='glyphicon glyphicon-remove'></span>").css("color", "red").css("margin-right", "5px");
}
function exclam(){
   return $("<span class='glyphicon glyphicon-exclamation-sign'></span>").css("color", "red").css("margin-right", "5px");
}
function scoreBadge(a,b){
    var check;
    if(a == b){
        check = correct();
    }else {
        check = wrong();
    }
    var badge = $("<span class='badge'></span>").append(a + "/" + b);
    return $("<span></span>").append(badge).append(check);
}


function fillProblemEdit(problem) {
	$("#edit").removeClass("hidden");
	$("#editPlaceholder").addClass("hidden");
	$("#editType").val(problem.type);
	$("#editPhase").val(problem.phase);
	$("#editProblemName").val(problem.name);
    $("#editFolderDropdown").val(problem.folder);
    $("#editLanguageDropdown").val(problem.language);
    if(problem.testMode == true){
        $("#editModeDropdown").val("true");
    }else {
        $("#editModeDropdown").val("false");
    }
    $("#editDescription").val(problem.text);
    $("#editStylePoints").val(problem.value.style),
    $("#editCorrectPoints").val(problem.value.correct),
    $("#editOnSubmit").val(problem.onSubmit);
    $("#deleteProblem").removeClass("hidden");   
    $( "#deleteProblem" ).unbind().click(function() {   
        if (confirm('Are you sure you wish to delete the problem ' + problem.name + '?')) {
            emptyProblem();
            reloadFolders();
            $.post("/problem/delete", {id: problem.id}, function () {
                $.post("/problem/reorder", {folder: problem.folder}, function () {

                });
            });
        }
    });
}

function emptyProblem(){
    console.log("empty");
    $("#edit").addClass("hidden");
    $("#editPlaceholder").removeClass("hidden");
    $("#pointbreakdown").addClass("hidden");
    $("#problemDisplayName").empty().append("Choose a Problem");
    $("#problemDisplayBody").empty().append("Select a problem from the left to view more information.");
}

function fillProblemDisplay(problem) {
    $("#pointbreakdown").removeClass("hidden");
    $("#problemDisplayName").empty().append(problem.name);
    $.post("/folder/read/", {id: problem.folder}, function(folder){
        $("#problemDisplayName").html(problem.name + "<i> in " + folder.name + "</i>");
    });
    $("#problemDisplayBody").empty().append(problem.text);
    $("#availablePtStyle").empty().append(problem.value.style);
    $("#availablePtCorrect").empty().append(problem.value.correct);
}

function feedbackRequestButton(submission,user,problem){
    var button = $("<a></a>")
        .attr("href","#submission")
        .attr("data-toggle","pill")  //save
        .css("color","#627E86")
        .attr("class","")
        .css("padding-left","4px;")
        .html('<span><span class="glyphicon glyphicon-exclamation-sign"  data-toggle="tooltip" data-placement="top" title="Feedback Request"></span>') // the trailing space is important!
        .click(function (event) {
            event.preventDefault();
            getSubmission(submission,user,problem);
        });
    return button;
}

function shareButton(submission,user,problem){
    var button = $("<a></a>")
        .attr("data-toggle","modal")  //save
        .attr("data-target","#shareSubmissionModal")  //save
        .attr("id","shareMe" + submission.id)
        .css("color","#627E86")
        .attr("class","")
        .css("padding-left","4px;")
        .css("cursor","pointer")
        .html('<span><span class="glyphicon glyphicon-share" data-toggle="tooltip" data-placement="top" title="Share Request"></span>')
        .click(function (event) {
            event.preventDefault();
            fillModal(submission,user,problem);
        });
    return button;
}

function getStudentResults(problem) {
    //Loads results of all students on a particular problem
    numfunct = 0;
    numstyle = 0;
    numattempted = 0;
    numearned = 0;
    $("#matrixBody").empty();
    var tbl = $("<table class='table' style='margin-bottom:0px;'><thead><tr><th>Name</th><th class='probStudentSubmissionTableTD'># Tries</th><th class='probStudentSubmissionTableTD'>Functionality</th><th class='probStudentSubmissionTableTD'>Style Points</th></tr></thead><tbody id='allStudents1ProblemResults'></tbody></table>");
    $("#allStudents1ProblemTable").empty().append(tbl);
    $.post("/user/read/", {}, function(users){
        total = users.length;
        users.forEach(function (user) {
            var matrixSquare = $("<div></div>")
                .attr('class','matrixSquare alert alert-danger')
                .attr('id','matrix' + user.id);

            var matrixSquarehover = $("<div></div>")
                .attr('class','matrixSquareHover')
                .attr('id','matrixHover' + user.id)
                .attr('data-iconcount',0);

            var userButton = $("<a href='#individualStudent' data-toggle='pill' ></a>")
            .css("color","#627E86")
            .css("padding-left","4px;")
            .attr("class","")
            .html("<span><span class='glyphicon glyphicon-user' data-toggle='tooltip' data-placement='top' title='View User' ></span>") // the trailing space is important!
            .click(function () {
                event.preventDefault();
                $.post("/user/read/" + user.id, {}, function (user) {
                    if (!user) {
                        alert("No user with that id found");
                        return;
                    }
                    getIndividual(user,false);
                });
            });
            $('[data-toggle="tooltip"]').tooltip();

            //must enable tooltips
            //$('[data-toggle="tooltip"]').tooltip()


            matrixSquarehover.append(userButton);
            matrixSquare.append(user.username);
            matrixSquare.append("<br />");
            matrixSquare.append(matrixSquarehover);



            $("#matrixBody").append(matrixSquare);
            $('#matrix' + user.id).mouseover(function() { $('#matrixHover' + user.id).css('visibility','visible'); });
            $('#matrix' + user.id).mouseout(function() { $('#matrixHover' + user.id).css('visibility','hidden'); });

            var a = $("<td></td>")
                .html("<a href='#individualStudent' data-toggle='pill'>" + user.displayName + "</a>")
                .click(function (event) {
                    event.preventDefault();
                    $.post("/user/read/" + user.id, {}, function (user) {
                        if (!user) {
                            alert("No user with that id found");
                            return;
                        }
                        getIndividual(user,false);
                    });
                });
            var student = $("<tr></tr>");
            student.append(a);
            problemCorrect(user, problem, student, users.length);
        });
    });
}

function updateProblemProgressBar(){
    if(curProblem == null){
        return;
    }
    problem = curProblem;
    numfunct = 0;
    numstyle = 0;
    numattempted = 0;
    numearned = 0;

    $.post("/user/read/", {}, function(users){
        users.forEach(function (user) {
            var results = {tried: false, correct: false, style: false};
            $.post("/submission/read/" + problem.id, {id: problem.id, student: user.username}, function(submissions){
                if(submissions.length == 0){
                } else {
                    results.tried = true;
                    submissions.forEach(function(submission) {
                        if(submission.value.correct == problem.value.correct && submission.value.style == problem.value.style) {
                            results.correct = true;
                            results.style = true;
                            return true;
                        }
                        else if(submission.value.correct == problem.value.correct && submission.value.style != problem.value.style) {
                            results.correct = true;
                        }
                    });
                }

                if(results.tried) {
                    numattempted++;
                    if(results.correct) {
                        numfunct++;
                    }
                    if(results.style) {
                        numstyle++;
                    }
                    if(results.correct && results.style){
                        numearned++;
                    }
                }
                //update progress labels
                $("#function").empty().append(Math.floor((numfunct/total)*100)+"%");
                $("#style").empty().append(Math.floor((numstyle/total)*100)+"%");
                $("#pbp-yellow").css("width",Math.floor(((numattempted-numearned)/total)*100)+"%");
                $("#pbp-green").css("width",Math.floor((numearned/total)*100)+"%");
            });
        });
    });
}

function problemCorrect(user, problem, student, totalStudents){
    //check score of a student for a problem
    var rsectionF = $("<td>").attr("class","probStudentSubmissionTableTD");
    var rsectionS = $("<td>").attr("class","probStudentSubmissionTableTD");

    var results = {tried: false, correct: false, style: false, feedbackRequested: false, shareOK: false, shareRequested:false};
    $.post("/submission/read/" + problem.id, {id: problem.id, student: user.username, reverse: true}, function(submissions){
        if(submissions.length == 0){
            student.append("<td class='probStudentSubmissionTableTD'>" + submissions.length + "</td>");
        } else {
            var myVariable = $("<td>").attr("class","probStudentSubmissionTableTD");
            var a = $("<a></a>")
                .html(submissions.length)
                .click(function (event) {
                    if($(".submissionUser"+user.id).hasClass("hidden")) {
                        $(".submissionUser"+user.id).removeClass('hidden');
                    } else {
                        $(".submissionUser"+user.id).addClass('hidden');
                    }
            });

            myVariable.append(a);
        	student.append(myVariable);

            results.tried = true;
            submissions.forEach(function(submission) {
                if(feedbackOn){
                    if(submission.fbRequested == true && submission.fbResponseTime == null){
                        results.feedbackRequested = true;
                        $("#matrixHover" + user.id).append(feedbackRequestButton(submission,user,problem));
                        $('[data-toggle="tooltip"]').tooltip()
                        var iconCount = $("#matrixHover" + user.id).attr("data-iconcount");
                        iconCount = parseInt(iconCount);
                        iconCount++;
                        $("#matrixHover" + user.id).attr("data-iconcount",iconCount);
                    }
                }
                if(shareOn){
                    if(submission.shareOK && submission.shared != true){
                        results.shareRequested = true;
                        $("#matrixHover" + user.id).append(shareButton(submission,user,problem));
                        $('[data-toggle="tooltip"]').tooltip()
                        var iconCount = $("#matrixHover" + user.id).attr("data-iconcount");
                        iconCount = parseInt(iconCount);
                        iconCount++;
                        $("#matrixHover" + user.id).attr("data-iconcount",iconCount);
                    }
                }

                if(submission.value.correct == problem.value.correct && submission.value.style == problem.value.style) {
                    results.correct = true;
                    results.style = true;
                    return true;
                }
                else if(submission.value.correct == problem.value.correct && submission.value.style != problem.value.style) {
                    results.correct = true;
                }

            });
        }

        if(results.feedbackRequested == true || results.shareRequested == true){
            $("#matrix" + user.id).addClass("blink");
        }
        if(results.tried) {
            numattempted++;
            $("#matrix" + user.id).removeClass("alert-danger").addClass("alert-warning");

            if(results.correct) {
                numfunct++;
                rsectionF.append(correct("8px"));
            }else {
                rsectionF.append(wrong("8px"));
            }
            if(results.style) {
                numstyle++;
                rsectionS.append(correct("8px"));
            }else {
                rsectionS.append(wrong("8px"));
            }
            if(results.correct && results.style){
                numearned++;
                $("#matrix" + user.id).removeClass("alert-warning").addClass("alert-success");
            }
        }


        var myRows = [];
		submissions.forEach( function (submission) {
            var width = $( "#allStudents1ProblemTable" ).width();
            var submissionRow = $("<tr class='hidden submissionUser" + user.id + "'>");
            var d = new Date(submission.createdAt);
			var a = $("<a></a>")
				.attr("href","#submission")
				.attr("data-toggle","pill")  //save
                .html(d.toLocaleString())
                .click(function (event) {
                    event.preventDefault();
                        getSubmission(submission,user,problem);
            });
        	submissionRow.append("<td>");
            submissionRow.append($("<td class='probStudentSubmissionTableTD'></td>").append(a));
            var iconF = submission.value.correct ==  problem.value.correct ? correct("8px") : wrong("8px");
            var iconS = submission.value.style ==  problem.value.style ? correct("8px") : wrong("8px");
            submissionRow.append($("<td class='probStudentSubmissionTableTD'></td>").append(scoreBadge(submission.value.correct,problem.value.correct)));
            submissionRow.append($("<td class='probStudentSubmissionTableTD'></td>").append(scoreBadge(submission.value.style,problem.value.style)));
            myRows.push(submissionRow);
        });

        student.append(rsectionF);
        student.append(rsectionS);
        $("#allStudents1ProblemResults").append(student);
        for (var index = 0; index < myRows.length; index++) {
            $("#allStudents1ProblemResults").append(myRows[index]);
        }

        //update progress labels
        $("#function").empty().append(Math.floor((numfunct/total)*100)+"%");
        $("#style").empty().append(Math.floor((numstyle/total)*100)+"%");
        $("#pbp-yellow").css("width",Math.floor(((numattempted-numearned)/total)*100)+"%");
        $("#pbp-green").css("width",Math.floor((numearned/total)*100)+"%");
    });
}

function fillModal(submission,user,problem){
    var d = new Date(submission.createdAt);
    $("#subModal").empty().append(user.displayName + " on " + d.toLocaleString());
    modalEditor.setValue(submission.code);
    //weird trick to make sure the codemirror box refreshes
    var that = this;  
    setTimeout(function() {
        that.modalEditor.refresh();
    },10);
    var button = $("<a></a>")
        .attr("href","project?subId=" + submission.id)
        .attr("target","_blank")
        .attr("type","button")
        .addClass("btn btn-success ")
        .text("Project").click(function (event) {
            $.post("/submission/update", {id: submission.id, shared:true}, function (submission) {
                $("#shareMe" + submission.id).remove();
                var iconCount = $("#matrixHover" + user.id).attr("data-iconcount");
                iconCount = parseInt(iconCount);
                iconCount--;
                $("#matrixHover" + user.id).attr("data-iconcount",iconCount);
                if(iconCount == 0){
                    $("#matrix" + user.id).removeClass("blink");
                }
            });
       });
    $("#projectSubmissionButton").empty().append(button);

    var button = $("<a></a>")
        .attr("href","project?subId=" + submission.id)
        .attr("target","_blank")
        .attr("data-dismiss","modal")
        .addClass("btn btn-danger ")
        .text("Dismiss").click(function (event) {
            $.post("/submission/update", {id: submission.id, shared:true}, function (submission) {
                $("#shareMe" + submission.id).remove();
                var iconCount = $("#matrixHover" + user.id).attr("data-iconcount");
                iconCount = parseInt(iconCount);
                iconCount--;
                $("#matrixHover" + user.id).attr("data-iconcount",iconCount);
                if(iconCount == 0){
                    $("#matrix" + user.id).removeClass("blink");
                }
            });
       });

    $("#dimissShareButton").empty().append(button);

}

function getFeedbackDash() {
    if(curFeedback != null){
        fillFeedbackDash(curFeedback); 
    }

    //Generate feedback dash
    $("#feedbackDash").empty();
    $.post("/submission/read/", {feedback: true}, function(submissions){
        submissions.forEach(function (submission) {

            $.post("/problem/read", {id: submission.problem}, function (problem) {
                if (problem) {
                    var row = $("<tr></tr>");
                    var time = submission.fbRequestTime;
                    if(time != null){
                        time = new Date(submission.fbRequestTime).toLocaleString();
                    }
                    var a = $("<a></a>")
                        .html(time)
                        .click(function (event) {
                            curFeedback = submission;            
                            getFeedbackDash();
                            $("#fbDashBody").removeClass("hidden");
                       });
                    if(curFeedback != null){
                        if(curFeedback.id == submission.id){
                            console.log('match');
                            row.append($("<td></td>").append(time));
                        }else {
                            row.append($("<td></td>").append(a));
                        }
                    }else {
                        row.append($("<td></td>").append(a));
                    }

                    row.append($("<td></td>").append(submission.user));
                    row.append($("<td></td>").append(problem.name));
                    row.append($("<td></td>").append(scoreBadge(submission.value.correct,problem.value.correct)));
                    row.append($("<td></td>").append(scoreBadge(submission.value.style,problem.value.style)));

                    $("#feedbackDash").append(row);
                }
            });
        });
    });
};

function fillFeedbackDash(submission){
    var time = submission.fbRequestTime;
    if(time != null){
        time = new Date(submission.fbRequestTime).toLocaleString();
    }

    console.log(submission.user);
    $.post("/user/read", {onyen: submission.user}, function (user) {
        if (user) {
            $("#fbDashRequester").empty().append("<b> by " + user.displayName +  "</b>");
        }
    });

    $.post("/problem/read", {id: submission.problem}, function (problem) {
        if (problem) {
            $("#desc-body").empty().append(problem.text);
            $("#desc-title").empty().append(problem.name);
        }
    });

    $("#fbDashRequestTime").empty().append("<b>Request made at " + time + "</b>");

    $("#fbDashConsole").empty().append(submission.message);
    feedbackEditor.setValue(submission.code);
    var that = this;
    setTimeout(function() {
        that.feedbackEditor.refresh();
    },1);
    
    if(submission.message == "" || submission.message == null){
        $("#fbDashRequestMsg").empty().append("No message");
    }else {
        $("#fbDashRequestMsg").empty().append('"' + submission.fbRequestMsg + '"');

    }

}


function getStudentList() {
    //Generate list of all students to view individuals
    $("#viewStudentsList").empty();
    var tbl = $("<table class='table' id='viewStudentsTable'></table>");
    //var tbl = $("<ul id='viewStudentsTable'></ul>");

    var csv = "onyen%2Cgrade";

    $("#viewStudentsList").append(tbl);
    $.post("/user/read/", {}, function(users){
        total = users.length;
        var student = $("<tr></tr>");
        var count = 0;
        users.forEach(function (user) {
            var badge = $("<span class='badge'></span>").append(user.currentScore + "/" + points);
            var link = $("<a></a>")
                .attr("href","#individualStudent")
                .attr("data-toggle","pill")
                .append(user.displayName + "<br />")
                .append(badge);

            csv = csv + "%0A" + user.username + "," + user.currentScore;
            var a = $("<td></td>")
                .append(link)
                .click(function (event) {
                    event.preventDefault();
                    $.post("/user/read/" + user.id, {}, function (user) {
                        if (!user) {
                            alert("No user with that id found");
                            return;
                        }
                        getIndividual(user,false);
                    });
                });            
            student.append(a);
            count++;
            if(count > 3){
                $("#viewStudentsTable").append(student);
                student = $("<tr></tr>");
                count = 0;
            }
        });
        $("#exportCSV").click(function (event) {
            window.location.href = 'data:application/octet-stream,' + csv;
        });
        $("#viewStudentsTable").append(student);
    });
}

function getSubmission(submission,user,problem) {
    //Generate page for particular submission    

    curSubmission = submission;

    //FILLING iN TOP PANEL
	var d = new Date(submission.createdAt);
    $("#submissionCreatedAt").html(d.toLocaleString());

    var currentId = submission.id;
    var studentLink = $("<a></>")
    	.attr("href","#individualStudent")
    	.attr("data-toggle","pill")
    	.html(user.displayName)
        .click(function (event) {
            event.preventDefault();
            $.post("/user/read/" + user.id, {}, function (user) {
                if (!user) {
                    alert("No user with that id found");
                    return;
                }
                getIndividual(user,false);
            });
        });
    $("#submissionCreatedBy").empty().append(studentLink);

    var problemLink = $("<a></>")
    	.attr("href","#questions")
    	.attr("data-toggle","pill")
    	.html(problem.name)
        .click(function (event) {
            event.preventDefault();
	        curProblem = problem;
	        fillProblemEdit(curProblem);
	        fillProblemDisplay(curProblem);
	        getStudentResults(curProblem);

        });
    $("#submissionProblem").empty().append(problemLink);
    $("#relatedSubmissions").empty();
    $("#SearnedPtCorrect").html(submission.value.correct);
    $("#SavailablePtCorrect").html(problem.value.correct);
    $("#SearnedPtStyle").html(submission.value.style);
    $("#SavailablePtStyle").html(problem.value.style);
    if(submission.value.correct == problem.value.correct){
        $("#ScorrectCheck").empty().append(correct("8px"));
    }else {
        $("#ScorrectCheck").empty().append(wrong("8px"));
    }
    if(submission.value.style == problem.value.style){
        $("#SstyleCheck").empty().append(correct("8px"));
    }else {
        $("#SstyleCheck").empty().append(wrong("8px"));
    }


    var submissionMessage = submission.message;
    if(!submission.message) { submissionMessage = "No message" }
    $("#submissionMessage").empty().html(submissionMessage.replace(/\n/g,"<br />"));
    $("#submissionTitle").html(problem.name);
    $.post("/folder/read/", {id: problem.folder}, function(folder){
        $("#submissionTitle").html(problem.name + "<i> in " + folder.name + "</i>");
    });

    editor.setValue(submission.code);
    //weird trick to make sure the codemirror box refreshes
    var that = this;
    setTimeout(function() {
        that.editor.refresh();
    },1);

    //FILLING IN FEEDBACK PANEL
    if(feedbackOn == true){
        $("#additionalFeedbackPanel").removeClass("hidden");
        fillSubmissionFeedback(submission,user);
    } else {
        $("#additionalFeedbackPanel").addClass("hidden");
    }

    $.post("/submission/read/", {id: problem.id, student: user.username}, function(submissions){
        $("#relatedSubmissionHead").empty();

        $("#relatedSubmissionHead").append("<td>Time of Submission</td>");
        $("#relatedSubmissionHead").append("<td>Functionality</td>");
        $("#relatedSubmissionHead").append("<td>Style</td>");
        if(feedbackOn == true){
            $("#relatedSubmissionHead").append("<td>Feedback</td>");
        }

        submissions.forEach( function (submission) {
            var d = new Date(submission.createdAt);
            var row = $("<tr></tr>")

            if(currentId == submission.id){
                var a = $("<td></td>")
                .html(d.toLocaleString())
                .click(function (event) {
                    event.preventDefault();
                    getSubmission(submission,user,problem);
                });
            }else {
                var a = $("<td></td>")
                .html("<a href='#submission' data-toggle='pill'>" + d.toLocaleString() + '</a>')
                .click(function (event) {
                    event.preventDefault();
                    getSubmission(submission,user,problem);
                });
            }
            var b = $("<td></td>").append(scoreBadge(submission.value.correct,problem.value.correct));
            var c = $("<td></td>").append(scoreBadge(submission.value.style,problem.value.style));
            var d = $("<td></td>");

            row.append(a);
            row.append(b);
            row.append(c);

            if(feedbackOn == true){
                if(submission.fbRequested){
                    d.append("<span class='glyphicon glyphicon-exclamation-sign' style='color:red;''></span>");
                }
                if(submission.fbResponseTime){
                    d.empty().append("<span class='glyphicon glyphicon-ok' style='color:green;''></span>");
                }
                row.append(d);

            }

            $("#relatedSubmissions").append(row);
        });
    });
    setTimeout( editor.refresh(), 0 );    
    if(submission.shareOK == true){
        var button = $("<a></a>")
                .attr("href","project?subId=" + submission.id)
                .attr("target","_blank")
                .attr("type","button")
                .addClass("btn btn-primary ")
                .text("Project this code in new window");
                
        $('#submissionProject').empty().append(button);
    }else {
        var button = $("<a></a>")
                .attr("href","project?subId=" + submission.id)
                .attr("target","_blank")
                .attr("type","button")
                .attr("disabled","disabled")
                .addClass("btn btn-primary ")
                .text("Project this code in new window (lacking permission)");
                
        $('#submissionProject').empty().append(button);
    }

  
}


function fillSubmissionFeedback(submission,user){
    $("#additionalFeedbackPanel").removeClass("panel-danger");

    if(submission.fbRequested == true && submission.fbResponseTime == null){
                $("#additionalFeedbackPanel").addClass("panel-danger")
            }

            if(submission.fbRequested){
                $("#feedbackRequestedDiv").removeClass("hidden");
                
                //Request Message
                var message = submission.fbRequestMsg;
                $("#fbRequestMsg").empty().append(message);
             
                //Request Time
                var time = submission.fbRequestTime;
                if(time != null){
                    time = new Date(submission.fbRequestTime).toLocaleString();
                }
                $("#feedbackRequestTime").empty().append("<b>" + user.displayName + "</b> requested feedback on <b>" + time + "</b>");
            }else {
                $("#feedbackRequestedDiv").addClass("hidden");
            }

            if(submission.fbResponseTime == null){ //No feedback given yet
                $("#feedbackDisplayDiv").addClass("hidden");
                $("#feedbackSubmitDiv").removeClass("hidden");
                $('#fbConsole').val(submission.message);

                $('#fbResponseMessage').empty();
                fbEditor.setValue(submission.code);
                //weird trick to make sure the codemirror box refreshes
                var that = this;  
                setTimeout(function() {
                    that.fbEditor.refresh();
                },1);
            }else { //Feedback has been given
                $("#feedbackSubmitDiv").addClass("hidden");
                $("#feedbackDisplayDiv").removeClass("hidden");
                var editorText = "";
                if(submission.fbCode){
                    editorText = submission.fbCode;
                }
                fbEditorReadOnly.setValue(editorText);
                //weird trick to make sure the codemirror box refreshes
                var that = this;  
                setTimeout(function() {
                    that.fbEditorReadOnly.refresh();
                },1);
                $("#feedbackResponder").empty().append(submission.fbResponder);
                time = submission.fbResponseTime;
                if(time != null){
                    time = new Date(submission.fbResponseTime).toLocaleString();
                }
                $("#feedbackResponseTime").empty().append("Feedback from " + time);
                $.post("/user/read", {id: submission.fbResponder}, function (user) {
                    if (user) {
                        $("#feedbackResponseTime").empty().append("<b>" + user.displayName + "</b> provided feedback on <b>" + time + "</ b>");
                    }
                });
                $("#fbResponseMsg").empty().append(submission.fbResponseMsg);
            }          }


function getIndividual(user, refresh) {
    //Generate page for particular individual student    
    if(curStudent == user.id && refresh == false){
        return;
    }
    curStudent = user.id;

    $("#pbp-yellow").css("width","0%");
    $("#pbp-green").css("width","0%");
    $("#pbp-red").css("width","0%");
    $("#individualProgessBar").removeClass("hidden");
    $("#studentScore").removeClass("hidden");
    $("#individualSubmissionList").empty();
    $("#studentRefresh").attr("disabled", "disabled");
    $("#studentRefreshGlyph").addClass("spin");

    $("#studentScoreButton").unbind('click');
    $('#studentScoreButton').on('click', function() {
        if(confirm("This recalculates the student score just to be sure it's accurate.")) {
            $("#studentScoreButton").attr("disabled", "disabled");
            studentScore(user.username);
        }
    });

    $("#individualName").html(user.displayName + " " + user.username);
    $("#studentScoreButton").html(user.currentScore + "/" + points);

    var tooltipGreen = "Problems for which full points were earned";
    var tooltipYellow = "Attempted problems that did not recieve full credit";
    $("#individualProgessBar").empty().append('<div class="progress" style="height:33px"><div id="pbgreen" class="progress-bar progress-bar-success" style="width: 0%;" data-toggle="tooltip" data-placement="top" title="' + tooltipGreen + '"><span class="sr-only">35% Complete (success)</span></div> <div id="pbyellow" class="progress-bar progress-bar-warning progress-bar-striped" style="width: 0%" data-toggle="tooltip" data-placement="top" title="' + tooltipYellow + '"><span class="sr-only">20% Complete (warning)</span></div><div id="pbred" class="progress-bar progress-bar-danger" style="width: 0%"><span class="sr-only">10% Complete (danger)</span></div></div>');
    //must enable tooltips
    $('[data-toggle="tooltip"]').tooltip()
    var totalSubmissionNumber = 100000000000000;
    
    $.post("/submission/read/", {student: user.username}, function(submissions){
        totalSubmissionNumber = submissions.length;
        if(totalSubmissionNumber == 0){
            $("#studentRefresh").removeAttr('disabled');
            $("#studentRefreshGlyph").removeClass("spin");
        }
        var submissionCount = 0;
        $.post("/folder/read", null, function (folders) {
            var totalEarned = 0;
            var totalAttempted = 0;
            folders.forEach(function (folder) {
                var folderEarned = 0;
                var folderAvailable = 0;
                var toggleLabel = '<h4 class="panel-title"><a data-toggle="collapse" data-parent="#accordion" href="#Icollapse-'+ folder.id + '">' + folder.name + '</a></h4>';
                if(feedbackOn){
                    var accordian = "<div id='indivFolder-" + folder.id  + "' class='panel panel-danger'><div class='panel-heading'>" + toggleLabel + "</div><div class='panel-collapse collapse' id='Icollapse-" + folder.id + "'><table class='table' style='margin-bottom:0px;'><thead><tr><th>Problem</th><th>Submissions</th><th>Functionality</th> <th>Style</td> <th>Feedback</th></tr></thead><tbody id='ISL" + folder.id + "'> </tbody></table></div></div></div>";
                }else {
                    var accordian = "<div id='indivFolder-" + folder.id  + "' class='panel panel-danger'><div class='panel-heading'>" + toggleLabel + "</div><div class='panel-collapse collapse' id='Icollapse-" + folder.id + "'><table class='table' style='margin-bottom:0px;'><thead><tr><th>Problem</th><th>Submissions</th><th>Functionality</th> <th>Style</td></tr></thead><tbody id='ISL" + folder.id + "'> </tbody></table></div></div></div>";
                }

    //            var accordian = "<div id='indivFolder-" + folder.id  + "' class='panel panel-danger'><div class='panel-heading'><h4 class='panel-title'>" + toggleLabel + " <span id='Iearned-"+ folder.id + "'>0</span>/<span id='Iavail-"+ folder.id + "'></span><span id='Icheck-"+ folder.id + "'></span></h4></div><ul id = 'ISL" + folder.id + "' class='panel-collapse collapse folderCollapse'></ul></div></div>";

    //            $("#individualSubmissionList").append(toggleLabel + "<ul id ='ISL" + folder.id + "' class='panel-collapse collapse'></ul>");
                $("#individualSubmissionList").append(accordian);

                $.post("/problem/read", {folder: folder.id}, function (problems) {
                    problems.forEach( function (problem) {
                        folderAvailable += parseInt(problem.value.style) + parseInt(problem.value.correct);
                    });

                    problems.forEach( function (problem) {
                        var availableStylePoints = problem.value.style;
                        var availableFuncPoints = problem.value.correct;
                        var earnedStylePoints = parseInt(0);
                        var earnedFuncPoints = parseInt(0);
                        var attemptedStylePoints = parseInt(0);
                        var attemptedFuncPoints = parseInt(0);
                        var feedbackRequested = false;
                        var feedbackGiven = false;
                        var problemRow = $("<tr>");
                        var problemRowSubmissions = [];
                        $.post("/submission/read/", {id: problem.id, student: user.username}, function(submissions){
                            submissions.forEach( function (submission) {
                                submissionCount++;
                                if(totalSubmissionNumber == submissionCount){
                                    $("#studentRefresh").removeAttr('disabled');
                                    $("#studentRefreshGlyph").removeClass("spin");

                                }
                                if(submission.fbRequested && submission.fbResponseTime == null){
                                    feedbackRequested = true;
                                }
                                if(submission.fbResponseTime != null){
                                    feedbackGiven = true;
                                }

                                var d = new Date(submission.createdAt);

                                var a = $("<td></td>")
                                .html("<a href='#submission' data-toggle='pill'>" + d.toLocaleString() + "</a>")
                                .click(function (event) {
                                    event.preventDefault();
                                        getSubmission(submission,user,problem);
                                });
                                if(submission.value.correct == problem.value.correct){
                                    var checkF = correct("8px");
                                }else {
                                    var checkF = wrong("8px");
                                }
                                if(submission.value.style == problem.value.style){
                                    var checkS = correct("8px");
                                }else {
                                    var checkS = wrong("8px");
                                }
                                var submissionRow = $("<tr>").addClass("hidden ISLP ISLP" + problem.id);
                                submissionRow.append($("<td></td>"));
                                submissionRow.append(a);
                                submissionRow.append($("<td></td>").append(scoreBadge(submission.value.correct,problem.value.correct)));
                                submissionRow.append($("<td></td>").append(scoreBadge(submission.value.style,problem.value.style)));
                                if(feedbackOn){
                                    if(submission.fbRequested == true && submission.fbResponseTime == null){
                                        submissionRow.append($('<td><span class="glyphicon glyphicon-exclamation-sign"></span></td>').css("color", "red"));
                                    }else  if(submission.fbResponseTime != null){
                                        submissionRow.append($("<td></td>").append(correct()));
                                    }else {
                                        submissionRow.append($("<td></td>"));
                                    }
                                }
                                problemRowSubmissions.push(submissionRow);

    //                            $("#ISL" + problem.id).append("<div class='left-submission'>Functionality: " + submission.value.correct + "/" + problem.value.correct + "</div><div class='style-submission left-submission'>Style: " + submission.value.style + "/" + problem.value.style + "</div></li>");
                                if (parseInt(submission.value.style) > parseInt(earnedStylePoints)){
                                    earnedStylePoints = parseInt(submission.value.style);
                                    totalEarned += parseInt(earnedStylePoints);
                                }
                                if (parseInt(submission.value.correct) > parseInt(earnedFuncPoints)){
                                    earnedFuncPoints = parseInt(submission.value.correct);
                                    totalEarned += parseInt(earnedFuncPoints);
                                }
                                var percent = parseInt(totalEarned) / parseInt(numpoints) * parseInt(100);
                                percent = percent + "%";
                                $("#pbgreen").css("width",percent);

                            });

                            if(submissions.length > 0){
                                $("#indivFolder-" + folder.id).removeClass("panel-danger");
                                $("#indivFolder-" + folder.id).addClass("panel-warning");

                                totalAttempted += parseInt(availableStylePoints) - parseInt(earnedStylePoints);
                                totalAttempted += parseInt(availableFuncPoints) - parseInt(earnedFuncPoints);
                                if(earnedFuncPoints == availableFuncPoints){
                                    var checkF = correct("8px");
                                }else {
                                    var checkF = wrong("8px");
                                }
                                if(earnedStylePoints == availableStylePoints){
                                    var checkS = correct("8px");
                                }else {
                                    var checkS = wrong("8px");
                                }
                                var a = $("<a></a>")
                                    .html(problem.name)
                                    .click(function (event) {
                                        if($(".ISLP"+problem.id).hasClass("hidden")) {
                                            $(".ISLP"+problem.id).removeClass('hidden');
                                        } else {
                                            $(".ISLP"+problem.id).addClass('hidden');
                                        }
                                });
                                problemRow.append($("<td>").append(a));
                                problemRow.append($("<td></td>").append(submissions.length));
                                problemRow.append($("<td></td>").append(scoreBadge(earnedFuncPoints,availableFuncPoints)));
                                problemRow.append($("<td></td>").append(scoreBadge(earnedStylePoints,availableStylePoints)));
                                
                                if(feedbackOn){
                                    if(feedbackRequested){
                                        problemRow.append($("<td>").append(exclam()));
                                    }else if(feedbackGiven){
                                        problemRow.append($("<td>").append(correct()));
                                    }else {
                                        problemRow.append($("<td>"));
                                    }
                                }

                                $("#ISL" + folder.id).append(problemRow);
                                var index;
                                for (index = 0; index < problemRowSubmissions.length; index++) {
                                    $("#ISL" + folder.id).append(problemRowSubmissions[index]);
                                }

                            }else {
                                problemRow.append($("<td>").append(problem.name));
                                problemRow.append($("<td></td>").append("0"));
                                problemRow.append($("<td>"));
                                problemRow.append($("<td>"));
                                problemRow.append($("<td>"));
                                $("#ISL" + folder.id).append(problemRow);
                            }
                            if(submissions.length >= 0){
                                $("#ipCount" + problem.id).append("<div class='left'>" + submissions.length + " submissons</div>");
                            }
                            var percent = parseInt(totalAttempted) / parseInt(numpoints) * parseInt(100);
                            percent = percent + "%";
                            $("#pbyellow").css("width",percent);
                            $("#ipPoints" + problem.id).append("<div class='left'>Functionality: " + earnedStylePoints  + "/" + availableStylePoints + "</div><div class='left'>Style: " + earnedFuncPoints + "/" + availableFuncPoints + "</div>")

                            //Changing Folder Color
                            folderEarned += parseInt(earnedStylePoints) + parseInt(earnedFuncPoints);
                            if(folderEarned >= folderAvailable){
                                $("#indivFolder-" + folder.id).removeClass("panel-warning");
                                $("#indivFolder-" + folder.id).addClass("panel-success");
                            }                        

                        });

                    });
                });
            });
        });

    });
    
    $("#studentRefresh").unbind('click');
    $("#studentRefresh").click(function () { 
        $.post("/user/read", {id: curStudent}, function (user) {
            if (!user) {
                alert("error");
            }else {
                getIndividual(user, true);
                $("#studentRefresh").attr("disabled", "disabled");
                $("#studentRefreshGlyph").addClass("spin");
            }
        });

    });
    
}

function getIndividualNone(onyen) {

    $("#pbp-yellow").css("width","0%");
    $("#pbp-green").css("width","0%");
    $("#pbp-red").css("width","0%");
    $("#individualSubmissionList").empty();
    $("#individualProgessBar").addClass("hidden");
    $("#studentScore").addClass("hidden");

    $("#individualName").html("No user with found with onyen <i>\"" + onyen + "\"</i>");
    var heading = $("<h3></h3>");
    var backLink = $("<a></a>")
        .attr("href","#students")
        .attr("data-toggle","pill")
        .html("Back to Students List");
    $("#individualSubmissionList").append(heading.append(backLink));

}

function reloadFolders() {
    $("#leftSideFolders").empty();
	$("#folderDropdown").empty();
    $("#editFolderDropdown").empty();
    numpoints = 0;
    $.post("/folder/read", null, function (folders) {
        folders.forEach(function (folder) {
            addFolder(folder)
        });
    });
}

function addFolder(folder) {

	$("#folderDropdown").append($("<option></option>").attr("value",folder.id).html(folder.name));
	$("#problemsfolderDropdown").append($("<option></option>").attr("value",folder.id).html(folder.name));
    $("#editFolderDropdown").append($("<option></option>").attr("value",folder.id).html(folder.name));

    if(curProblem) {
        $("#editFolderDropdown").val(curProblem.folder);
    }
    if(curFolder) {
        $("#problemsfolderDropdown").val(curFolder);
    }

    var accordianFolderId = "accoridanFolder" + folder.id;
    var toggleLabel = '<a data-toggle="collapse" data-parent="#accordion" href="#'+ accordianFolderId + '">' + folder.name + '</a>';
    var accordian = "<div class='panel panel-default'><div class='panel-heading'><h4 class='panel-title'>" + toggleLabel + "</h4></div><div id = 'accoridanFolder" + folder.id + "' class='panel-collapse collapse folderCollapse'></div>";

    $("#leftSideFolders").append(accordian);
    $("#" + accordianFolderId).empty();
    $.post("/problem/read", {folder: folder.id}, function (problems) {
        problems.forEach( function (problem) {
            numpoints += parseInt(problem.value.style) + parseInt(problem.value.correct);
            var link = addProblemToAccordian(problem, accordianFolderId);
            $("#" + accordianFolderId).append(link);
        });
    });
}

function refreshFolder(folderid){
    var accordianFolderId = "accoridanFolder" + folderid;
    $("#" + accordianFolderId).empty();
    $.post("/problem/read", {folder: folderid}, function (problems) {
        problems.forEach( function (problem) {
            numpoints += parseInt(problem.value.style) + parseInt(problem.value.correct);
            var link = addProblemToAccordian(problem, accordianFolderId);
            $("#" + accordianFolderId).append(link);
        });
    });

}

function addProblemToAccordian(problem,folderName){
    var link = $("<p></p>").append(
        $("<a></a>")
            .attr("href","#questions")
            .attr("data-toggle","pill")
            .append(problem.name)
    );
    if(problem.phase == 0) {
        link.css("text-decoration", "line-through");
    }
    link.click(function () { 
        curProblem = problem;
        fillProblemEdit(curProblem);
        fillProblemDisplay(curProblem);
        getStudentResults(curProblem);
    });
    return link;
}

function reloadSortableFolders() {
    $("#leftSideFolders").empty();
    
    //Create new folder
    var addFolder = $('<div></div>')
    .attr("id","addFolder")
    .append("<div class='input-group'><input type='text' id='newFolder' class='form-control' placeholder='Add folder...'></input><span class='input-group-btn'><button type='submit' id='newFolderBtn' class='btn btn-default'><span class='glyphicon glyphicon-plus' style='color:green;''></span></button></span></div><div id='newFolderError'></div>");
    $("#leftSideFolders").append(addFolder);
    $("#newFolderBtn").click(function () {
            $("#newFolderError").empty();
            if($("#newFolder").val()==""){
                var noNameError = $("<div class='alert alert-danger' role='alert'>Please enter a folder name</div>");
                $("#newFolderError").append(noNameError);
            } else {
                $.post("/folder/create", {name: $("#newFolder").val()}, function (folder) {
                    $.post("/folder/reorder", {}, function () {
                        if(blinkTimer > 0){
                            reloadSortableFolders();
                        }else {
                           reloadFolders();
                        }
                        $("#newFolder").val("");
                    });
                });
            }
        });

    //Iterate and add each sortable folder and its sortable children
    $("#leftSideFolders").append('<ul id="sortable" class="panel-default"></ul>');
    $.post("/folder/read", null, function (folders) {
        folders.forEach(function (folder) {
            var expandButton = $("<a href='#accoridanFolder" + folder.id + "'></a>")
            .attr("data-parent","#accordion")
            .attr("data-toggle","collapse")
            .html('<span class="glyphicon expand-folders glyphicon-folder-open" style="padding:0 8px;float:right" id="expandMe' + folder.id +'"></span>')
            .click(function () {
                if ($("#expandMe" + folder.id).hasClass("glyphicon-folder-open")) {
                    $("#expandMe" + folder.id).removeClass("glyphicon-folder-open").addClass("glyphicon-folder-close");
                } else {
                    $("#expandMe" + folder.id).removeClass("glyphicon-folder-close").addClass("glyphicon-folder-open");
                }
            });


            var removeButton = $("<a href='#'></a>")
            .css("color","red")
            .html('<span class="glyphicon glyphicon-remove" style="padding:0 5px;float:right"></span>') // the trailing space is important!
            .click(function () {
                if (confirm('Are you sure you wish to delete the folder "'+ folder.name + '"?')) {
                    $.post("/folder/delete", {id: folder.id}, function () {
                        $.post("/folder/reorder", {}, function () {
                            reloadSortableFolders();
                        });
                    });
                }
            });

            var heading = $("<h4></h4>")
            .addClass("panel-title")
            .html('<span class="sortableGrip ui-icon ui-icon-arrowthick-2-n-s"></span>' + folder.name + "</h4>")
            .append(removeButton).append(expandButton);

            var expandableFolder = $("<div></div>")
            .attr("id","accoridanFolder" + folder.id)
            .attr("class","panel-collapse collapse folderCollapse")
            .html("<ul id='sortableFolder" + folder.id + "' class='sortable2' ></ul>");

            var sortableItem = $("<li></li>")
            .attr("class","ui-state-default sortableFolder panel-heading")
            .attr("id",folder.id);
            sortableItem.append(heading);
            sortableItem.append(expandableFolder);

            $.post("/problem/read", {folder: folder.id}, function (problems) {
                problems.forEach( function (problem) {

                    var removeButton = $("<a href='#' data-toggle='tooltip' data-placement='right' title='Delete?'></a>")
                    .css("color","red")
                    .html('<span class="glyphicon glyphicon-remove" style="padding: 0 5px;float:right" ></span>') // the trailing space is important!
                    .click(function () {
                        if (confirm('Are you sure you wish to delete the problem "' + problem.name + '"?')) {
                            $.post("/problem/delete", {id: problem.id}, function () {
                                $.post("/problem/reorder", {folder: problem.folder}, function () {

                                });
                            });
                        }
                        reloadSortableFolders();

                    });
                    //must enable tooltips
                    $('[data-toggle="tooltip"]').tooltip()

                    var sortableProblem = $("<li></li>")
                    .attr("class","ui-state-default")
                    .attr("id",problem.id)
                    .append('<span class="sortableGrip2 ui-icon ui-icon-arrowthick-2-n-s"></span>' + problem.name).append(removeButton);
                    $("#sortableFolder" + folder.id).append(sortableProblem);
                });
            });

            $("#sortable").append(sortableItem);

            $( "#sortableFolder" + folder.id ).sortable({
                handle: ".sortableGrip2",
                start: function(e, ui) {
                    // creates a temporary attribute on the element with the old index
                    $(this).attr('data-previndex', ui.item.index());
                },
                update : function (e, ui) {
                    var newIndex = ui.item.index();
                    var oldIndex = $(this).attr('data-previndex');
                    var id = ui.item.attr('id');
                    $.post("/problem/update", {id: id, oldIndex: oldIndex, newIndex: newIndex}, function (problem) {
                        $.post("/problem/reorder", {folder: folder.id}, function () {
                        });
                    });
                }
            });
            $( "#sortableFolder" + folder.id ).disableSelection();

        });

        $( "#sortable" ).sortable({
            handle: ".sortableGrip",
            start: function(e, ui) {
                // creates a temporary attribute on the element with the old index
                $(this).attr('data-previndex', ui.item.index());
            },
            update : function (e, ui) {
                var newIndex = ui.item.index();
                var oldIndex = $(this).attr('data-previndex');
                var id = ui.item.attr('id');
                $.post("/folder/update", {id: id, oldIndex: oldIndex, newIndex: newIndex}, function (folder) {
                    $.post("/folder/reorder", {}, function () {
                    });
                });
            }
        });
        $( "#sortable" ).disableSelection();
    });
}

function loadUsers() {
    //interface for editing who is an admin
    $("#admins").empty();
    $.post("/user/readAdmin", null, function (admins) {
        admins.forEach(function(admin) {
            var removeButton = $("<a href='#'></a>")
            .css("color","red")
            .html("<span class='glyphicon glyphicon-remove'></span> ") // the trailing space is important!
            .click(function () {
                if (confirm('Are you sure you wish to delete ?')) {
                    $.post("/user/removeAdmin", {id: admin.id}, function () {
                        loadUsers();
                    });
                }
             });
            var label = $("<li></li>").attr("class","list-group-item").append(removeButton).append(admin.displayName);
            $("#admins").append(label);
        });
    });
}

function getSettings(){
    console.log("get settings" + feedbackOn);
    feedbackToggle(feedbackOn);
    shareToggle(shareOn);
}

function feedbackToggle(boolean){
    console.log("toggle" + boolean);
    if(boolean){
        var button = $("<button></button>")
            .addClass("btn btn-danger")
            .text("Turn Off Feedback")
            .click(function (event) {
                if(confirm("Are you sure you want to turn this feature off? This will refresh the page.")){
                    $.post("/setting/update/", {name: "feedback", on:false}, function(setting){
                         location.reload();   
                    });
                }
            });
    }else {
        var button = $("<button></button>")
            .addClass("btn btn-success")
            .text("Turn On Feedback")
            .click(function (event) {
                if(confirm("Are you sure you want to turn this feature on? This will refresh the page.")){
                    $.post("/setting/update/", {name: "feedback", on:true}, function(setting){
                         location.reload();  
                    });
                }
            });        
    }
    $("#feedbackToggle").empty().append(button);
}

function shareToggle(boolean){
    console.log("toggle" + boolean);
    if(boolean){
        var button = $("<button></button>")
            .addClass("btn btn-danger")
            .text("Turn Off Sharing")
            .click(function (event) {
                if(confirm("Are you sure you want to turn this feature off? This will refresh the page.")){
                    $.post("/setting/update/", {name: "share", on:false}, function(setting){
                         location.reload();   
                    });
                }
            });
    }else {
        var button = $("<button></button>")
            .addClass("btn btn-success")
            .text("Turn On Sharing")
            .click(function (event) {
                if(confirm("Are you sure you want to turn this feature on? This will refresh the page.")){
                    $.post("/setting/update/", {name: "share", on:true}, function(setting){
                         location.reload();  
                    });
                }
            });        
    }
    $("#shareToggle").empty().append(button);
}

function studentScore(onyen){
    console.log("studentScore for " + onyen);
    $("#studentScoreButton").empty().append('<span class="glyphicon glyphicon-refresh spin"></span>');
    $.post("/submission/read/", {student: onyen}, function(submissions){
        var totalSubmissionNumber = submissions.length;
        var submissionCount = 0;
        $.post("/folder/read", {}, function (folders) {
            studScore = 0;
            totScore = 0;
            folders.forEach( function (folder) {
                $.post("/problem/read", {folder: folder.id, phase: 2}, function (problems) {
                    problems.forEach( function (problem) {
                        var maxScore = 0;
                        $.post("/submission/read/", {id: problem.id, student: onyen}, function(submissions){
                            submissions.forEach( function (submission) {
                                submissionCount++;
                                var curSubScore = Number(submission.value.correct)+Number(submission.value.style);
                                if(curSubScore > maxScore) {
                                    maxScore = curSubScore;
                                }
                            });
                            studScore += maxScore;
                            if(totalSubmissionNumber == submissionCount){
                                console.log("preping to update..." + studScore);
                                $.post("/user/updateScore/", {onyen:onyen, currentScore:studScore}, function(user){
                                    console.log("updated score of " + onyen);
                                    $("#studentScoreButton").empty().append(studScore + "/" + points);
                                    $("#studentScoreButton").removeAttr("disabled");
                                });
                            }
                        });
                    });
                });
            });
        });
    });
}

function recalculateAvailableScore(){
    console.log("recalculateAvailableScore()... ");
    $.post("/folder/read", {}, function (folders) {
        var totalProblemCount = 0;
        var problemCount = 0;
        var totalScore = 0;

        folders.forEach( function (folder) {
            $.post("/problem/read", {folder: folder.id, phase: 2, ignoreTest: "true"}, function (problems) {
                problems.forEach( function (problem) {
                    totalProblemCount++;
                });
            });
        });

        folders.forEach( function (folder) {
            $.post("/problem/read", {folder: folder.id, phase: 2, ignoreTest: "true"}, function (problems) {
                problems.forEach( function (problem) {
                    problemCount++;
                    totalScore += parseInt(problem.value.correct) + parseInt(problem.value.style);
                    console.log(problem.name + "   " + totalScore);
                    console.log(problemCount + "/" + totalProblemCount);
                    if(totalProblemCount == problemCount){
                        console.log("preping to update..." + totalScore);
                        $.post("/setting/update/", {name:"points", value:totalScore}, function(setting){
                            console.log("updated points to " + totalScore);
                        });
                    }
                });
            });
        });        
    });
}


//controls for the blinking on the edit folder side
var blinkTimer;
function blinking(elm) {
    blinkTimer = setInterval(blink, 10);
    function blink() {
        elm.fadeOut(600, function() {
           elm.fadeIn(600);
        });
    }
} 

var editor;
var fbEditor;
var fbEditorReadOnly;
var modalEditor;
var feedbackEditor;
var feedbackOn;
var points;

window.onload = function () {
    curProblem = null;
    curStudent = null;
    curFolder = null;
    curSubmission = null;
    curFeedback = null;

    numProblems = 0;
    numfunct = 0; //num solutions with correct functionality
    numstyle = 0; //num solutions with correct style
    numattempted = 0; //num students submitted anything
    numearned = 0; //num students earned full points
    numpoints = 0; //num of total points it is possible to earn

    $.post("/setting/read/", {name: "feedback"}, function(setting){
        console.log(setting.on);
        if(setting.on == true || setting.on == "true"){
            feedbackOn = true;
        }else {
            feedbackOn = false;
        }
        if(feedbackOn){
            getFeedbackDash();
            $('#feedbackNav').append('<a class="navbar-brand" href="#feedback" data-toggle="pill">Feedback</a>');
        }else {
            $("#fbDashBody").empty().append("Feedback feature turned off.");
        }
        $.post("/setting/read/", {name: "share"}, function(setting){
            if(setting.on == true || setting.on == "true"){
                shareOn = true;
            }else {
                shareOn = false;
            }
            getSettings();
        });
    });

    $.post("/setting/read/", {name: "points"}, function(setting){
        points = setting.value;
    });

	reloadFolders();
    loadUsers();
    getStudentList();
    $("#refreshStudentListScores").click(function (event) {
        $.post("/setting/read/", {name: "points"}, function(setting){
            points = setting.value;
            getStudentList();
        });
    });


    /*
    setInterval(
        function() {
            getStudentResults(curProblem);
        },
        30000 /* 30000 ms = 30 sec */
   // ); 
    
    setInterval(
        function() {
            if($("#questions").hasClass("active")){
                updateProblemProgressBar();
            }
        },
        30000 /* 30000 ms = 30 sec */
    );
    fbEditorReadOnly = CodeMirror.fromTextArea(fbCodemirrorReadOnly, {
        mode: "javascript",
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        readOnly: true,
        theme: "mbo",
        extraKeys: {
            "F11": function (cm) {
                if (cm.setOption("fullScreen", !cm.getOption("fullScreen"))) {
                    $(".CodeMirror").css("font-size", "150%");
                } else {
                    $(".CodeMirror").css("font-size", "115%");
                }
            },
            "Esc": function (cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                $(".CodeMirror").css("font-size", "100%");
            }
        }
    });

    feedbackEditor = CodeMirror.fromTextArea(fbDashCodemirror, {
        mode: "javascript",
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        theme: "mbo",
        extraKeys: {
            "F11": function (cm) {
                if (cm.setOption("fullScreen", !cm.getOption("fullScreen"))) {
                    $(".CodeMirror").css("font-size", "150%");
                } else {
                    $(".CodeMirror").css("font-size", "115%");
                }
            },
            "Esc": function (cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                $(".CodeMirror").css("font-size", "100%");
            }
        }
    });

    editor = CodeMirror.fromTextArea(codemirror, {
        mode: "javascript",
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        readOnly: true,
        theme: "mbo",
        extraKeys: {
            "F11": function (cm) {
                if (cm.setOption("fullScreen", !cm.getOption("fullScreen"))) {
                    $(".CodeMirror").css("font-size", "150%");
                } else {
                    $(".CodeMirror").css("font-size", "115%");
                }
            },
            "Esc": function (cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                $(".CodeMirror").css("font-size", "100%");
            }
        }
    });

    modalEditor = CodeMirror.fromTextArea(modalCodemirror, {
        mode: "javascript",
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        readOnly: true,
        theme: "mbo",
        extraKeys: {
            "F11": function (cm) {
                if (cm.setOption("fullScreen", !cm.getOption("fullScreen"))) {
                    $(".CodeMirror").css("font-size", "150%");
                } else {
                    $(".CodeMirror").css("font-size", "115%");
                }
            },
            "Esc": function (cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                $(".CodeMirror").css("font-size", "100%");
            }
        }
    });

    fbEditor = CodeMirror.fromTextArea(fbCodemirror, {
        mode: "javascript",
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        theme: "mbo",
        extraKeys: {
            "F11": function (cm) {
                if (cm.setOption("fullScreen", !cm.getOption("fullScreen"))) {
                    $(".CodeMirror").css("font-size", "150%");
                } else {
                    $(".CodeMirror").css("font-size", "115%");
                }
            },
            "Esc": function (cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                $(".CodeMirror").css("font-size", "100%");
            }
        }
    });

    //reset student data
    $("#refreshData").click(function() {
        getStudentResults(curProblem);
    });
    //add problems
	$("#addProblem").click(function (event) {
		// Grab the values from the form and submit to the server.
		// TODO - this might be better in a $(form).submit(...)
		event.preventDefault();
		var opts = {
			type: $("#type").val(),
			phase: $("#phase").val(),
			name: $("#problemName").val(),
			folder: $("#folderDropdown").val(),
            language: $("#languageDropdown").val(),
            testMode: $("#modeDropdown").val(),
			text: $("#description").val(),
            style: $("#stylePoints").val(),
            correct: $("#correctPoints").val(),
			onSubmit: $("#onSubmit").val()
		};
        $("#newProblemError").empty();
		// TODO - Build errors with jQuery
        if($("#problemName").val()=="") {
			var noNameError = $("<div class='alert alert-danger' role='alert'>Please enter a problem name</div>");
            $("#newProblemError").append(noNameError);
        } else if($("#description").val()=="") {
			var noDescriptionError = $("<div class='alert alert-danger' role='alert'>Please enter a problem description</div>");
            $("#newProblemError").append(noDescriptionError);
        } else if($("#stylePoints").val()=="" || $("#correctPoints").val()=="") {
            var noPointsError = $("<div class='alert alert-danger' role='alert'>Please enter style and correctness points</div>");
            $("#newProblemError").append(noPointsError);
        } else {
            $.post("/problem/create", opts, function (problem) {
                $.post("/problem/reorder", {folder: problem.folder}, function () {
                    reloadFolders();
                    var problemCreated = $("<div class='alert alert-success' id='problemCreatedSuccess' role='alert'>Problem created!</div>");
                    $("#newProblemError").append(problemCreated);
                    setTimeout(function() {
                        $("#problemCreatedSuccess").remove();
                    }, 2000);
                    recalculateAvailableScore();
                });
            });
        }
	});
	$("#editProblem").click(function (event) {
		// Grab the values from the form and submit to the server.
		// TODO - this might be better in a $(form).submit(...)
		event.preventDefault();
		var opts = {
            id: curProblem.id,
			type: $("#editType").val(),
			phase: $("#editPhase").val(),
			name: $("#editProblemName").val(),
			folder: $("#editFolderDropdown").val(),
            language: $("#editLanguageDropdown").val(),
            testMode: $("#editModeDropdown").val(),
			text: $("#editDescription").val(),
            correct: $("#editCorrectPoints").val(),
            style: $("#editStylePoints").val(),
			onSubmit: $("#editOnSubmit").val()
		};
        $("#editProblemError").empty();
		//Build errors with jQuery
        if($("#editProblemName").val()=="") {
			var noNameError = $("<div class='alert alert-danger' role='alert'>Please enter a problem name</div>");
            $("#editProblemError").append(noNameError);
        } else if($("#editDescription").val()=="") {
			var noDescriptionError = $("<div class='alert alert-danger' role='alert'>Please enter a problem description</div>");
            $("#editProblemError").append(noDescriptionError);
        } else if($("#editStylePoints").val()=="" || $("#editCorrectPoints").val()=="") {
            var noPointsError = $("<div class='alert alert-danger' role='alert'>Please enter style and correctness points</div>");
            $("#editProblemError").append(noPointsError);
        } else {
            console.dir(opts);
            //breaks here with "Failed to load resource: the server responded with a status of 500 (Internal Server Error)"
            $.post("/problem/update", opts, function (problem) {
                fillProblemDisplay(problem);
                var updateSuccessMessage = $("<div class='alert alert-success' role='alert' id='problemUpdatedMessage'>Problem Updated</div>");
                setTimeout(function() {
                    $("#problemUpdatedMessage").remove();
                }, 2000);
                $("#editProblemError").append(updateSuccessMessage);
                curProblem = problem;
                refreshFolder(problem.folder);
                recalculateAvailableScore();
            });
        }
	});

    $("#newAdminBtn").click(function() {
        $.post("/user/setAdmin", {user: $("#newAdmin").val()}, function(admin) {
            if(admin) {
                var updateSuccessMessage = $("<div class='alert alert-success' role='alert' id='adminUpdateMessage'>Update Succeeded</div>");
                setTimeout(function() {
                    $("#adminUpdateMessage").remove();
                }, 2000);
                $("#newAdmin").val("");
                $("#newAdminError").empty().append(updateSuccessMessage);
                loadUsers();
            } else {
                var updateErrorMessage = $("<div class='alert alert-danger' role='alert'>That username is not in our database</div>");
                $("#newAdminError").empty().append(updateErrorMessage);
            }
        });
    });
    //handle the alternating and blinking for editing folders button
    $('#sortFolders').on('click', function() {
        if($(this).text() == 'Edit Folders') {
            blinking($("#sortFolders"));
            $(this).text('Done');
            reloadSortableFolders();
        } else {
            clearInterval(blinkTimer);
            $(this).text('Edit Folders');
            reloadFolders();
        }
    });
    
    $('#onyenSearchButton').on('click', function( event ) {
        var onyenValue = $("#onyen").val();
        if(onyenValue == ""){
            getIndividualNone("null");
            return;
        }
        $.post("/user/read", {onyen: onyenValue}, function (user) {
            if (!user) {
                getIndividualNone(onyenValue);
            }else {
                $("#individual").tab('show');
                getIndividual(user, false);
            }
        });

    });

    $('#submitFeedbackButton').on('click', function( event ) {
        var fbResponseMsg = $('#fbResponseMessage').val();
        $("#fbResponseMessage").val("");

        var fbCode = fbEditor.getValue();
        console.log("codemirrot ext" + fbCode);

        var now = new Date();
        var fbResponseTime = now.toLocaleString();
        var fbResponder = $("#userid").text();

        $.post("/submission/update", {id: curSubmission.id, fbResponseTime: fbResponseTime, fbCode: fbCode, fbResponseMsg: fbResponseMsg, fbResponder: fbResponder}, function (submission) {
            $("#feedbackSubmitDiv").addClass("hidden");
            $("#feedbackDisplayDiv").removeClass("hidden");
            $("#additionalFeedbackPanel").removeClass("panel-danger");

            time = submission.fbResponseTime;
            if(time != null){
               time = submission.fbResponseTime.toLocaleString()
            }
            $("#feedbackResponseTime").empty().append("<b>Feedback submitted!</b>");
            $("#fbResponseMsg").empty().append(fbResponseMsg);
            var editorText = "";
            if(fbCode){
                editorText = fbCode;
            }
            fbEditorReadOnly.setValue(editorText);
            //weird trick to make sure the codemirror box refreshes
            var that = this;  
            setTimeout(function() {
                that.fbEditorReadOnly.refresh();
            },1);

        });
    
        console.log('submitting fedback');
    });

    $('#submitFeedbackButtonDash').on('click', function( event ) {
        $("#fbDashSuccess").removeClass("hidden");
        $("#fbDashBody").addClass("hidden");

        var fbResponseMsg = $('#fbResponseMessageDash').val();
        var fbCode = feedbackEditor.getValue();
        console.log("codemirrot ext" + fbCode);

        var now = new Date();
        var fbResponseTime = now.toLocaleString();
        var fbResponder = $("#userid").text();

        $.post("/submission/update", {id: curFeedback.id, fbResponseTime: fbResponseTime, fbCode: fbCode, fbResponseMsg: fbResponseMsg, fbResponder: fbResponder}, function (submission) {
            $("#feedbackSubmitDiv").addClass("hidden");
            $("#feedbackDisplayDiv").removeClass("hidden");
            $("#additionalFeedbackPanel").removeClass("panel-danger");

            time = submission.fbResponseTime;
            if(time != null){
               time = submission.fbResponseTime.toLocaleString()
            }
            $("#feedbackResponseTime").empty().append("<b>Feedback submitted!</b>");
            $("#fbResponseMsg").empty().append(fbResponseMsg);
            var editorText = "";
            if(fbCode){
                editorText = fbCode;
            }

            setTimeout(function() {
                $("#fbDashSuccess").addClass("hidden");
                $("#fbResponseMessageDash").val("");
                getFeedbackDash();
            }, 2000);

        });

        console.log('submitting fedback');
    });

    $('#shareSubmissionModal').on('shown.bs.modal', function (e) {
        modalEditor.refresh();
    })

    $('#submissionCollapseAll').on('click', function() {
        if($(this).text() == 'Hide Student Info') {
            $(this).text('Show Student Info');
            $('.submissionCollapse').collapse('hide');
        } else {
            $(this).text('Hide Student Info');
            $('.submissionCollapse').collapse('show');
        }
        return false;
    });

    //enable tooltips
    $('[data-toggle="tooltip"]').tooltip()
};

