// The Upload module is designed to hold functions
// that enable csv file upload and conversion to arrays
// for the server side to analyze and get automated test results

// Converted file and test parameters
var fileParams = {
		arrValue: [],
		triggers: {
			high: '',
			medium: '',
			low: ''
		},
		name: '',
		type:'',
		title:''
	};


$(document).ready(function() {	
	
	// Upload csv file to convert into an array
	$('#fileChooserInput').on('change', function() {
        var reader = new FileReader();
        reader.onload = function () {
        	fileParams.name = fileInput.name;
            fileParams.title = fileInput.name.substr(0, fileInput.name.lastIndexOf('.'));
            fileParams.type = fileInput.name.split('.').pop();
            $('#inputFileName').html(fileParams.name);
            
            $('.upload-description').each(function() {
            	$(this).css('margin','10px 0');
            });
            
            //Setting conversation's confidence levels
            fileParams.triggers.high = $('#triggerHigh').val();
            fileParams.triggers.medium = $('#triggerMedium').val();
            fileParams.triggers.low = $('#triggerLow').val();
            
            fileParams.arrValue = csvToArray(reader.result);	// Convert the csv rows into array
        };        

        // Start reading the file. When it is done, calls the onload event defined above.
        var fileInput = $('#fileChooserInput')[0].files[0];
        reader.readAsBinaryString(fileInput);		
	});
	
	
	// Send converted file and test parameters to the server to analyze
	$('#launchTestBtn').on('click', function() {
		$('#launchTestBtn').fadeOut(300);
		$('#launchTestBg').attr('src', './img/logo/animated/watsonBlack.gif');

		$.ajax({  
			type: "POST",
		    url: "/test/launch",
		    data: JSON.stringify(fileParams),
		    contentType: "application/json",
		    success: function(response) {
			  	$('#launchTestBg').fadeOut(500, function(){	
			  			var total = response.total;
			  			object[0].value = (response.ok/total).toFixed(2)*100;
			  			object[1].value = (response.ok_choice_1/total).toFixed(2)*100;
			  			object[2].value = (response.ok_choice_2/total).toFixed(2)*100;
			  			object[3].value = ((response.ko + response.ko_choice_1 + response.ko_choice_2)/total).toFixed(2)*100;
			  			object[4].value = ((response.ok_low + response.ko_low)/total).toFixed(2)*100;

			  		$("#resultChart").skillset({object:object, duration:80});
			  	});
		   },
		});
	});	

});

// Convert the csv file into array and set up conversion percentage
var csvToArray =  function(csv) {
    var csvRows = csv.split(/\r\n|\n/);
    var arr = [];
    for (var i=0; i<csvRows.length; i++) {
        var data = csvRows[i].split(';');
            var tarr = [];

            for (var j=0; j<data.length; j++) {
                tarr.push(data[j]);
            }            
            arr.push(tarr);        

            // Set the progress bar
            var k = ((i+1)/csvRows.length).toFixed(2)*100
            var percentage = k.toFixed(0);
            $("#inputFilePercentage").html(' '+percentage+'%');
    }

    $('#testParamsPanel').fadeOut(200, function(){
	    $('#launchTest').fadeIn(300);
	});

	return arr;
};



var object = [{
	'headline':'OK Direct : User is prompted with correct answer.',
	value:0,
	'length':100,
	'description':''
	},
	{
	'headline':'OK Choice 1 : User chooses between 2 answers.',
	value:0,
	'length':100,
	'description':''
	},
	{
	'headline':'OK Choice 2 : User chooses between 3 answers.',
	value:0,
	'length':100,
	'description':''
	},
	{
	'headline':'KO : User is prompted with wrong answers.',
	value:0,
	'length':100,
	'description':''
	},
	{
	'headline':'Low : Bot has no answer due to low confidence.',
	value:0,
	'length':100,
	'description':''
	},
];