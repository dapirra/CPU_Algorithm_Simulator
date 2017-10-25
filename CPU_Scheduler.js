// Prevent ESLint from complaining
var $;
var window;
var document;
var console;

// Not used currently
function generateSubscript(num) {
	var subscript = $('<span></span>').attr({
		'class': 'sub'
	});
	subscript.text(num);
	return subscript;
}

// Rounds a number to 2 decimal places if it's a decimal
function round(number) {
	if (Math.floor(number) == number) {
		return number;
	} else {
		return number.toFixed(2);
	}
}

// TODO Create a super spinner for all user input values.

////////////////////////////////////////////////////////////////////////////////

var GUI = {
	numberOfProcesses: 1,
	selectedAlgorithm: 0,
	quantumValue: 1,
	quantumVisible: false,
	priorityVisible: false,

	processArray: [{
		pid: 1,
		burst: 1,
		waitTime: undefined,
		turnTime: undefined,
		priority: undefined,

		clone: function () {
			return {
				pid: this.pid,
				burst: this.burst,
				waitTime: this.waitTime,
				turnTime: this.turnTime,
				priority: this.priority
			};
		}
	}]
};

// TODO Determine if I need clone methods
GUI.cloneProcess = function (i) {
	return {
		pid: GUI.processArray[i].pid,
		burst: GUI.processArray[i].burst,
		waitTime: GUI.processArray[i].waitTime,
		turnTime: GUI.processArray[i].turnTime,
		priority: GUI.processArray[i].priority
	};
}

// Returns the total number of milliseconds
GUI.getTotalTime = function () {
	var total = 0, element;
	for (element in this.processArray) {
		total += this.processArray[element].burst;
	}
	return total;
};

GUI.showQuantumSpinner = function () {
	$('#quantum').css({
		'display': 'inline'
	});
	this.quantumVisible = true;
};

GUI.hideQuantumSpinner = function () {
	$('#quantum').css({
		'display': 'none'
	});
	this.quantumVisible = false;
};

GUI.showPriorityColumn = function () {
	$('.priority').css({
		'display': 'table-cell'
	});
	this.priorityVisible = true;
};

GUI.hidePriorityColumn = function () {
	$('.priority').css({
		'display': 'none'
	});
	this.priorityVisible = false;
};

GUI.onAlgorithmComboBoxChange = function () {
	switch (this.selectedAlgorithm) {
		case 0: // FCFS
			if (this.priorityVisible) this.hidePriorityColumn();
			if (this.quantumVisible) this.hideQuantumSpinner();
			break;
		case 1: // SJF
			if (this.priorityVisible) this.hidePriorityColumn();
			if (this.quantumVisible) this.hideQuantumSpinner();
			break;
		case 2: // RR
			if (this.priorityVisible) this.hidePriorityColumn();
			if (this.quantumVisible) this.hideQuantumSpinner();
			this.showQuantumSpinner()
			break;
		case 3: // PRI
			if (this.quantumVisible) this.hideQuantumSpinner();
			this.showPriorityColumn();
			break;
	}
};

GUI.generateGantt = function () {
	// Clear any previous data
	document.getElementById('gantt').innerHTML = ''

	// Declare variables
	var i, block, leftShift = 0, percent,
		width = $('#gantt').width(),
		len = this.processArray.length,
		totalTime = this.getTotalTime(this.processArray),
		lowerNumber = 0

	// Loop through each process
	for (i = 0; i < len; i++) {
		percent = this.processArray[i].burst / totalTime;

		// Create the gantt cell and attributes
		block = $('<div></div>').attr({
			'class': "gantt-cell"
		});

		// Add the text for the cell
		block.append('<div class="gantt-label">P<span class="sub">' +
					this.processArray[i].pid +
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

	// Used for debugging
//	console.log(updatedNumOfRows + ' ' + numOfRows);

	// Add rows
	if (updatedNumOfRows > numOfRows) {
		for (i = numOfRows; i !== updatedNumOfRows;) {
			i++;
			$('#div-input').append('<div class="div-row" id="p' + i +
				'"><div>P<span class="sub">' + i +
				'</span></div>' +
				'<div><input class="milliseconds" type="text"></div>' +
				'<div class="waittime">?</div>' +
				'<div class="turntime">?</div>' +
				'<div class="priority"><input type="text"></div>' +
				'</div>')
		}
		// Make sure the priority column shows
		if (this.priorityVisible) this.showPriorityColumn();

	// Remove rows
	} else if (updatedNumOfRows < numOfRows) {
		for (i = numOfRows; i !== updatedNumOfRows; i--) {
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
			burst: Number(this.value),
			waitTime: undefined,
			turnTime: undefined,
			priority: GUI.priorityVisible ? $(this).parent().siblings().last().children().first().val() : undefined
		});
	});
	this.processArray = array;
	this.numberOfProcesses = array.length;
};

GUI.updateTimes = function () {
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
	this.updateProcessArray();

	// Calculate wait times and turnaround times
	var element, waitTime = 0, turnTime = 0;
	for (element in this.processArray) {
		this.processArray[element].waitTime = waitTime;
		turnTime += this.processArray[element].burst;
		this.processArray[element].turnTime = turnTime;
		waitTime = turnTime;
	}

	this.updateTimes();
	this.generateGantt();
	this.calcAvgWaitAndTurnTime();
};

GUI.calcSJF = function () {
	this.updateProcessArray();

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

	this.updateTimes();
	this.calcAvgWaitAndTurnTime();
}

GUI.calcRR = function () {
	this.updateProcessArray();

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

	this.updateTimes();
	this.calcAvgWaitAndTurnTime();
}

GUI.calcPRI = function () {
	this.updateProcessArray();

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

	this.updateTimes();
	this.calcAvgWaitAndTurnTime();
}

GUI.calcAvgWaitAndTurnTime = function () {
	var sum = 0, element;
	for (element in this.processArray) {
		sum += this.processArray[element].waitTime
	}
	$('#avgwaittime').text(round(sum / this.numberOfProcesses));

	sum = 0;
	for (element in this.processArray) {
		sum += this.processArray[element].turnTime
	}
	$('#avgturntime').text(round(sum / this.numberOfProcesses));
};

GUI.updateGUI = function () {
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
}

////////////////////////////////////////////////////////////////////////////////

// This function executes once the page finishes loading
$(function () {
	GUI.generateGantt();

	var quantumSpinner = $("#quantumSpinner").spinner({
		spin: function (event, ui) {
//			$('#title').text(ui.value); // Used for debugging
			GUI.quantumValue = ui.value;
			GUI.updateGUI();
		}, min: 1
	});
	quantumSpinner.spinner('value', 1);

	var processError = false;

	// jQuery UI for the spinner
	var processSpinner = $("#processSpinner").spinner({
		// Prevent spinner from being less than 1
		spin: function (event, ui) {
			if (ui.value < 1 || typeof ui.value !== 'number') {
				processSpinner.parent().css({'border-color': '#c5c5c5'});
			}
			onProcessSpinnerChange(ui.value);
		}, min: 1
	});
	// Manual input for the spinner
	processSpinner.on('keyup', function () {
		var input = processSpinner.spinner('value');
		if (input < 1) { // Error with typed input
			processSpinner.parent().css('border-color', 'red');
			processError = true;
		} else {
			onProcessSpinnerChange(input);
		}
	});
	// Set initial value for the spinner
	processSpinner.spinner('value', 1);

	function onProcessSpinnerChange(input) {
		if (processError) {
			processSpinner.parent().css({'border-color': '#c5c5c5'});
			processError = false;
		}
		GUI.generateRows(input);
		GUI.updateGUI();
	}

////////////////////////////////////////////////////////////////////////////////

	// jQuery UI for the algorithm combo box
	var algorithmComboBox = $("#algorithm").selectmenu({
		change: function (event, data) {
			GUI.selectedAlgorithm = data.item.index;
			GUI.onAlgorithmComboBoxChange();
			GUI.updateGUI();
		}
	});

	// Allow the combo box to be changed by scrolling up and down
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

	// Event for all the input boxes
	$('.div-row input').on('keyup', function () {
		var value = Number($(this).val());
		if (isNaN(value) || value < 1) {
			$(this).css({
				'border': 'red solid 1px'
			})
		} else {
			$(this).css({
				'border': '#c5c5c5 solid 1px'
			})
		}
	});
});

// Regenerate the Gantt Chart on window resize
$(window).resize(function() {
	GUI.updateGUI();
});
