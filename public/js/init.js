/* eslint no-unused-vars: "off" */

// Other JS files required to be loaded first: apis.js, conversation.js, payload.js
(function() {
  // Initialize all modules
  ConversationPanel.init();
  
  // Set the ifame URL
  var redirectUrl = global.getSettings().iframeUrl;
  $("#ansFrame").attr('src',redirectUrl);
	
  
  // Set the conversation's confidence triggers for test purposes
  var confTriggers = global.getSettings().triggers;
  
  $("#triggerHigh").val(confTriggers.high);
  $("#triggerMedium").val(confTriggers.medium);
  $("#triggerLow").val(confTriggers.low);
})();
