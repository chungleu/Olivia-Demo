
$(document).ready(function() {
	//Initiate windows display
	$('.chat').slideToggle(0);
	$('.chat-message-counter').fadeToggle(300);
	
	//Hide or Show conversation chat box
	var sliderAngle = 0;
	$('#chatHeader').on('click', function() {
		$('#loader').attr("class", 'loading-wrapper hide');
		$('.chat').slideToggle(300, 'swing');
		$('.chat-message-counter').fadeToggle(300, 'swing');		

		sliderAngle += 180;        
		$("#sliderImg").css({
	        "-webkit-transform": "rotate("+sliderAngle+"deg)",
	        "-moz-transform": "rotate("+sliderAngle+"deg)",
	        "transform": "rotate("+sliderAngle+"deg)"
	    });
	});

	//Close chat box
	$('#chat-close').on('click', function(e) {
		e.preventDefault();
		$('#live-chat').fadeOut(100);
	});	
	
	//Expand or Collapse admin panel
	var adminAngle = 0;
	$('#adminPanelBtn').on('click', function(e) {
		adminAngle += 180;        
		$("#adminPanelBtn").css({
	        "-webkit-transform": "rotate("+adminAngle+"deg)",
	        "-moz-transform": "rotate("+adminAngle+"deg)",
	        "transform": "rotate("+adminAngle+"deg)"
	    });
		
		if($("#adminPanelBtn").hasClass("unfolded")){
        	$('#adminPanel').fadeToggle(0);	
        	$('#navBar').fadeToggle(0);	
	        $('#live-chat').animate({ width: 300 });
	        $('#textInput').animate({ width: 245 });	
			$("#adminPanelBtn").removeClass("unfolded");				
		}
		else{
	        $('#live-chat').animate({ width: 700 }, function(){	
	        	$('#adminPanel').fadeToggle(500);	
	        	$('#navBar').fadeToggle(500);	
	        });	
	        $('#textInput').animate({ width: 640 });
			$("#adminPanelBtn").addClass("unfolded");			
		}
	});	
});


$(document).on('click', "#navBar ul li", function() { 
	$('li').removeClass();
	$(this).addClass("active");

	var elementID = $(this).attr('id');
	if(!$('#intent0').is(':empty') || elementID != 'intents'){		
		$('.admin-panel-bg').fadeOut(500, function(){
			$('.edit-box').fadeOut(0);
			$('#editBox'+elementID).fadeIn(0);
		});			
	}
	else{
		$('#editBox'+elementID).fadeOut(500, function(){
			$('.edit-box').fadeOut(0);
			$('.admin-panel-bg').fadeIn(0);
		});					
	};
	
	
});

/*
$(document).on('click', ".choice", function(i) { 
	$('.select').each(function(){
	     $(this).removeClass("choice").addClass("cross");
	});

    $(this).removeClass("cross").addClass("pass");
});
*/

$(document).on('click', "#elmChoice", function() {  
	//Send value of the clicked intent/entity element
    Api.sendRequest(this.innerHTML);   
    
    //Remove the #elmChoice id so the user can't click on them a second time
    $(".intent-choice").removeAttr('id');
    $(".entity-choice").removeAttr('id');
    $("#scrollingChat").scrollTop($("#scrollingChat")[0].scrollHeight);
});


$(document).on('click', "#knowMore", function() { 
	var redirectUrl = $(this).attr('url');
	$("#ansFrame").attr('src',redirectUrl);
});