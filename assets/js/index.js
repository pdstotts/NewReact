var curProblem = null;

var allFolders = {};
var folderTotScore = 0;
var folderStudScore = 0;
var totScore = 0;
var studScore = 0;

function addProblemToAccordian(problem,folderName){
	var earnedPointsDiv = "#earned-" +folderName;
	var availPointsDiv = "#avail-" +folderName;
	var checkDiv = "#check-" +folderName;
	var maxScore = 0;
	var probMax = Number(problem.value.correct) + Number(problem.value.style);
	totScore += probMax;
	var problemName = problem.name;
	if(problem.testMode == true) { problemName = problem.name + " (Test Mode)" };
	var bg = "";
	if(problem.testMode == true){
		bg = "style='background-color: #ededed'";
	}
	var link = $('<li id="' + problem.id +  '" ' + bg  + '></li>').append(
		$("<a></a>")
			.attr("href","#")
			.append(problemName)
	);
	if(problem.phase == 0) {
	    link.css("text-decoration", "line-through");
	}
	link.click(function () { addProbInfo(problem); });

	if (loggedIn) {
		var results = { correct: false, style: false };
		$.post("/submission/read/" + problem.id, {}, function (submissions) {
		if (!submissions.length == 0) {
			submissions.forEach( function (submission) {
				var curSubScore = Number(submission.value.correct)+Number(submission.value.style);
				if(curSubScore > maxScore) {
					maxScore = curSubScore;
				}
				results.correct = 
					results.correct || (submission.value.correct == problem.value.correct);
				results.style = results.style || (submission.value.style == problem.value.style);
				if (results.correct && results.style) { return true; } 

				if($("#panel-" + folderName).hasClass("panel-danger")){
					$("#panel-" + folderName).removeClass("panel-danger");
					$("#panel-" + folderName).addClass("panel-warning");
				}

			});
			studScore += maxScore;
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
				$(checkDiv).append(correct("8px").css("float","right"));
				$("#panel-" + folderName).removeClass("panel-danger");
				$("#panel-" + folderName).removeClass("panel-warning");
				$("#panel-" + folderName).addClass("panel-success");
			}

		}
		//setting/update
		//$("#grade").empty().append(studScore + "/" + totScore);
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
			folderScore += parseInt(problem.value.style) + parseInt(problem.value.correct);
			$("#" + accordianFolderName).append(link);
		});
		$("#avail-" + accordianFolderName).empty().append(folderScore);
	});

}


function addProbInfo (problem) {
	var problemName = problem.name;
	if(problem.testMode == true) { problemName = problem.name + " (in Test Mode)" };
	$("#initSubmit").removeAttr("disabled");
	$("#submissions").removeClass("hidden");
	$("#recentpointbreakdown").addClass("hidden");
  	$("#desc-title").empty().append(problemName);
	$.post("/folder/read/", {id: problem.folder}, function(folder){
	    $("#desc-title").html(problemName + "<i> in " + folder.name + "</i>");
	});
	$("#desc-body").empty().append(problem.text);
	$("#console").empty();
	curProblem = problem;
	$(".availablePtStyle").empty().append(problem.value.style);
	$(".availablePtCorrect").empty().append(problem.value.correct);
	var highestStyle = 0;
	var highestCorrect = 0;
	$.post("/submission/read/" + problem.id, {}, function (submissions) {
        $("#subs").empty();

        if(submissions.length > 0){
			$("#reload").removeAttr("disabled");
			$("#pointbreakdown").removeClass("hidden");
        }else {
			$("#reload").attr("disabled","disabled");
			$("#pointbreakdown").addClass("hidden");
        }
		submissions.forEach( function (submission) {
			addSubmission(submission);
			if(submission.value.style > highestStyle){
				highestStyle = submission.value.style;
			}
			if(submission.value.correct > highestCorrect){
				highestCorrect = submission.value.correct;
			}
		});

		$("#highestPtCorrect").empty().append(highestCorrect);
		$("#highestPtStyle").empty().append(highestStyle);

		if((highestCorrect+highestStyle) >= (problem.value.style+problem.value.correct)){
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
		resizeWindow();
	
	});

}

function addSubmission(submission) {
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
//#loadSubmission
    //make the problem link produce the submission code on click
	


    //attach the link to the submission
	$("#subs").prepend(link);

    if(submission.fbRequested == false){
    	request(submission);
    }else if(submission.fbResponseTime == null) {
    	pending(submission);
    }else {
    	view(submission);
    }

    console.log(submission.shareOk);
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
        .attr("data-target","#myPendingModal")  //save
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
    console.log("submission message =p " + submissionmessage);
	if(!submissionmessage){ submissionmessage = "You did not include a message with this request."}
    $("#submissionMessage").empty().append(submissionmessage);

    modalEditor.setValue(submission.code);
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
			});
		}
    });
}

function view(submission){
	var rqTime = new Date(submission.fbRequestTime);
	var rpTime = new Date(submission.fbResponseTime);

    $.post("/user/read/" + submission.fbResponder, {}, function (user) {
        if (!user) {
            alert("No user with that id found");
            return;
        }

        if(!submission.feedbackSeen){
        	var classBlink = "blink";
        }else {
        	var classBlink = " ";
        }

		var button = $("<a></a>")
			.attr("href","feedback?subCode=" + submission.code.replace(/\n/g,"<br />") + "&rqMsg=" + submission.fbRequestMsg + "&rpMsg=" + submission.fbResponseMsg + "&rpCode=" + submission.fbCode.replace(/\n/g,"<br />") + "&rqTime=" + rqTime + "&rpTime=" + rpTime + "&responder=" + user.displayName + "&console=" + submission.message)
			.attr("target","_blank")
			.attr("type","button")
			.addClass("btn btn-sm btn-success " + classBlink)
			.text("View").click(function () {
				$.post("/submission/update", {id: submission.id, feedbackSeen: true}, function (submission) {
					console.log("feedbackseen!"  + submission.id)
					view(submission);
				});
			});
		$("#subReq" + submission.id).empty().append(button);
    });

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
    $('.scrollableAccordian').height(height);

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
        studScore = 0;
        totScore = 0;
		folders.forEach( function (folder) {
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
			$("#grade").empty().append(user.currentScore + "/" + points);
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
	var setConsoleResultMessage = function (msg) {
		$("#console").empty();
		$("#console").append(msg);
	};
	var setRecentScore = function (earnedF,earnedS) {
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
		if((earnedS+earnedF) >= (availF+availS)){
			$("#recentpointbreakdown").removeClass("alert-warning");
			$("#recentpointbreakdown").addClass("alert-success");
		}else {
			$("#recentpointbreakdown").addClass("alert-warning");
			$("#recentpointbreakdown").removeClass("alert-success");
		}

	}
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
		$.post("/submission/read/" + curProblem.id, {}, function (submissions) {
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
		if (curProblem == null) {
			alert("You must select a problem before submitting");
		} else {
			$("#console").empty();
			var problem = curProblem.id;
			var code = editor.getValue();
			try {
				var AST = acorn.parse(code);    // return an abstract syntax tree structure
				// var types = pnut.listTopLevelTypes(AST);
				var ssOb = pnut.collectStructureStyleFacts(AST);    // return a analysis of style grading by checking AST
				$.post("/submission/create", {problem: problem, code: code, style: JSON.stringify(ssOb)}, function (submission) {
					addSubmission(submission);
					//foldersReload();
					submitFoldersReload(curProblem.folder);
					setRecentScore(submission.value.correct, submission.value.style);
					setConsoleResultMessage(submission.message);
					updateScore();
				});
			} catch (e) {
				$("#console").append("Error! Be sure to test your code locally before submitting.");
			}

		}
	});

	$('#accShow').on('click', function() {
	    if($(this).text() == 'Close Folders') {
	        $(this).text('Expand Folders');
	        $('.folderCollapse').collapse('hide');
	    } else {
	        $(this).text('Close Folders');
	        $('.folderCollapse').collapse('show');
	    }
	    return false;
	});

	resizeWindow();

	$( window ).resize(function() {
		resizeWindow();
	});

};



