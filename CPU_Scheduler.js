// Global Variables
var processObject;
var selectedAlgorithm;
var numOfRows = 1;
var quantumVisible = false;
var priorityVisible = false;

// Not used
var interface = {
	selectedAlgorithm: 0,
	quantumVisible: false,
	priorityVisible: false,

	processArray: [
		{p: 1, ms: 24},
		{p: 2, ms: 3},
		{p: 3, ms: 3}
	],

	getTotalTime: function() {
		var total = 0, element;
		for (element in this.processArray) {
			total += this.processArray[element]['ms'];
		}
		return total;
	}
};

////////////////////////////////////////////////////////////////////////////////

// This function executes once the page finishes loading
$(function() {
	processObject = [{p: 1, ms: 24},
					 {p: 2, ms: 3},
					 {p: 3, ms: 3}];
//				processObject = [{p:2,ms:1},{p:1,ms:1}]
	generateGantt(processObject);

	quantumSpinner = $("#quantumSpinner").spinner();

	// jQuery UI for the spinner
	processSpinner = $("#processSpinner").spinner({
		// Prevent spinner from being less than 1
		spin: function(event, ui) {
			if (ui.value < 1) {
				$(this).spinner("value", 1);
				return false;
			}
			generateInput(ui.value);
		}
	});
	// Manual input for the spinner
	processSpinner.on('keyup', function(e) {
		var input = processSpinner.spinner('value');
		if (input < 1) { // Error with typed input
			processSpinner.parent().css('border-color', 'red');
			return;
		}
		processSpinner.parent().css({'border-color': '#c5c5c5'});
		generateInput(input);
	});
	// Set initial value for the spinner
	processSpinner.spinner('value', 1);

	function onProcessSpinnerChange(input) {
		processSpinner.parent().css({'border-color': '#c5c5c5'});
		generateInput(input);
	}

////////////////////////////////////////////////////////////////////////////////

	// jQuery UI for the algorithm combo box
	var algorithmComboBox = $("#algorithm").selectmenu({
		change: function(event, data) {
			selectedAlgorithm = data.item.index;
			onAlgorithmComboBoxChange();
		}
	});
	// Allow the combo box to be changed by scrolling up and down
	algorithmComboBox.next().on('mousewheel', function(event) {
		selectedAlgorithm = algorithmComboBox[0].selectedIndex

		if (event.deltaY < 0 && selectedAlgorithm < 3) { // Scroll down
			algorithmComboBox[0].selectedIndex += 1
			selectedAlgorithm += 1
			algorithmComboBox.selectmenu('refresh')
		} else if (event.deltaY > 0 && selectedAlgorithm > 0) { // Scroll Up
			algorithmComboBox[0].selectedIndex -= 1
			selectedAlgorithm -= 1
			algorithmComboBox.selectmenu('refresh')
		}

		onAlgorithmComboBoxChange();
		// Used for debugging
//					$('#title').text(e.deltaY + ' ' + $('#algorithm')[0].selectedIndex)
	});

});

function showQuantumSpinner() {
	$('#quantum').css({
		'display': 'inline'
	});
	quantumVisible = true;
}

function hideQuantumSpinner() {
	$('#quantum').css({
		'display': 'none'
	});
	quantumVisible = false;
}

function showPriorityColumn() {
	$('.priority').css({
		'display': 'table-cell'
	});
	priorityVisible = true;
}

function hidePriorityColumn() {
	$('.priority').css({
		'display': 'none'
	});
	priorityVisible = false;
}

function onAlgorithmComboBoxChange() {
	switch(selectedAlgorithm) {
		case 0: // FCFS
			if (priorityVisible) {hidePriorityColumn()}
			if (quantumVisible) {hideQuantumSpinner()}
			break;
		case 1: // SJF
			if (priorityVisible) {hidePriorityColumn()}
			if (quantumVisible) {hideQuantumSpinner()}
			break;
		case 2: // RR
			if (priorityVisible) {hidePriorityColumn()}
			if (quantumVisible) {hideQuantumSpinner()}
			showQuantumSpinner()
			break;
		case 3: // PRI
			if (quantumVisible) {hideQuantumSpinner()}
			showPriorityColumn();
			break;
	}
}

// Not used currently
function generateSubscript(num) {
	var subscript = $('<span></span>').attr({
		'class': 'sub'
	});
	subscript.text(num);
	return subscript;
}

////////////////////////////////////////////////////////////////////////////////

// Regenerate the Gantt Chart on window resize
$(window).resize(function() {
	generateGantt(processObject)
});

////////////////////////////////////////////////////////////////////////////////

function generateGantt(ganttArray) {
	// Clear any previous data
	document.getElementById('gantt').innerHTML = ''

	// Declare variables
	var i, block, leftShift = 0, percent,
		width = $('#gantt').width(),
		len = ganttArray.length,
		totalTime = getTotalTime(ganttArray),
		lowerNumber = 0

	// Loop through each process
	for (i = 0; i < len; i++) {
		percent = ganttArray[i]['ms'] / totalTime;

		// Create the gantt cell and attributes
		block = $('<div></div>').attr({
			'class': "gantt-cell"
		});

		// Add the text for the cell
		block.append('<div class="p">P<span class="sub">' +
					 ganttArray[i]['p'] +
					 '</span></div><div class="lower">' +
					 lowerNumber + '</div>');

		// Add the properties for the size of the cell
		block.css({
			'left': width * leftShift + 'px',
			'width': width * percent + 'px'
		});

		// Add the cell to the page
		$('#gantt').append(block);

		leftShift += percent;
		lowerNumber += ganttArray[i]['ms'];
	}

	// Add last lower right number to the end of the chart
	block = $('<div>' + lowerNumber + '</div>').css({
		'position': 'relative',
		'text-align': 'right',
		'top': '34px'
	});
	$('#gantt').append(block);
}

////////////////////////////////////////////////////////////////////////////////

// Returns the total number of milliseconds
function getTotalTime(processObject) {
	var total = 0
	for(element in processObject) {
		total += processObject[element]['ms']
	}
	return total
}

////////////////////////////////////////////////////////////////////////////////

function generateInput(updatedNumOfRows) {
	// Used for debugging
//				$('#title').text(updatedNumOfRows)
	console.log(updatedNumOfRows + ' ' + numOfRows)
	var i;

	if (updatedNumOfRows > numOfRows) { // Add rows
		for (i = numOfRows; i !== updatedNumOfRows;) {
			i++;
			$('#div-input').append('<div class="div-body" id="p' + i +
				'"><div>P<span class="sub">' + i +
				'</span></div><div><input class="milliseconds"></div><div>?</div><div>?</div><div class="priority"><input></div></div>')
		}
		// Make sure the priority column shows
		if (priorityVisible) {showPriorityColumn()}
	} else if (updatedNumOfRows < numOfRows) { // Remove rows
		for (i = numOfRows; i !== updatedNumOfRows; i--) {
			$('#div-input').children().last().remove();
		}
	}

	numOfRows = updatedNumOfRows;
}

function getInput() {
	var array = [], counter = 1;
	$('.milliseconds').each(function() {
		array.push({p:counter++, ms:Number(this.value)});
	});
	return array;
}
