// The appSettings getters/setters are defined here to prevent internal methods
// from calling the methods without any of the callbacks that are added elsewhere.

var global = (function() {
  var appSettings = {
		  user : {
			  id : 'Default User'
		  },
		  triggers : {
			  high : 0.70,
			  medium : 0.60,
			  low : 0.4
		  },
		  iframeUrl : ''
  };

  // Publicly accessible methods defined
  return {
    getSettings: function() {
      return appSettings;
    },
    
    setSettings: function(newSetting) {
    	appSettings = newSetting;
      }
  };
  
}());
