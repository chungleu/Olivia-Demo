// The Panels module is designed to hold functions
// that are used in Api.js to display answer elements
// and Admin panel options

var Panels = (function() {
  // Publicly accessible methods defined
  return {
	  formatAnswer: formatAnswer,
	  setProgress: setProgress
  };

  // A function that runs a for each loop on a List, running the callback function for each one
  function formatAnswer(parsedRes) {
  	if(parsedRes.context.ext_url){
  		var targetUrl = parsedRes.context.ext_url+'#'+parsedRes.context.anchor
  		$("#ansFrame").attr('src',targetUrl);
  	};
  	
  	$("#editEntities").html('');
  	//Reset detected intent & entities panels
  	$('.select').each(function(){
  	     $(this).removeClass().addClass("select choice");
  	});
  	
  	if(parsedRes.intents.length > 0 && $('#intents').hasClass("active")){
  	  	$('.admin-panel-bg').fadeOut(500, function(){
  	  		$('#editBoxintents').fadeIn(0);
  	  	  	for(var i=0; i<3; i++){
  	  	  		var intentName = parsedRes.intents[i].intent.substring(7, parsedRes.intents[i].intent.length).replace(/_/g,"'").replace(/\../g," ").replace(/--/g,"/");
  	  	  		var intentConfidence = parsedRes.intents[i].confidence.toFixed(2)*100;
  	  	  		
  	  	  		$("#intent"+i).html("Intent "+i+" : "+intentName);
  	  	  		$("#confidence"+i).html(intentConfidence.toFixed(0)+'%');
  	  	  		
  	  	  		//Set the progress Bar
  	  	  		setProgress(intentConfidence.toFixed(0), $("#progressBar"+i));
  	  	  	};  	  	  	
  	  	});  	  			
  	};
  	
  	if(parsedRes.entities.length > 0){
	  	for(var i=0; i<parsedRes.entities.length; i++){
	  		$("#editEntities").append('<span class="detectedEnts">'+parsedRes.entities[i].value+'</span>')
	  	};
  	}
  	else{
  		$("#editEntities").html('<span class="detectedEnts">None</span>');
  	}
  };
  
  
  // Change progress bars value
  function setProgress(percent, $element) {
	    var progressBarWidth = percent * $element.width() / 100;
	    $element.find('div').animate({ width: progressBarWidth }, 500).html(percent + "% ");
	};
  
}());
