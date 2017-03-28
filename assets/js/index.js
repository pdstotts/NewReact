var curProblem = null;
var unseenFeedback = null;
var pretendStudent = false;
var miniBar = true;

function isNull(item){
	if (item==null || item=="null" || item=="" || item=='') { return true; }
  else { return false; }
}

function addProblemToAccordian(problem,folderName){
	var earnedPointsDiv = "#earned-" +folderName;
	var availPointsDiv = "#avail-" +folderName;
	var checkDiv = "#check-" +folderName;
	var maxScore = 0;
	var probMax = Number(problem.value.correct) + Number(problem.value.style);
	var problemName = problem.name;
	if(problem.testMode == true){
    problemName = "<font color=#E67E22><b>[TEST]&nbsp;</b></font>" + problem.name; 
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
		$.post("/submission/read/" + problem.id, {currentUser:true}, 
           function (submissions) {
		         if (!submissions.length == 0) {
			         $("#panel-" + folderName).removeClass("panel-danger");
			         $("#panel-" + folderName).addClass("panel-warning");
			         submissions.forEach( 
                 function (submission) {
				           var curSubScore = Number(submission.value.correct)+Number(submission.value.style);
				           if(curSubScore > maxScore) { maxScore = curSubScore; }
				           results.correct = 
					           results.correct || (submission.value.correct == problem.value.correct);
				           results.style = results.style || (submission.value.style == problem.value.style);
				           if (results.correct && results.style) { return true; } 
			           }
               );
		           if (maxScore < probMax) {
			           $("#" + problem.id).css("color", "#ae4345");
			           $("a", link).css("color", "#ae4345");
		             } 
               else {
			           $("#" + problem.id).css("color", "green");
			           $("a", link).css("color", "green");
		           }
		           var probGrade = $('<span style="float:right;">' + maxScore + "/" + 
                                 ( Number(problem.value.correct) + 
                                   Number(problem.value.style)  ) + "</span>");
		           $("a", link).append(probGrade);

		           var currentEarned = $(earnedPointsDiv).text();
		           var availablePoints = $(availPointsDiv).text();
		           currentEarned = Number(currentEarned);
		           currentEarned = currentEarned + maxScore;
		           $(earnedPointsDiv).empty().append(currentEarned);

		           if(availablePoints <= currentEarned && $("#panel-" + folderName).hasClass("panel-warning")){
			           $(checkDiv).empty().append(correct("8px").css("float","right"));
			           $("#panel-" + folderName).removeClass("panel-danger");
			           $("#panel-" + folderName).removeClass("panel-warning");
			           $("#panel-" + folderName).addClass("panel-success");
		           }
	           } else {
		           var probGrade = $('<span style="float:right;">' +  (Number(problem.value.correct) + 
                                 Number(problem.value.style)) +"pts</span>");
		           $("a", link).append(probGrade);
	           }
	         }
    );
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
	var toggleLabel = 
/*
         '<a href="http://www.unc.edu/~stotts/comp110/110-L1-BS0.pptx" ' +
         'target="#pptTab"> <b>[PPT]&nbsp</b> </a>' +
*/
         '<a data-toggle="collapse" data-parent="#accordion" href="#' + 
         accordianFolderName + '">' + folder.name + '</a>';
	var accordian = "<div id='panel-" + accordianFolderName  + 
        "' class='panel panel-danger panelHide'><div class='panel-heading'>" +
        "<h4 class='panel-title'>" + toggleLabel + 
        " <span id='earned-"+ accordianFolderName + "'>0</span>/<span id='avail-"+ 
        accordianFolderName + "'></span><span id='check-"+ accordianFolderName + 
        "'></span></h4></div><ul id = '" + accordianFolderName + 
        "' class='panel-collapse collapse folderCollapse doneCollapse'></ul></div></div>";

	$("#folderAccordion").append(accordian);
	var accordianFolderBody = '';
	$("#" + accordianFolderName).append(accordianFolderBody);
	var folderScore = 0;
	$("#avail-" + accordianFolderName).empty().append(folderScore);
	$("#" + accordianFolderName).empty();
	$.post("/problem/read", {folder:folder.id, phase:2, pretendStudent:pretendStudent}, 
    function (problems) {
		  problems.forEach( function (problem) {
			  var link = addProblemToAccordian(problem, accordianFolderName);
			  folderScore += parseFloat(problem.value.style) + parseFloat(problem.value.correct);
			  $("#" + accordianFolderName).append(link);
		  });
		  $("#avail-" + accordianFolderName).empty().append(folderScore);
	  });
}

function addProbInfo (problem) {
  var preParts = "<button type='button' data-toggle='modal' data-target='#vidModal' " +
        " class='span4 proj-div text-right vidButton'> " +
        " <font > " +
        " VIDEO <span class='glyphicon glyphicon-facetime-video'></span>" +
        " </font></button>" +
/*
        '<A target="_blank" href="http://www.cs.unc.edu/Courses/cco-comp110/bricksVids/firstProg.getStarted.mp4">&nbsp vid link</A>' + 
*/
        "&nbsp&nbsp" ;
	if (problem.testMode == true) { 
    preparts += "<font color=#E67E22><b>[TEST]&nbsp;</b></font>" ;
  };
	problemName = preParts + "<font color=firebrick><b>" + problem.name +"</b></font>"; 

	$("#submissions").removeClass("hidden");
	$("#hideInst").removeClass("hidden");
	$("#initSubmit").removeClass("hidden");
	$("#reload").removeClass("hidden");
	$("#save").removeClass("hidden");
	if (miniBar==false) {
		$("#save").css("width","49%");
	} else {
		$("#save").css("width","23%");
	}

  if (isNull(problem.vidURL)) {
    //problem.vidURL = "http://ccocomp110.web.unc.edu/files/2016/06/errNoVid.mp4";
    if (problem.type==="diy") {
      problem.vidURL = "http://www.cs.unc.edu/Courses/cco-comp110/bricksVids/vidDIY.mp4";
    } else if (problem.type==="wall") {
      problem.vidURL = "http://www.cs.unc.edu/Courses/cco-comp110/bricksVids/vidWALL.mp4";
    } else if (problem.type==="exam") {
      problem.vidURL = "http://www.cs.unc.edu/Courses/cco-comp110/bricksVids/vidEXAM.mp4";
    } else {  // problem.type==="twit", or something else
      //problem.vidURL = "http://www.cs.unc.edu/Courses/cco-comp110/bricksVids/errNoVid.mp4";
      problem.vidURL = "http://www.cs.unc.edu/Courses/cco-comp110/bricksVids/uncLogo2.mp4";
    }
  }

  $("#vidPanel video").attr("src", problem.vidURL);
  $("#vidModal video").attr("src", problem.vidURL);
  $("#vidModalLabel span").text("Video for "+problem.name+" in "+problem.folder);

  $("#vidModal").on('hide.bs.modal', function (e) {
     $("#vidModal video").attr("src", $("#vidModal video").attr("src"));
  });
  $("#vidModal").draggable({
     handle: ".modal-header"
  });

	$("#recentpointbreakdown").addClass("hidden");
  	$("#desc-title").empty().append(problemName);
	$.post("/folder/read/", {id: problem.folder}, function(folder){
	    $("#desc-title").html("<b>" + problemName + 
           "</b>&nbsp;&nbsp; <i>in module&nbsp;<font color=darkblue><b> " 
           + folder.name + "</b></font></i>");
	});
	$("#desc-body").empty();
	if(problem.phase == 0){
		$("#desc-body").append( 
        '<div class="alert alert-danger" role="alert"> <span ' +
        'class="glyphicon glyphicon-exclamation-sign" aria-hidden="true" ' +
        'style="margin-right:5px;">' +
        '</span>Since this problem is overdue, you may only earn partial credit.</div>'
    );
	}
  if(!isNull(problem.maxSubmissions)){
		$("#desc-body").append(
        '<div class="alert alert-danger" role="alert" id="remainingAttempts"><span ' +
        'class="glyphicon glyphicon-exclamation-sign" aria-hidden="true" ' +
        'style="margin-right:5px;">' +
        '</span>The number of submissions allowed for this problem is limited to ' + 
        problem.maxSubmissions + '.</div>'
    );
	}

	if(problem.language !== "javascript") { 
    $("#test").addClass('hidden'); 
  } else { 
    $("#test").removeClass('hidden'); 
  }

	$("#desc-body").append(problem.text);
	$("#console").empty();
	curProblem = problem;
	$(".availablePtStyle").empty().append(problem.value.style);
	$(".availablePtCorrect").empty().append(problem.value.correct);
	var highestStyle = 0;
	var highestCorrect = 0;
	$.post("/submission/read/" + problem.id, {currentUser:true, ascending: true}, 
     function (submissions) {
       $("#subs").empty();

		   var remaining = problem.maxSubmissions - submissions.length;
		   if(remaining < 0) { remaining = 0; }
	     if(!isNull(problem.maxSubmissions)){
			   $("#remainingAttempts").append(' You have ' + remaining + ' remaining attempts.');
		   }

       if(submissions.length > 0) {
			   $("#reload").removeAttr("disabled");
			   $("#pointbreakdown").removeClass("hidden");
       } else {
			   $("#reload").attr("disabled","disabled");
			   $("#pointbreakdown").addClass("hidden");
       }
       if( parseInt(submissions.length) < parseInt(problem.maxSubmissions) 
           || isNull(problem.maxSubmissions) ) { 
         $("#initSubmit").removeAttr("disabled"); 
       } else { 
         $("#initSubmit").attr("disabled","disabled"); 
       }

		   submissions.forEach( function(submission){addSubmission(submission);} );
		   setHighestScore(submissions,problem);
		   resizeWindow();
   	 }
   );
}

function limitCheck(submission,problem){
	$.post("/submission/read/" + problem.id, 
         {currentUser: true}, 
         function (submissions) {
		       var remaining = problem.maxSubmissions - submissions.length;
		       if(remaining < 0) { remaining = 0; }
		       $("#remainingAttempts").empty().append(
              '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true" ' +
              'style="margin-right:5px;"></span> ' +
              'The number of submissions allowed for this problem is limited to ' + 
              problem.maxSubmissions + '. You have ' + remaining + ' remaining attempts.'
           );
           if(parseInt(submissions.length) < parseInt(problem.maxSubmissions)){
			       $("#initSubmit").removeAttr("disabled");
           } else {
       		  $("#initSubmit").attr("disabled","disabled");
           }
         }
  );
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
      .click( function (event) {
                event.preventDefault();
                fillReloadModal(submission);
              }
      );
  buttonTD.append(modalLink);
	link.append(buttonTD);
  var gradeF = $("<td></td>");
  var gradeS = $("<td></td>");
  var results = { correct: false, style: false };
  results.correct = 
    results.correct || (submission.value.correct >= curProblem.value.correct);
  results.style = results.style || (submission.value.style >= curProblem.value.style);

  $(gradeF).append( "<span class='badge'>" + submission.value.correct + "/" +
                    curProblem.value.correct + "</span>"
                  );
  if (results.correct) { 
    $(gradeF).append(correct("8px")); 
  } else { 
    $(gradeF).append(wrong("8px")); 
  }
  $(gradeS).append( "<span class='badge'>" + submission.value.style + "/" +
                    curProblem.value.style + "</span>"
                  );
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
    } else {
      pending(submission);
   	}
	} else {
    view(submission);
	}

  if(submission.shareOK == true){
   	unshare(submission);
  } else {
    share(submission);
  }
}

function fillReloadModal(submission) {
  reloadEditor.setValue(submission.code);
  //weird trick to make sure the codemirror box refreshes
  var that = this;  
  setTimeout(function() { that.reloadEditor.refresh(); },10);

  $("#loadSubmission").unbind('click');
  $("#loadSubmission").click(function(){editor.setValue(submission.code);} );
}

function share(submission) {
  var button = $("<button></button>")
  		.attr("type","button")
  		.addClass("btn btn-sm btn-primary")
		  .text("Share")
    	.click( function () {
			          if(confirm("Would you like to submit this code to share with the class?")) {
				          $.post( "/submission/update", 
                          { id: submission.id, shareOK: true }, 
                          function (submission) { unshare(submission); }
                  );
		           	}
		          }
      );
	$("#subShare" + submission.id).empty().append(button);
}

function unshare(submission){
  var button = $("<button></button>")
 	      .attr("type","button")
		    .addClass("btn btn-sm btn-success")
		    .text("Shared")
    	  .click( function () {
			            if(confirm("Would you like to revoke sharing permission?")){
				            $.post( "/submission/update", 
                            { id: submission.id, shareOK: false }, 
                            function (submission) { share(submission); }
                    );
			            }
		            }
        );
	$("#subShare" + submission.id).empty().append(button);
}

function pending(submission){
  var button = $("<a></a>")
        .attr("data-toggle","modal")  //save
        .attr("data-target","#pendingRequestModal")  //save
   		  .addClass("btn btn-sm btn-warning")
		    .text("Pending")
        .click( function (event) {
                  event.preventDefault();
                  fillPendingRequestModal(submission);
                }
        );
	$("#subReq" + submission.id).empty().append(button);
}

function fillPendingRequestModal(submission){
  var d = new Date(submission.createdAt);
  $("#modalText1").empty().append("You submitted this code on " + d.toLocaleString());
  var d = new Date(submission.fbRequestTime);
  $("#modalText2").empty().append("You requested feedback on " + d.toLocaleString());

  var submissionmessage = submission.fbRequestMsg;
	if(!submissionmessage){ 
    submissionmessage = "You did not include a message with this request." 
  }
  $("#submissionMessage").empty().append(submissionmessage);

  modalEditor.setValue(submission.code);
  modalEditor.refresh();
  //weird trick to make sure the codemirror box refreshes
  var that = this;  

  setTimeout( function() { that.modalEditor.refresh(); }, 10 );

  $("#cancelRequest").unbind('click');
  $("#cancelRequest").click(
    function () { 
	    if(confirm("Sure you want to cancel this request?")){
	      $.post("/submission/update", 
               { id: submission.id, fbRequested: false, fbRequestTime: null, 
                 fbRequestMsg: null }, 
               function (submission) { request(submission); addPendingButton(); }
        );
      }
    }
  );
}

function request(submission){
  var button = $("<a></a>")
      .attr("data-toggle","modal")  //save
      .attr("data-target","#submitRequestModal")  //save
      .addClass("btn btn-sm btn-primary")
		  .text("Request")
      .click( function (event) {
                event.preventDefault();
                fillSubmitRequestModal(submission);
              }
      );
  $("#subReq" + submission.id).empty().append(button);
}

function fillSubmitRequestModal(submission) {
  var submissionmessage = submission.fbRequestMsg;
	if(!submissionmessage){ 
    submissionmessage = "You did not include a message with this request." 
  }
  $("#requestMessageModal").empty().append(submissionmessage);
  $('#submitRequestMsg').val('');

  requestModalEditor.setValue(submission.code);
  //weird trick to make sure the codemirror box refreshes
  var that = this;  
  setTimeout(function() { that.requestModalEditor.refresh(); },10);
  $("#submitRequest").unbind('click');
  $("#submitRequest").click( 
    function () { 
	    if( confirm("Sure you want to submit this request?") ) {
	      var now = new Date().toISOString();
		    var message = $('#submitRequestMsg').val();;
		    $.post("/submission/update", 
               { id: submission.id, fbRequested: true, fbRequestTime: now, 
                 fbRequestMsg: message }, 
               function (submission) { pending(submission); addPendingButton(); }
        );
      }
    }
  );
}

function view(submission) {
  var rqTime = new Date(submission.fbRequestTime);
  var rpTime = new Date(submission.fbResponseTime);

  if (!submission.feedbackSeen) { var classBlink = "blink"; } 
  else { var classBlink = " "; }

	var button = $("<a></a>")
	 	  .attr("href","feedback?subId=" + submission.id)
		  .attr("target","_blank")
		  .attr("type","button")
		  .addClass("btn btn-sm btn-success " + classBlink)
		  .text("View").click(
        function () {
			    if(submission.feedbackSeen == false){
				    $.post("/submission/update", 
                   {id: submission.id, feedbackSeen: true}, 
                   function (submission) {
					           unseenFeedback = unseenFeedback - 1;
					           if (unseenFeedback == 0) { $("#unseenFeedbackButton").remove(); }
					           view(submission);
				           }
            );
		 	    }
		    }
      );
  $("#subReq" + submission.id).empty().append(button);
}

function resizeWindow() {
  $('.scrollableAccordian').height("800px");
	var height = $(document).height();
	var height = height - 100;
	if ( $(window).width() > 990 ) {
	  $('.scrollableAccordian').height(height);
	} else {
   	$('.scrollableAccordian').height("400px");
	}
}

function submitFoldersReload(folderid) {
	//reload accordian folder for a single folder (ie after you make a submission within it)
	var accordianFolderName = "accoridanFolder" + folderid;
	$("#" + accordianFolderName).empty();
	var earnedPointsDiv = "#earned-" +accordianFolderName;
	$(earnedPointsDiv).empty().append(0);
	$.post("/problem/read", 
    {folder: curProblem.folder, phase: 2, pretendStudent:pretendStudent}, 
    function (problems) {
		  problems.forEach( 
        function (problem) {
		      var link = addProblemToAccordian(problem, accordianFolderName);
		  	  $("#" + accordianFolderName).append(link);
		    }
      );
	  }
  );
}

function foldersReload() {
  $("#folderAccordion").empty();
  $.post("/folder/read", {}, 
         function (folders) { 
           folders.forEach( function (folder) { addFolder(folder); } );
	       }
  );
  if(curProblem) { addProbInfo(curProblem); }
}

function updateScore(){
  $.post("/setting/read/", {name: "points"}, 
         function(setting){
	         points = setting.value;
           $.post("/user/read/", {me: true}, 
                  function(user) {
			              $("#grade").empty().append("0" + " / " + points);
	    	            if($.isNumeric(user.currentScore)){ 
				              $("#grade").empty().append(user.currentScore + " / " + points);
			                }
                    else { //if first log in
                      $.post("/user/updateScore/", {currentScore:"0"}, 
                             function(user){ }
                      );
			              }
	                }
           );
         }
  );
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
	$("#grade").empty().append('<span class="glyphicon glyphicon-refresh spin"></span>');
    $("#studentScoreButton").empty().append('<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>');
    $.post("/submission/read/", {currentUser: true}, function(submissions){
        var totalSubmissionNumber = submissions.length;
        var submissionCount = 0;
        var called = false; //make sure the update only gets called once.
        $.post("/folder/read", {}, function (folders) {
            var studScore = 0;
            folders.forEach( function (folder) {
                $.post("/problem/read", {folder: folder.id, phase: 2, pretendStudent:pretendStudent}, function (problems) {
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

	submissions.forEach( function (submission) {
		if(parseFloat(submission.value.style + submission.value.correct) >= parseFloat(highestStyle + highestCorrect)){
			highestStyle = submission.value.style;
			highestCorrect = submission.value.correct;
		}
	});

	$("#highestPtCorrect").empty().append(highestCorrect);
	$("#highestPtStyle").empty().append(highestStyle);

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

function makeMiniBar(){
  if($("#miniBarIcon").hasClass('glyphicon-resize-small')) {
    $("#miniBarIcon").removeClass('glyphicon-resize-small');
  }
  $("#miniBarIcon").addClass('glyphicon-resize-full');

	$("#test").css("width","24%");
	$("#initSubmit").css("width","24%");
	$("#reload").css("width","24%");
	$("#save").css("width","23%");
	$("#test").html('<span class="glyphicon glyphicon-play"  ></span>');
	$("#initSubmit").html('<span class="glyphicon glyphicon-send" ></span>');
	$("#reload").html('<span class="glyphicon glyphicon-open" ></span>');
	$("#save").html('<span class="glyphicon glyphicon-floppy-disk" ></span>');
	$("#test").attr("data-toggle","tooltip");
	$("#reload").attr("data-toggle","tooltip");
	$("#submitButtonTooltip").attr("data-toggle","tooltip");
    ////
	$("#highestScoreLabel").html(
     '<span class="glyphicon glyphicon-pushpin" data-toggle="tooltip" '+
     'data-placement="top" title="Best Score" style="padding-right:6px"></span>'
   );
	$("#highestFuntionalityLabel").html("");
	$("#highestStyleLabel").html("");
	$("#highestScoreLabel").css("float","left");
	$("#highestCorrectDiv").css("float","left");
	$("#highestStyleDiv").css("float","left");
	$("#highestCorrectDiv").css("margin-left","3px");
	$("#highestStyleDiv").css("margin-left","3px");
	$("#pointbreakdown").css("height","auto");
	$("#pointbreakdown").css("padding-top","9px");
	$("#pointbreakdown").css("padding-bottom","9px");
	////
	$("#recentScoreLabel").html('<span class="glyphicon glyphicon-time" data-toggle="tooltip" data-placement="top" ' +
                              'title="Most Recent Score" style="padding-right:6px"></span>');
	$("#recentFuntionalityLabel").html("");
	$("#recentStyleLabel").html("");
	$("#recentScoreLabel").css("float","left");
	$("#recentCorrectDiv").css("float","left");
	$("#recentStyleDiv").css("float","left");
	$("#recentCorrectDiv").css("margin-left","3px")
	$("#recentStyleDiv").css("margin-left","3px")
	$("#recentpointbreakdown").css("height","auto");
	$("#recentpointbreakdown").css("padding-top","9px");
	$("#recentpointbreakdown").css("padding-bottom","9px");
    ///
	$("#fontSizeLabel").addClass("hidden");
	$("#fontSizeBox").css("height","auto");
	$("#fontSizeBox").css("padding","2px");
    $('[data-toggle="tooltip"]').tooltip()
    $('.sidebarBuddy button').tooltip('enable');
    $('#submitButtonTooltip').tooltip('enable');
}

function makeFullBar(){
  if($("#miniBarIcon").hasClass('glyphicon-resize-full')) {
    $("#miniBarIcon").removeClass('glyphicon-resize-full');
  }
  $("#miniBarIcon").addClass('glyphicon-resize-small');

	$("#test").css("width","49%");
	$("#initSubmit").css("width","49%");
	$("#reload").css("width","49%");
	$("#save").css("width","49%");
	$("#test").html("Test Locally");
	$("#reload").html("Reload Last");
	$("#save").html("Save");
	$("#initSubmit").html("Submit for Score");
	$("#test").removeAttr("data-toggle");
	$("#reload").removeAttr("data-toggle");
	$("#submitButtonTooltip").removeAttr("data-toggle");

	////
	$("#highestScoreLabel").html("Highest Score:<br/>");
	$("#highestFuntionalityLabel").html("Functionality");
	$("#highestStyleLabel").html("Style");
	$("#highestScoreLabel").css("float","auto");
	$("#highestCorrectDiv").css("float","auto");
	$("#highestStyleDiv").css("float","auto");
	$("#highestCorrectDiv").css("margin-left","0px");
	$("#highestStyleDiv").css("margin-left","0px");
	$("#pointbreakdown").css("height","75px");
	$("#pointbreakdown").css("padding-top","auto");
	$("#pointbreakdown").css("padding-bottom","auto");
	////
	$("#recentScoreLabel").html("Most Recent Score:<br/>");
	$("#recentFuntionalityLabel").html("Functionality");
	$("#recentStyleLabel").html("Style");
	$("#recentScoreLabel").css("float","auto");
	$("#recentCorrectDiv").css("float","auto");
	$("#recentStyleDiv").css("float","auto");
	$("#recentCorrectDiv").css("margin-left","0px");
	$("#recentStyleDiv").css("margin-left","0px");
	$("#recentpointbreakdown").css("height","75px");
	$("#recentpointbreakdown").css("padding-top","auto");
	$("#recentpointbreakdown").css("padding-bottom","auto");
	///
	$("#fontSizeLabel").removeClass("hidden");
	$("#fontSizeBox").css("height","75px");
	$("#fontSizeBox").css("padding","auto");
    $('.sidebarBuddy button').tooltip('disable');
    $('#submitButtonTooltip').tooltip('disable');

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


    $('[data-toggle="tooltip"]').tooltip()


    updateScore();

    if (miniBar) { makeMiniBar(); } else { makeFullBar(); }

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

  $("#vidModal").on('hide.bs.modal', function (e) {
     $("#vidModal iframe").attr("src", $("#vidModal iframe").attr("src"));
  })

	$('#submitRequestModal').on('shown.bs.modal', function (e) {
		requestModalEditor.refresh();
	})

	$('#pendingRequestModal').on('shown.bs.modal', function (e) {
		modalEditor.refresh();
	})

	$('#loadSubmissionModal').on('shown.bs.modal', function (e) {
		reloadEditor.refresh();
	})

  $('.vidButton').click(function(){
     var src = $(this).attr('src'); 
     $('#vidModal video').attr('src', src);
     $('#vidPanel video').attr('src', src);
     $("#vidModal").draggable({
       handle: ".modal-header"
     });
  });
	
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

	$("#save").click(function () {
     var code = editor.getValue();
     $.post("/user/saveCode", {code: code}, function(user) {
       	console.log("savecode");
       	var save = $("#save").width();
       	console.log(save);
       	$("#save").empty().append('<span class="glyphicon glyphicon-floppy-saved" aria-hidden="true"></span>');
       	setTimeout(function() {
       		if(miniBar == true){
       			$("#save").empty().append('<span class="glyphicon glyphicon-floppy-disk" aria-hidden="true"></span>');
       		}else {
       			$("#save").empty().append('Save');
       		}
    	},2000);

    });
	});

	$( "#fontSize" ).change(function() {
	    var str = "";
		$( "select option:selected" ).each(function() {
			str += $( this ).text() + " ";
		});
		changeFontSize(parseInt(str));
	});
	
	$("#submit").click(function () {
	  if (curProblem == null) {
			alert("You must select a problem before submitting");
		} else {
			$("#console").empty();
			var code = editor.getValue();
			try {
				if(curProblem.language == "javascript"){
					var AST = acorn.parse(code);    // return an abstract syntax tree structure
          // return analysis of style grading by checking AST
					var ssOb = pnut.collectStructureStyleFacts(AST);    
				} else {
					var ssOb = {'null':'null'};
				}
				$.post("/submission/create", 
          {problem:curProblem.id, code:code, style:JSON.stringify(ssOb)}, 
          function (submission) {
					  $("#reload").removeAttr("disabled");
					  addSubmission(submission);
					  if(!isNull(curProblem.maxSubmissions)){
					    limitCheck(submission,curProblem);
					  }
					  submitFoldersReload(curProblem.folder);
					  $.post("/submission/read/" + curProblem.id, 
              {currentUser: true}, 
              function (submissions) {
						    setHighestScore(submissions,curProblem);	
					    }
            );
					  setRecentScore(submission.value.correct, submission.value.style);
					  setConsoleResultMessage(submission.message);
					  studentScore();
				  }
        );
			} catch (e) {
				alert("Parsing Analysis Exception");
				$("#console").append(
          "Did you test your code locally? You might have a syntax error."
        );
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

	$('#accDoneShow').on('click', function() {
	  if($("#accDoneShowIcon").hasClass('glyphicon-circle-arrow-up')) {
	     $("#accDoneShowIcon").removeClass('glyphicon-circle-arrow-up');
	     $("#accDoneShowIcon").addClass('glyphicon-circle-arrow-down');
	     $('.panel-success').addClass('hidden');
	  } else {
	     $("#accDoneShowIcon").removeClass('glyphicon-circle-arrow-down');
	     $("#accDoneShowIcon").addClass('glyphicon-circle-arrow-up');
	     $('.panel-success').removeClass('hidden');
	  }
	  return false;
	});

	$('#miniBar').on('click', function() {
	  if($("#miniBarIcon").hasClass('glyphicon-resize-small')) {
	     $("#miniBarIcon").removeClass('glyphicon-resize-small');
	     $("#miniBarIcon").addClass('glyphicon-resize-full');
	     makeMiniBar();
	     miniBar = true;
	  } else {
	     $("#miniBarIcon").removeClass('glyphicon-resize-full');
	     $("#miniBarIcon").addClass('glyphicon-resize-small');
	     makeFullBar();
	     miniBar = false;
	  }
	  return false;
	});

	resizeWindow();
	editor.refresh();
	$( window ).resize( function(){ resizeWindow(); editor.refresh(); } );

	$('#expandSidebarIn').on('click', function() {
	  if($("#leftSidebar").hasClass('col-md-3')) { // 3 and 9
	     $("#leftSidebar").removeClass('col-md-3').addClass('col-md-2');
	     $("#right-side").removeClass('col-md-9').addClass('col-md-10');
	  } else if($("#leftSidebar").hasClass('col-md-4')){
	     $("#leftSidebar").removeClass('col-md-4').addClass('col-md-3');
	     $("#right-side").removeClass('col-md-8').addClass('col-md-9');
	     $("#expandSidebarOut").removeClass('hidden');
	  } else if($("#leftSidebar").hasClass('col-md-5')){
	     $("#leftSidebar").removeClass('col-md-5').addClass('col-md-4');
	     $("#right-side").removeClass('col-md-7').addClass('col-md-8');
	     $("#expandSidebarOut").removeClass('hidden');
	  } else if($("#leftSidebar").hasClass('col-md-6')){
	     $("#leftSidebar").removeClass('col-md-6').addClass('col-md-5');
	     $("#right-side").removeClass('col-md-6').addClass('col-md-7');
	     $("#expandSidebarOut").removeClass('hidden');
	  } else if($("#leftSidebar").hasClass('col-md-7')){
	     $("#leftSidebar").removeClass('col-md-7').addClass('col-md-6');
	     $("#right-side").removeClass('col-md-5').addClass('col-md-6');
	     $("#expandSidebarOut").removeClass('hidden');
	  } else if($("#leftSidebar").hasClass('col-md-8')){
	     $("#leftSidebar").removeClass('col-md-8').addClass('col-md-7');
	     $("#right-side").removeClass('col-md-4').addClass('col-md-5');
	     $("#expandSidebarOut").removeClass('hidden');
	  } else if($("#leftSidebar").hasClass('col-md-2')){
	     $("#leftSidebar").removeClass('col-md-2').addClass('leftSidebarClosed');
	     $("#right-side").removeClass('col-md-10').addClass('container-fluid');
	     $("#expandSidebarIn").addClass('hidden');
	     $("#folderAccordion").addClass('hidden');
	     $("#accShow").addClass('hidden');
	  }
	  setTimeout(function(){editor.refresh();},10);
	  return false;
	});

	$('#expandSidebarOut').on('click', function() {
	  if($("#leftSidebar").hasClass('col-md-3')) {
	     $("#leftSidebar").removeClass('col-md-3').addClass('col-md-4');
	     $("#right-side").removeClass('col-md-9').addClass('col-md-8');
	     //$("#expandSidebarOut").addClass('hidden');
	  } else if($("#leftSidebar").hasClass('col-md-4')) {
	     $("#leftSidebar").removeClass('col-md-4').addClass('col-md-5');
	     $("#right-side").removeClass('col-md-8').addClass('col-md-7');
	     //$("#expandSidebarOut").addClass('hidden');
	  } else if($("#leftSidebar").hasClass('col-md-5')) {
	     $("#leftSidebar").removeClass('col-md-5').addClass('col-md-6');
	     $("#right-side").removeClass('col-md-7').addClass('col-md-6');
	     //$("#expandSidebarOut").addClass('hidden');
	  } else if($("#leftSidebar").hasClass('col-md-6')) {
	     $("#leftSidebar").removeClass('col-md-6').addClass('col-md-7');
	     $("#right-side").removeClass('col-md-6').addClass('col-md-5');
	     //$("#expandSidebarOut").addClass('hidden');
	  } else if($("#leftSidebar").hasClass('col-md-7')) {
	     $("#leftSidebar").removeClass('col-md-7').addClass('col-md-8');
	     $("#right-side").removeClass('col-md-5').addClass('col-md-4');
	     $("#expandSidebarOut").addClass('hidden');
	  } else if($("#leftSidebar").hasClass('col-md-2')){
	     $("#leftSidebar").removeClass('col-md-2').addClass('col-md-3');
	     $("#right-side").removeClass('col-md-10').addClass('col-md-9');
	     $("#expandSidebarIn").removeClass('hidden');
	  } else {
	     $("#leftSidebar").removeClass('leftSidebarClosed').addClass('col-md-2');
	     $("#right-side").removeClass('container-fluid').addClass('col-md-10');
	     $("#expandSidebarIn").removeClass('hidden');
	     $("#folderAccordion").removeClass('hidden');
	     $("#accShow").removeClass('hidden');
	  }
	  setTimeout(function(){editor.refresh();},10);
	  return false;
	});

	if($("#adminToggle").length != 0 ){
		$("#adminToggle").click(function (event) {
			if(pretendStudent == true){
				alert("You are now in the admin view, meaning you can see Test Mode" +
              " problems. Click here again to toggle back to student view.")
				pretendStudent = false;
			}else {
				alert("You are now in the student view, meaning you cannot see Test Mode" +
              " problems. Click here again to toggle back to admin view.")
				pretendStudent = true;
			}
			foldersReload();
        });

	}

};



