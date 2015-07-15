var editor;
var editor2;

window.onload = function () {
	editor2 = CodeMirror.fromTextArea(codemirror2, {
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
	
	console.log("submissionId");
	var submissionId = $("#submissionId").html();
	console.log(submissionId);
	$.post("/submission/read/", {subId: submissionId}, function (submission) {
		console.log("submisison Message");

		$("#console").empty().append(submission.message);
		$("#responseTime").empty().append(submission.fbResponseTime);
		$("#responseMsg").empty().append(submission.fbResponseMsg);
    	$.post("/user/read/" + submission.fbResponder, {}, function (user) {
	        if (!user) {
	            alert("No user with that id found");
	            return;
	        }
			$("#responder").empty().append(user.displayName);	
		});

		$("#requestTime").empty().append(submission.fbRequestTime);
		$("#requestMsg").empty().append(submission.fbRequestMsg);

        editor2.setValue(submission.code);
        editor.setValue(submission.fbCode);

	});

};

