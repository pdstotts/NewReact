var curProblem = null;
var unseenFeedback = null;

function isNull(item){
	if(item == null || item == "null" || item == "" || item == ''){
		return true;
	}else {
		return false;
	}
}

function addProblemToAccordian(problem,folderName){
	var earnedPointsDiv = "#earned-" +folderName;
	var availPointsDiv = "#avail-" +folderName;
	var checkDiv = "#check-" +folderName;
	var maxScore = 0;
	var probMax = Number(problem.value.correct) + Number(problem.value.style);
	var problemName = problem.name;
	if(problem.testMode == true){
		problemName = problem.name + " (Test Mode)"
	}
	var link = $('<li id="' + problem.id +  '" ></li>').append(
		$("<a></a>")
			.attr("href","#")
			.append(problemName)
	);
	if(problem.phase == 0) {
	    link.css("background-color", "#ededed");
	}
	if(problem.testMode == true){
	    link.css("background-color", "#DDECF2");
	}

	link.click(function () { addProbInfo(problem); });

	if (loggedIn) {
		var results = { correct: false, style: false };
		$.post("/submission/read/" + problem.id, {currentUser:true}, function (submissions) {
		if (!submissions.length == 0) {
			$("#panel-" + folderName).removeClass("panel-danger");
			$("#panel-" + folderName).addClass("panel-warning");
			
			submissions.forEach( function (submission) {
				var curSubScore = Number(submission.value.correct)+Number(submission.value.style);
				if(curSubScore > maxScore) {
					maxScore = curSubScore;
				}
				results.correct = 
					results.correct || (submission.value.correct == problem.value.correct);
				results.style = results.style || (submission.value.style == problem.value.style);
				if (results.correct && results.style) { return true; } 

				
			});
			if (maxScore < probMax) {
				$("#" + problem.id).css("color", "#ae4345");
				$("a", link).css("color", "#ae4345");
			} else {
				$("#" + problem.id).css("color", "green");
				$("a", link).css("color", "green");
			}
			var probGrade = $('<span style="float:right;">' + maxScore + "/" + (Number(problem.value.correct) + Number(problem.value.style))+"</span>");
			$("a", link).append(probGrade);

			var currentEarned = $(earnedPointsDiv).text();
			var availablePoints = $(availPointsDiv).text();
			currentEarned = Number(currentEarned);
			currentEarned = currentEarned + maxScore;
			$(earnedPointsDiv).empty().append(currentEarned);

//			console.log(folderName + $("#panel-" + folderName).hasClass("panel-warning"));
			if(availablePoints <= currentEarned && $("#panel-" + folderName).hasClass("panel-warning")){
				$(checkDiv).empty().append(correct("8px").css("float","right"));
				$("#panel-" + folderName).removeClass("panel-danger");
				$("#panel-" + folderName).removeClass("panel-warning");
				$("#panel-" + folderName).addClass("panel-success");
			}

		}else {
			var probGrade = $('<span style="float:right;">' +  (Number(problem.value.correct) + Number(problem.value.style)) +"pts</span>");
			$("a", link).append(probGrade);
		}
		});
	}
	return link;
}

function correct (pad) {
   return $("<span></span>")
     .addClass("glyphicon")
     .addClass("glyphicon-ok")
     .css("color","green")
     .css("margin-left",pad);
}

function wrong (pad) {
   return $("<span></span>")
      .addClass("glyphicon")
      .addClass("glyphicon-remove")
      .css("color","red")
      .css("margin-left",pad);
}

function inProgress (pad) {
   return $("<span></span>")
     .addClass("glyphicon")
     .addClass("glyphicon-minus")
     .css("color","red")
     .css("margin-left",pad);
}

function addFolder (folder) {
	var accordianFolderName = "accoridanFolder" + folder.id;
	var toggleLabel = '<a data-toggle="collapse" data-parent="#accordion" href="#'+ accordianFolderName + '">' + folder.name + '</a>';
	var accordian = "<div id='panel-" + accordianFolderName  + "' class='panel panel-danger'><div class='panel-heading'><h4 class='panel-title'>" + toggleLabel + " <span id='earned-"+ accordianFolderName + "'>0</span>/<span id='avail-"+ accordianFolderName + "'></span><span id='check-"+ accordianFolderName + "'></span></h4></div><ul id = '" + accordianFolderName + "' class='panel-collapse collapse folderCollapse'></ul></div></div>";

	$("#folderAccordion").append(accordian);
	var accordianFolderBody = '';
	$("#" + accordianFolderName).append(accordianFolderBody);
	var folderScore = 0;
	$("#avail-" + accordianFolderName).empty().append(folderScore);
	$("#" + accordianFolderName).empty();
	$.post("/problem/read", {folder: folder.id, phase: 2}, function (problems) {
		problems.forEach( function (problem) {
			var link = addProblemToAccordian(problem, accordianFolderName);
			folderScore += parseFloat(problem.value.style) + parseFloat(problem.value.correct);
			$("#" + accordianFolderName).append(link);
		});
		$("#avail-" + accordianFolderName).empty().append(folderScore);
	});

}


function addProbInfo (problem) {
	var problemName = problem.name;
	if(problem.testMode == true) { problemName = problem.name + " (in Test Mode)" };
	$("#submissions").removeClass("hidden");
	$("#hideInst").removeClass("hidden");
	$("#initSubmit").removeClass("hidden");
	$("#reload").removeClass("hidden");
	$("#recentpointbreakdown").addClass("hidden");
  	$("#desc-title").empty().append(problemName);
	$.post("/folder/read/", {id: problem.folder}, function(folder){
	    $("#desc-title").html(problemName + "<i> in " + folder.name + "</i>");
	});
	$("#desc-body").empty()
	if(problem.phase == 0){
		$("#desc-body").append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true" style="margin-right:5px;"></span>Since this problem is overdue, you may only earn partial credit.</div>');
	}
	console.log("problem.maxSubmissions" + problem.maxSubmissions);
    if(!isNull(problem.maxSubmissions)){
		console.log(problem.maxSubmissions + "problem.maxSubmissions");
		$("#desc-body").append('<div class="alert alert-danger" role="alert" id="remainingAttempts"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true" style="margin-right:5px;"></span>The number of submissions allowed for this problem is limited to ' + problem.maxSubmissions + '.</div>');
	}
	$("#desc-body").append(problem.text);
	$("#console").empty();
	curProblem = problem;
	$(".availablePtStyle").empty().append(problem.value.style);
	$(".availablePtCorrect").empty().append(problem.value.correct);
	var highestStyle = 0;
	var highestCorrect = 0;
	$.post("/submission/read/" + problem.id, {currentUser:true, ascending: true}, function (submissions) {
        $("#subs").empty();

		var remaining = problem.maxSubmissions - submissions.length;
		console.log("problem.maxSubmissions" + problem.maxSubmissions + "submissions.length" + submissions.length);
		if(remaining < 0){
			remaining = 0;
		}
	    if(!isNull(problem.maxSubmissions)){
			$("#remainingAttempts").append(' You have ' + remaining + ' remaining attempts.');
		}

        if(submissions.length > 0){
			$("#reload").removeAttr("disabled");
			$("#pointbreakdown").removeClass("hidden");
        }else {
			$("#reload").attr("disabled","disabled");
			$("#pointbreakdown").addClass("hidden");
        }
        if(parseInt(submissions.length) < parseInt(problem.maxSubmissions) || isNull(problem.maxSubmissions)){
			$("#initSubmit").removeAttr("disabled");
        }else {
    		$("#initSubmit").attr("disabled","disabled");
        }

		submissions.forEach( function (submission) {
			addSubmission(submission);
		});

		setHighestScore(submissions,problem);

		resizeWindow();
	
	});

}

function limitCheck(submission,problem){
	$.post("/submission/read/" + problem.id, {currentUser: true}, function (submissions) {

		var remaining = problem.maxSubmissions - submissions.length;
		if(remaining < 0){
			remaining = 0;
		}

		$("#remainingAttempts").empty().append('<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true" style="margin-right:5px;"></span>The number of submissions allowed for this problem is limited to ' + problem.maxSubmissions + '. You have ' + remaining + ' remaining attempts.');
        
        if(parseInt(submissions.length) < parseInt(problem.maxSubmissions)){
			$("#initSubmit").removeAttr("disabled");
        }else {
    		$("#initSubmit").attr("disabled","disabled");
        }
    });

}
function addSubmission(submission) {
	console.log("addSubmission");
	var time = new Date(submission.createdAt);
	var timeString = time.toLocaleDateString() + " " + time.toLocaleTimeString();
    var link = $("<tr></tr>");
    var buttonTD = $("<td></td>");
    var modalLink = $("<a></a>")
        .attr("data-toggle","modal")  //save
        .attr("data-target","#loadSubmissionModal")  //save
		.text(timeString)
        .click(function (event) {
            event.preventDefault();
            fillReloadModal(submission);
        });
    buttonTD.append(modalLink);
	link.append(buttonTD);
    var gradeF = $("<td></td>");
    var gradeS = $("<td></td>");
    var results = { correct: false, style: false };
    results.correct = results.correct || (submission.value.correct >= curProblem.value.correct);
    results.style = results.style || (submission.value.style >= curProblem.value.style);

    $(gradeF).append("<span class='badge'>" + submission.value.correct + "/" +curProblem.value.correct + "</span>");
    if (results.correct) {
        $(gradeF).append(correct("8px"));
    } else {
        $(gradeF).append(wrong("8px"));
    }
    $(gradeS).append("<span class='badge'>" + submission.value.style + "/" +curProblem.value.style + "</span>");
    if (results.style) {
        $(gradeS).append(correct("8px"));
    } else {
        $(gradeS).append(wrong("8px"));
    }
    link.append(gradeF);
    link.append(gradeS);

    if(feedbackOn){
		var requestFeedbackButton = $("<td id='subReq" + submission.id + "'></td>");
		link.append(requestFeedbackButton);
    }
    if(shareOn){
		var shareButton = $("<td id='subShare" + submission.id + "'></td>");
		link.append(shareButton);
	}

    //attach the link to the submission
	$("#subs").prepend(link);

	if(submission.fbResponseTime == null){
    	if(submission.fbRequested == false){
    		request(submission);
    	}else {
    		pending(submission);
    	}
	}else {
    	view(submission);
	}

    if(submission.shareOK == true){
    	unshare(submission);

    }else {
    	share(submission);
    }

}

function fillReloadModal(submission){
    reloadEditor.setValue(submission.code);
    //weird trick to make sure the codemirror box refreshes
    var that = this;  
    setTimeout(function() {
        that.reloadEditor.refresh();
    },10);

    $("#loadSubmission").unbind('click');
    $("#loadSubmission").click(function () { 
		editor.setValue(submission.code);
    });
}
function share(submission){
	var button = $("<button></button>")
		.attr("type","button")
		.addClass("btn btn-sm btn-primary")
		.text("Share")
    	.click(function () {
			if(confirm("Would you like to submit this code to share with the class?")){
				$.post("/submission/update", {id: submission.id, shareOK: true}, function (submission) {
					console.log("shared!"  + submission.id)
					unshare(submission);
				});
			}
		});
	$("#subShare" + submission.id).empty().append(button);
}

function unshare(submission){
	var button = $("<button></button>")
		.attr("type","button")
		.addClass("btn btn-sm btn-success")
		.text("Shared")
    	.click(function () {
			if(confirm("Would you like to revoke sharing permission?")){
				$.post("/submission/update", {id: submission.id, shareOK: false}, function (submission) {
					share(submission);
				});
			}
		});
	$("#subShare" + submission.id).empty().append(button);
}

function pending(submission){
    var button = $("<a></a>")
        .attr("data-toggle","modal")  //save
        .attr("data-target","#pendingRequestModal")  //save
		.addClass("btn btn-sm btn-warning")
		.text("Pending")
        .click(function (event) {
            event.preventDefault();
           fillPendingRequestModal(submission);
        });
	$("#subReq" + submission.id).empty().append(button);
}

function fillPendingRequestModal(submission){
	 var d = new Date(submission.createdAt);
    $("#modalText1").empty().append("You submitted this code on " + d.toLocaleString());
    var d = new Date(submission.fbRequestTime);
    $("#modalText2").empty().append("You requested feedback on " + d.toLocaleString());

    var submissionmessage = submission.fbRequestMsg;
	if(!submissionmessage){ submissionmessage = "You did not include a message with this request."}
    $("#submissionMessage").empty().append(submissionmessage);

    modalEditor.setValue(submission.code);
    modalEditor.refresh();
    //weird trick to make sure the codemirror box refreshes
    var that = this;  
    setTimeout(function() {
        that.modalEditor.refresh();
    },10);

    $("#cancelRequest").unbind('click');
    $("#cancelRequest").click(function () { 
		if(confirm("Sure you want to cancel this request?")){
			$.post("/submission/update", {id: submission.id, fbRequested: false, fbRequestTime: null, fbRequestMsg: null}, function (submission) {
				console.log("submission update in pending");
				request(submission);
				addPendingButton();
			});
		}
    });
}

function request(submission){
    var button = $("<a></a>")
        .attr("data-toggle","modal")  //save
        .attr("data-target","#submitRequestModal")  //save
		.addClass("btn btn-sm btn-primary")
		.text("Request")
        .click(function (event) {
            event.preventDefault();
           fillSubmitRequestModal(submission);
        });
	$("#subReq" + submission.id).empty().append(button);
}

function fillSubmitRequestModal(submission){
    var submissionmessage = submission.fbRequestMsg;
	if(!submissionmessage){ submissionmessage = "You did not include a message with this request."}
    $("#requestMessageModal").empty().append(submissionmessage);
    $('#submitRequestMsg').val('');

    requestModalEditor.setValue(submission.code);
    //weird trick to make sure the codemirror box refreshes
    var that = this;  
    setTimeout(function() {
        that.requestModalEditor.refresh();
    },10);

    $("#submitRequest").unbind('click');
    $("#submitRequest").click(function () { 
		if(confirm("Sure you want to submit this request?")){
    		var now = new Date().toISOString();
			var message = $('#submitRequestMsg').val();;

			$.post("/submission/update", {id: submission.id, fbRequested: true, fbRequestTime: now, fbRequestMsg: message}, function (submission) {
				console.log("submission update in request");
				pending(submission);
				addPendingButton();
			});
		}
    });
}

function view(submission){
	console.log("view called");
	var rqTime = new Date(submission.fbRequestTime);
	var rpTime = new Date(submission.fbResponseTime);

    if(!submission.feedbackSeen){
    	var classBlink = "blink";
    }else {
    	var classBlink = " ";
    }

	var button = $("<a></a>")
		.attr("href","feedback?subId=" + submission.id)
		.attr("target","_blank")
		.attr("type","button")
		.addClass("btn btn-sm btn-success " + classBlink)
		.text("View").click(function () {
			if(submission.feedbackSeen == false){
				$.post("/submission/update", {id: submission.id, feedbackSeen: true}, function (submission) {
					console.log("feedbackseen!"  + submission.id)
					unseenFeedback = unseenFeedback - 1;
					if(unseenFeedback == 0){
						$("#unseenFeedbackButton").remove();
					}
					view(submission);
				});
			}
		});
	$("#subReq" + submission.id).empty().append(button);


}


function resizeWindow(){
/*	var window_height = $("#consoleHeader").height();
    var window_height2 = $("#codemirror").height();
    var window_height3 = $("#instructions").height();
    var height = parseInt(window_height) + parseInt(window_height2) + parseInt(window_height3);
    console.log(window_height + " " + window_height2 + " " + window_height3 + " "  + height);
    */
    $('.scrollableAccordian').height("800px");
	var height = $( document ).height();
	var height = height - 100;
	console.log($( window ).width());
	if($( window ).width() > 990){
	    $('.scrollableAccordian').height(height);
	}else {
    	$('.scrollableAccordian').height("400px");
	}

}


function submitFoldersReload(folderid) {
	//reload accordian folder for a single folder (ie after you make a submission within it)
	var accordianFolderName = "accoridanFolder" + folderid;
	$("#" + accordianFolderName).empty();
	var earnedPointsDiv = "#earned-" +accordianFolderName;
	$(earnedPointsDiv).empty().append(0);
	$.post("/problem/read", {folder: curProblem.folder, phase: 2}, function (problems) {
		problems.forEach( function (problem) {
			var link = addProblemToAccordian(problem, accordianFolderName);
			$("#" + accordianFolderName).append(link);
		});
	});
}

function foldersReload() {
    $("#folderAccordion").empty();
	$.post("/folder/read", {}, function (folders) {
		folders.forEach( function (folder) {
			console.log("ADDING " + folder.name);
			addFolder(folder);
		});
	});
    if(curProblem) {
        addProbInfo(curProblem);
    }
}

function updateScore(){
    $.post("/setting/read/", {name: "points"}, function(setting){
		points = setting.value;
	    $.post("/user/read/", {me: true}, function(user){
			$("#grade").empty().append("0" + " / " + points);
	    	if($.isNumeric(user.currentScore)){ 
				$("#grade").empty().append(user.currentScore + " / " + points);
			}else { //if first log in
				console.log('is not number');
                $.post("/user/updateScore/", {currentScore:"0"}, function(user){
                });
			}
	    });
    });
}

function changeFontSize(size){
  editor.getWrapperElement().style["font-size"] = size+"px";
  editor.refresh();
}

var editor;
var modalEditor;
var requestModalEditor;
var reloadEditor;
var feedbackOn;
var shareOn;
var points;

function studentScore(){ //recalculate and re-store the student's score
	console.log("studentScore");
	$("#grade").empty().append('<span class="glyphicon glyphicon-refresh spin"></span>');
    $("#studentScoreButton").empty().append('<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>');
    $.post("/submission/read/", {currentUser: true}, function(submissions){
        var totalSubmissionNumber = submissions.length;
        var submissionCount = 0;
        var called = false; //make sure the update only gets called once.
        $.post("/folder/read", {}, function (folders) {
            var studScore = 0;
            folders.forEach( function (folder) {
                $.post("/problem/read", {folder: folder.id, phase: 2}, function (problems) {
                    problems.forEach( function (problem) {
                        var maxScore = 0;
                        $.post("/submission/read/", {id: problem.id, currentUser: true}, function(submissions){
                            submissions.forEach( function (submission) {
                                submissionCount++;
                                var curSubScore = Number(submission.value.correct)+Number(submission.value.style);
                                if(curSubScore > maxScore) {
                                    maxScore = curSubScore;
                                }
                            });
                            studScore += maxScore;
                            if(totalSubmissionNumber == submissionCount && called == false){
                            	called = true; //make sure the update only gets called once.
                                console.log("preping to update..." + studScore);
                                $.post("/user/updateScore/", {currentScore:studScore}, function(user){
                                    updateScore();
                                });
                            }
                        });
                    });
                });
            });
        });
    });
}

function setConsoleResultMessage(msg) {
	$("#console").empty();
	if(msg){
		$("#console").append(msg);
		var eachLine = msg.split('\n');
		$('#console').attr("rows", eachLine.length);
	}
};

function setHighestScore(submissions,problem){
	var highestStyle = 0;
	var highestCorrect = 0;
	console.log('nerp');

	submissions.forEach( function (submission) {
		console.log('derp');
		if(submission.value.style > highestStyle){
			highestStyle = submission.value.style;
		}
		if(submission.value.correct > highestCorrect){
			highestCorrect = submission.value.correct;
		}
	});

	$("#highestPtCorrect").empty().append(highestCorrect);
	$("#highestPtStyle").empty().append(highestStyle);

	console.log("highestCorrect+highestStyle" + highestCorrect + " " + highestStyle);
	console.log("problem.style+problem.correct" + problem.value.style + " " + problem.value.correct);

	var myScore = parseFloat(highestCorrect) + parseFloat(highestStyle);
	var theScore = parseFloat(problem.value.style) + parseFloat(problem.value.correct);
	if(myScore >= theScore){
		$("#pointbreakdown").removeClass("alert-warning");
		$("#pointbreakdown").addClass("alert-success");
	}else {
		$("#pointbreakdown").addClass("alert-warning");
		$("#pointbreakdown").removeClass("alert-success");
	}

	$("#correctCheck").empty();
	$("#styleCheck").empty();

	//append checks xs if they have attempted
	if(submissions.length > 0){
		if(highestCorrect >= problem.value.correct){
			$("#correctCheck").append(correct("8px"));
		}else {
        	$("#correctCheck").append(wrong("8px"));
		}	
		if(highestStyle >= problem.value.style){
			$("#styleCheck").append(correct("8px"));
		}else {
        	$("#styleCheck").append(wrong("8px"));
		}
	}	
}

function setRecentScore (earnedF,earnedS) {
	$("#pointbreakdown").removeClass("hidden");
	$("#recentpointbreakdown").removeClass("hidden");
	$("#recentPtCorrect").empty().append(earnedF);
	$("#recentPtStyle").empty().append(earnedS);
	if(earnedF >= curProblem.value.correct){
		$("#correctCheckRecent").empty().append(correct("8px"));
	}else {
    	$("#correctCheckRecent").empty().append(wrong("8px"));
	}	
	if(earnedS >= curProblem.value.style){
		$("#styleCheckRecent").empty().append(correct("8px"));
	}else {
    	$("#styleCheckRecent").empty().append(wrong("8px"));
	}
	var availF = $("#availptc").text();
	var availS = $("#availpts").text();
	if(parseFloat(earnedS+earnedF) >= (parseFloat(availF)+parseFloat(availS))){
		$("#recentpointbreakdown").removeClass("alert-warning");
		$("#recentpointbreakdown").addClass("alert-success");
	}else {
		$("#recentpointbreakdown").addClass("alert-warning");
		$("#recentpointbreakdown").removeClass("alert-success");
	}

}

function fillUnseenFeedbackModal(submissions){
	$("#unseenFeedbackBody").empty();
	var myArray = [];
	submissions.forEach( function (submission) {
		console.log(submission.fbResponseTime + submission.user);
		var rqTime = new Date(submission.fbRequestTime);
		var rpTime = new Date(submission.fbResponseTime);

		myArray.push(submission.problem);
	});

	$.unique(myArray);
    for (var i = 0; i < myArray.length; i++){
    
		$.post("/problem/read", {id: myArray[i]}, function (problem) {
			$.post("/folder/read", {id: problem.folder}, function (folder) {
				var button = $("<a></a>")
					.attr("data-dismiss","modal")
					.html(problem.name + " in " + folder.name).click(function () {
							addProbInfo(problem);
					});
				$("#unseenFeedbackBody").append($("<li>").append(button));
			});

			/*var button = $("<a></a>")
				.attr("href","feedback?subId=" + submission.id)
				.attr("target","_blank")
				.attr("data-dismiss","modal")
				.text(problem.name + rpTime.toLocaleString() ).click(function () {
					$(this).detach();
					$.post("/submission/update", {id: submission.id, feedbackSeen: true}, function (submission) {
					});
					$.post("/problem/read", {id: submission.problem}, function (problem) {
						addProbInfo(problem);
					});
				});*/

		});

	}
}

function fillPendingFeedbackModal(submissions){
	$("#pendingFeedbackBody").empty();
	var myArray = [];
	submissions.forEach( function (submission) {
		console.log(submission.fbResponseTime + submission.user);
		var rqTime = new Date(submission.fbRequestTime);
		var rpTime = new Date(submission.fbResponseTime);

		myArray.push(submission.problem);
	});

	$.unique(myArray);
    for (var i = 0; i < myArray.length; i++){
    
		$.post("/problem/read", {id: myArray[i]}, function (problem) {
			$.post("/folder/read", {id: problem.folder}, function (folder) {
				var button = $("<a></a>")
					.attr("data-dismiss","modal")
					.html(problem.name + " in " + folder.name).click(function () {
							addProbInfo(problem);
					});
				$("#pendingFeedbackBody").append($("<li>").append(button));
			});
		});

	}
	if(myArray.length == 0){
		$("#pendingFeedbackBody").append("Oops! There are no pending requests! Try refreshing the page.");
	}
}

function addPendingButton(){
	$.post("/submission/read/", {currentUser:true, feedback: true}, function(submissions){
    	if(submissions.length > 0){
    		if(!$("#pendingFeedbackButton").length){
			    var modalLink = $("<button></button>")
			    	.attr("id","pendingFeedbackButton")
					.attr("type","button")
					.css("float","right")
					.css("margin-top","7px")
					.addClass("btn btn-warning")
			        .attr("data-toggle","modal")  //save
			        .attr("data-target","#pendingFeedbackModal")  //save
					.text("Pending Requests")
			        .click(function (event) {
			            event.preventDefault();
			            $.post("/submission/read/", {currentUser:true, feedback: true}, function(submissions){
		           			fillPendingFeedbackModal(submissions);
		           		});		   	
			        });
		  	  	$("#navbarHeader").append(modalLink);
    		}
    	}else {
    		$("#pendingFeedbackButton").remove();
    	}

    });
}

window.onload = function () {

	(function () {
		var u = document.URL.split("/");
		u.pop();
		$("#target").val(u.join("/") + "/login/authenticate");
	})();
    
    $.post("/setting/read/", {name: "feedback"}, function(setting){
        if(setting.on == true || setting.on == "true"){
            feedbackOn = true;
			$("#subsHead").append("<td>Feedback</td>");
	        $.post("/submission/read/", {feedbackSeen: false,currentUser:true}, function(submissions){
	        	unseenFeedback = submissions.length;
	        	if(submissions.length > 0){
				    var modalLink = $("<button></button>")
				    	.attr("id","unseenFeedbackButton")
						.attr("type","button")
						.css("float","right")
						.css("margin-top","7px")
						.addClass("btn btn-success")
				        .attr("data-toggle","modal")  //save
				        .attr("data-target","#unseenFeedbackModal")  //save
						.text("Unread Feedback")
				        .click(function (event) {
				            event.preventDefault();
				            $.post("/submission/read/", {feedbackSeen: false,currentUser:true}, function(submissions){
			           			fillUnseenFeedbackModal(submissions);
			           		});		   	
				        });
			  	  	$("#navbarHeader").append(modalLink);
	        	}
	        });

	        addPendingButton();

	 

        }else {
            feedbackOn = false;
        }
            
    });
    $.post("/setting/read/", {name: "share"}, function(setting){
        if(setting.on == true || setting.on == "true"){
            shareOn = true;
			$("#subsHead").append("<td>Share</td>");

        }else {
            shareOn = false;
        }
    });




    updateScore();

    //save student's code on interval
    setInterval(
        function() {
          //save current code into user modelget  
            var code = editor.getValue();
            $.post("/user/saveCode", {code: code}, function(user) {
            });
        },
        120000 /* 120000ms = 2 min*/
    );
    $("#folderAccordion").empty();
	$.post("/folder/read", {}, function (folders) {
		folders.forEach( function (folder) {
			addFolder(folder);
		});
	});
	editor = CodeMirror.fromTextArea(codemirror, {
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
	reloadEditor = CodeMirror.fromTextArea(reloadCodemirror, {
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

	requestModalEditor = CodeMirror.fromTextArea(requestModalCodemirror, {
		mode: "javascript",
		styleActiveLine: true,
		lineNumbers: true,
		lineWrapping: true,
		theme: "mbo",
		readOnly: true,
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

	$('#submitRequestModal').on('shown.bs.modal', function (e) {
		requestModalEditor.refresh();
	})

	$('#pendingRequestModal').on('shown.bs.modal', function (e) {
		modalEditor.refresh();
	})

	$('#loadSubmissionModal').on('shown.bs.modal', function (e) {
		reloadEditor.refresh();
	})

	
	$("#test").click(function () {
		var code = editor.getValue();
		$("#console").empty();
		try {
			eval(code);
			$("#console").append("No error reports");
		} catch (e) {
			//alert(e);
			$("#console").append(e);
		}
	});
	
	$("#reload").click(function () {
		$.post("/submission/read/" + curProblem.id, {currentUser: true, limitOne: true}, function (submissions) {
			submissions.forEach( function (submission) {
				editor.setValue(submission.code);
			});
		});
	});

	$( "#fontSize" ).change(function() {
	    var str = "";
		$( "select option:selected" ).each(function() {
			str += $( this ).text() + " ";
		});
		console.log(str);
		changeFontSize(parseInt(str));
	});
	
	$("#submit").click(function () {
		console.log("submit clicked");
		if (curProblem == null) {
			alert("You must select a problem before submitting");
		} else {
			console.log("gonna add it");

			$("#console").empty();
			var code = editor.getValue();
			try {
				if(curProblem.language == "javascript"){
					var AST = acorn.parse(code);    // return an abstract syntax tree structure
					// var types = pnut.listTopLevelTypes(AST);
					var ssOb = pnut.collectStructureStyleFacts(AST);    // return a analysis of style grading by checking AST
				}else {
					var ssOb = {'null':'null'};
				}
				$.post("/submission/create", {problem: curProblem.id, code: code, style: JSON.stringify(ssOb)}, function (submission) {
					addSubmission(submission);
					if(!isNull(curProblem.maxSubmissions)){
						limitCheck(submission,curProblem);
					}
					submitFoldersReload(curProblem.folder);
					$.post("/submission/read/" + curProblem.id, {currentUser: true}, function (submissions) {
						setHighestScore(submissions,curProblem);	
					});
					setRecentScore(submission.value.correct, submission.value.style);
					console.log(submission.message);
					setConsoleResultMessage(submission.message);
					console.log("studentScore tada");
					studentScore();
				});
			} catch (e) {
				alert("Parsing Analysis Exception");
				$("#console").append("Did you test your code locally? You might have a syntax error.");
			}

		}
	});

	$('#accShow').on('click', function() {
	    if($("#accShowIcon").hasClass('glyphicon-folder-open')) {
	        $("#accShowIcon").removeClass('glyphicon-folder-open');
	        $("#accShowIcon").addClass('glyphicon-folder-close');
	        $('.folderCollapse').collapse('show');
	    } else {
	        $("#accShowIcon").removeClass('glyphicon-folder-close');
	        $("#accShowIcon").addClass('glyphicon-folder-open');
	        $('.folderCollapse').collapse('hide');
	    }
	    return false;
	});


	resizeWindow();

	$( window ).resize(function() {
		resizeWindow();
	});

};



