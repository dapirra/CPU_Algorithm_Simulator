/*jshint camelcase: true, quotmark: single, undef: true, unused: vars, latedef: nofunc, asi: false, boss: false, laxbreak: false, laxcomma: false, multistr: false, sub: false, supernew: false, browser: true, devel: true, jquery: true, indent: 4*/
// JSHint settings on first line

/*

CPU Scheduler Simulator

Name: David Pirraglia

Professor: Sister Jane Fritz

Class: COM 310

*/

// Not used currently
function generateSubscript(num) {
	return 'P<span class="sub">' + num + '</span>';
}

// Returns true or false depending on weather a number is an int and not a double
function isInt(number) {
	return Math.floor(number) == number;
}

// Rounds a number to 2 decimal places if it's a decimal
function round(number) {
	if (isInt(number)) return number;
	return number.toFixed(2);
}

////////////////////////////////////////////////////////////////////////////////

var GUI = {
	numberOfProcesses: 1,
	selectedAlgorithm: 0,
	quantumValue: 5,
	quantumVisible: false,
	priorityVisible: false,

	processArray: [{
		pid: 1,
		burst: 1,
		waitTime: undefined,
		turnTime: undefined,
		priority: undefined
	}]
};

// Extend the default functionality of the spinner from jQuery UI
function newExtendedSpinner(thisElement, min, startValue, allowDecimal,
						successFunc, isInvalid, warningFunc) {

	if (successFunc === undefined) {
		successFunc = function () {
			GUI.updateGUI();
		};
	}
	if (isInvalid === undefined) {
		isInvalid = function (value) {
			return isNaN(value) || value < min || (allowDecimal ? false : !isInt(value));
		};
	}

	var isError = false;

	var newSpinner = $(thisElement).spinner({
		spin: function (event, ui) {
			var value = ui.value; // Get spinner value
			newSpinner.spinner('value', value); // Prevent spinner from being off by one
			if (isError) { // Reset color
				isError = false;
				newSpinner.parent().css('border', '#c5c5c5 solid 1px');
			}
			successFunc(value);
		},
		min: min
	});
	newSpinner.on('keyup', function () {
		var value = newSpinner.spinner('value'); // Get spinner value

		/*
		// Value is valid
		if (value >= min && value != '' && (allowDecimal ? true : isInt(value))) {
			newSpinner.parent().css('border', '#c5c5c5 solid 1px');
			successFunc(value);

		// Value is invalid
		} else {
			newSpinner.parent().css('border', 'red solid 1px');
			isError = true;
		}
		*/

//		/*
		// Value is invalid
		if (isNaN(value) || value < min || (allowDecimal ? false : !isInt(value))) {
			newSpinner.parent().css('border', 'red solid 1px');
			isError = true;
		// Value is valid
		} else {
			newSpinner.parent().css('border', '#c5c5c5 solid 1px');
			successFunc(value);
		}
//		*/

		/*
		// Value is invalid
		if (isInvalid()) {
			newSpinner.parent().css('border', 'red solid 1px');
			isError = true;
		// Value is not recommended
		} else if (warningFunc !== undefined) {
			warningFunc();
		// Value is valid
		} else {
			newSpinner.parent().css('border', '#c5c5c5 solid 1px');
			successFunc(value);
		}
		*/

		console.log('test: ' + value);
	});
	newSpinner.spinner('value', startValue);
	return newSpinner;
}

// Returns the total number of milliseconds
GUI.getTotalBurstTime = function () {
	var total = 0, element;
	for (element in this.processArray) {
		total += this.processArray[element].burst;
	}
	return total;
};

GUI.showQuantumSpinner = function () {
	$('#quantum').show();
	this.quantumVisible = true;
};

GUI.hideQuantumSpinner = function () {
	$('#quantum').hide();
	this.quantumVisible = false;
};

GUI.showPriorityColumn = function () {
	$('#priorityButton').show();
	$('.priority').css('display', 'table-cell');
	this.priorityVisible = true;
};

GUI.hidePriorityColumn = function () {
	$('#priorityButton').hide();
	$('.priority').hide();
	this.priorityVisible = false;
};

GUI.onAlgorithmComboBoxChange = function () {
	switch (this.selectedAlgorithm) {
		case 0: // FCFS
			if (this.quantumVisible) this.hideQuantumSpinner();
			else if (this.priorityVisible) this.hidePriorityColumn();
			break;
		case 1: // SJF
			if (this.quantumVisible) this.hideQuantumSpinner();
			else if (this.priorityVisible) this.hidePriorityColumn();
			break;
		case 2: // RR
			if (this.priorityVisible) this.hidePriorityColumn();
			this.showQuantumSpinner();
			break;
		case 3: // PRI
			if (this.quantumVisible) this.hideQuantumSpinner();
			this.showPriorityColumn();
			break;
	}
};

GUI.generateGantt = function () {
	// Clear any previous data
	document.getElementById('gantt').innerHTML = '';

	// Declare variables
	var i, block, leftShift = 0, percent,
		width = $('#gantt').width(),
		len = this.processArray.length,
		totalTime = this.getTotalBurstTime(this.processArray),
		lowerNumber = 0;

	// Loop through each process
	for (i = 0; i < len; i++) {
		if (this.processArray[i].burst === 0) continue;

		percent = this.processArray[i].burst / totalTime;

		// Create the gantt cell and attributes
		block = $('<div></div>').attr({
			'class': 'gantt-cell'
		});

		// Add the text for the cell
		block.append('<div class="gantt-label">' +
					generateSubscript(this.processArray[i].pid) +
					'</div><div class="lower">' +
					lowerNumber + '</div>');

		// Add the properties for the size of the cell
		block.css({
			'left': width * leftShift + 'px',
			'width': width * percent + 'px'
		});

		// Add the cell to the page
		$('#gantt').append(block);

		leftShift += percent;
		lowerNumber += this.processArray[i].burst;
	}

	// Add last lower right number to the end of the chart
	block = $('<div>' + lowerNumber + '</div>').css({
		'position': 'relative',
		'text-align': 'right',
		'top': '34px'
	});
	$('#gantt').append(block);
};

GUI.generateRows = function (updatedNumOfRows) {
	var numOfRows = this.numberOfProcesses, i;

	if (updatedNumOfRows > numOfRows) { // Add rows
		for (i = numOfRows; i < updatedNumOfRows;) {
			i++;
			$('#div-input').append('<div class="div-row" id="p' + i +
				'"><div>' + generateSubscript(i) + '</div>' +
				'<div><input class="milliseconds" type="text" value="1"></div>' +
				'<div class="waittime">?</div>' +
				'<div class="turntime">?</div>' +
				'<div class="priority"><input type="text" class="priority-input" value="0"></div>' +
				'</div>');

			// Events for the spinners
			newExtendedSpinner($('#p' + i + ' .milliseconds'), 1, 1, true);
			newExtendedSpinner($('#p' + i + ' .priority-input'), 0, 0, false);
		}
		// Make sure the priority column shows
		if (this.priorityVisible) this.showPriorityColumn();

	} else if (updatedNumOfRows < numOfRows) { // Remove rows
		for (i = numOfRows; i > updatedNumOfRows; i--) {
			$('#div-input').children().last().remove();
		}
	}

	this.numberOfProcesses = updatedNumOfRows;
};

GUI.updateProcessArray = function () {
	var array = [], counter = 1;
	$('.milliseconds').each(function () {
		array.push({
			pid: counter++,
//			burst: Number(this.value),
			burst: $(this).spinner('value'),
			waitTime: undefined,
			turnTime: undefined,
//			priority: GUI.priorityVisible ? $(this).parent().siblings().last().children().first().val() : undefined
			priority: GUI.priorityVisible ? $(this).parent().parent().siblings().last().children().children().spinner('value') : undefined
		});
	});
	this.processArray = array;
	this.numberOfProcesses = array.length;
};

GUI.updateTableWaitAndTurnTimes = function () {
	var index = 0, array = this.processArray;
	$('.waittime').each(function () {
		$(this).text(array[index].waitTime);
		index++;
	});
	index = 0;
	$('.turntime').each(function () {
		$(this).text(array[index].turnTime);
		index++;
	});
};

GUI.calcFCFS = function () {
	// Calculate wait times and turnaround times
	var element, waitTime = 0, turnTime = 0;
	for (element in this.processArray) {
		this.processArray[element].waitTime = waitTime;
		turnTime += this.processArray[element].burst;
		this.processArray[element].turnTime = turnTime;
		waitTime = turnTime;
	}

	this.generateGantt();
};

GUI.calcSJF = function () {
	// Sort array based on burst time order
	this.processArray.sort(function (a, b) {
		return a.burst - b.burst;
	});

	// Calculate wait times and turnaround times
	var element, waitTime = 0, turnTime = 0;
	for (element in this.processArray) {
		this.processArray[element].waitTime = waitTime;
		turnTime += this.processArray[element].burst;
		this.processArray[element].turnTime = turnTime;
		waitTime = turnTime;
	}

	this.generateGantt();

	// Sort array based on process order
	this.processArray.sort(function (a, b) {
		return a.pid - b.pid;
	});
};

GUI.calcRR = function () {
	var processString = JSON.stringify(this.processArray);
	var processArrayBackup = JSON.parse(processString); // Store wait + turn around time
	var processArrayClone = JSON.parse(processString); // Delete elements until empty
	var i, j, currentTime = 0, currentBurst, currentPid, currentIndex, turnTime;
	var ganttArray = [];

	// Calculate turn times and Gantt Chart appearence
	while (processArrayClone.length !== 0) {
		for (i = 0; i < processArrayClone.length; i++) {
			currentIndex = processArrayClone[i].pid - 1;
			processArrayBackup[currentIndex].waitTime = 0; // Initiate this to 0
			currentBurst = processArrayClone[i].burst;
			// Add a new element to the Gantt array and remove it from the cloned array
			if (currentBurst <= this.quantumValue) {
				ganttArray.push(processArrayClone[i]);
				currentTime += currentBurst;
				processArrayBackup[currentIndex].turnTime = currentTime;
				processArrayClone.splice(i, 1); // Delete element
				i--; // Move i back one, since an object was just deleted
			} else { // Subtract the burst time from the current element
				processArrayClone[i].burst -= this.quantumValue;
				currentTime += this.quantumValue;
				ganttArray.push({
					pid: processArrayClone[i].pid,
					burst: this.quantumValue,
				});
			}
		}
	}

	// Calculate wait times
	for (i = 0; i < processArrayBackup.length; i++) { // Loop through each row on table
		currentTime = 0;
		currentPid = processArrayBackup[i].pid;
		turnTime = processArrayBackup[i].turnTime;
		for (j = 0; j < ganttArray.length; j++) { // Loop through Gantt chart values
			currentBurst = ganttArray[j].burst;
			if (ganttArray[j].pid !== currentPid && currentTime < turnTime) {
				processArrayBackup[i].waitTime += currentBurst;
			}
			currentTime += currentBurst;
		}
	}

	this.processArray = ganttArray;
	this.generateGantt();

	// Restore original version of the processArray
	this.processArray = processArrayBackup;
};

GUI.calcPRI = function () {
	// Sort array based on priority order
	this.processArray.sort(function (a, b) {
		return a.priority - b.priority;
	});

	// Calculate wait times and turnaround times
	var element, waitTime = 0, turnTime = 0;
	for (element in this.processArray) {
		this.processArray[element].waitTime = waitTime;
		turnTime += this.processArray[element].burst;
		this.processArray[element].turnTime = turnTime;
		waitTime = turnTime;
	}

	this.generateGantt();

	// Sort array based on process order
	this.processArray.sort(function (a, b) {
		return a.pid - b.pid;
	});
};

GUI.calcAvgWaitAndTurnTime = function () {
	var sum = 0, element;
	for (element in this.processArray) {
		sum += this.processArray[element].waitTime;
	}
	$('#avgwaittime').text(round(sum / this.numberOfProcesses));

	sum = 0;
	for (element in this.processArray) {
		sum += this.processArray[element].turnTime;
	}
	$('#avgturntime').text(round(sum / this.numberOfProcesses));
};

GUI.updateGUI = function () {
	this.updateProcessArray();
	switch (this.selectedAlgorithm) {
		case 0: // FCFS
			this.calcFCFS();
			break;
		case 1: // SJF
			this.calcSJF();
			break;
		case 2: // RR
			this.calcRR();
			break;
		case 3: // PRI
			this.calcPRI();
			break;
	}
	this.updateTableWaitAndTurnTimes();
	this.calcAvgWaitAndTurnTime();
};

////////////////////////////////////////////////////////////////////////////////

// This function executes once the page finishes loading
$(function () {
	GUI.generateGantt();

	// Create the quantum spinner
	newExtendedSpinner($('#quantumSpinner'), 1, 5, true, function (value) {
		GUI.quantumValue = value;
		GUI.updateGUI();
	});

	// Create the process spinner
	newExtendedSpinner($('#processSpinner'), 1, 1, false, function (value) {
		GUI.generateRows(value);
		GUI.updateGUI();
	});

////////////////////////////////////////////////////////////////////////////////

	// jQuery UI for the algorithm combo box
	var algorithmComboBox = $('#algorithm').selectmenu({
		change: function (event, data) {
			GUI.selectedAlgorithm = data.item.index;
			GUI.onAlgorithmComboBoxChange();
			GUI.updateGUI();
		}
	});

	// Allow the combo box to be changed by scrolling up and down with the mousewheel
	algorithmComboBox.next().on('mousewheel', function (event) {
		GUI.selectedAlgorithm = algorithmComboBox[0].selectedIndex;

		// Scroll down
		if (event.deltaY < 0 && GUI.selectedAlgorithm < 3) {
			algorithmComboBox[0].selectedIndex = ++GUI.selectedAlgorithm;
			algorithmComboBox.selectmenu('refresh');

		// Scroll Up
		} else if (event.deltaY > 0 && GUI.selectedAlgorithm > 0) {
			algorithmComboBox[0].selectedIndex = --GUI.selectedAlgorithm;
			algorithmComboBox.selectmenu('refresh');
		}
		GUI.onAlgorithmComboBoxChange();
		GUI.updateGUI();
	});

	var randomButton = $('#randomButton').button();

	// Event for when the random button is clicked
	randomButton.click(function (event) {
		event.preventDefault();
		$('.milliseconds').each(function() {
			$(this).val(Math.floor(Math.random() * 10) + 1);
		});
		GUI.updateGUI();
	});

	var priorityButton = $('#priorityButton').button();
	priorityButton.click(function (event) {
		event.preventDefault();
		$('.priority-input').each(function() {
			$(this).val(Math.floor(Math.random() * 10) + 1);
		});
		GUI.updateGUI();
	});

	newExtendedSpinner($('.milliseconds'), 1, 1, true);
	newExtendedSpinner($('.priority-input'), 0, 0, false);
});

// Regenerate the Gantt Chart on window resize
$(window).resize(function() {
	GUI.updateGUI();
});
