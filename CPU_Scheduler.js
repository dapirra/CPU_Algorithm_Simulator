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

////////////////////////////////////////////////////////////////////////////////

var GUI = {
	numberOfProcesses: 1,
	selectedAlgorithm: 0,
	quantumVisible: false,
	priorityVisible: false,

	processArray: [
		{p: 1, ms: 1, wt: NaN, tt: NaN}
		/*{p: 1, ms: 24}, {p: 2, ms: 3}, {p: 3, ms: 3}*/
	]
};

// Returns the total number of milliseconds
GUI.getTotalTime = function () {
	var total = 0, element;
	for (element in this.processArray) {
		total += this.processArray[element].ms;
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

GUI.generateGantt = function() {
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
		percent = this.processArray[i].ms / totalTime;

		// Create the gantt cell and attributes
		block = $('<div></div>').attr({
			'class': "gantt-cell"
		});

		// Add the text for the cell
		block.append('<div class="gantt-label">P<span class="sub">' +
					this.processArray[i].p +
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
		lowerNumber += this.processArray[i].ms;
	}

	// Add last lower right number to the end of the chart
	block = $('<div>' + lowerNumber + '</div>').css({
		'position': 'relative',
		'text-align': 'right',
		'top': '34px'
	});
	$('#gantt').append(block);
};

GUI.generateInput = function (updatedNumOfRows) {
	var numOfRows = this.numberOfProcesses, i;

	console.log(updatedNumOfRows + ' ' + numOfRows);

	// Add rows
	if (updatedNumOfRows > numOfRows) {
		for (i = numOfRows; i !== updatedNumOfRows;) {
			i++;
			$('#div-input').append('<div class="div-body" id="p' + i +
				'"><div>P<span class="sub">' + i +
				'</span></div>' +
				'<div><input class="milliseconds"></div>' +
				'<div class="waittime">?</div>' +
				'<div class="turntime">?</div>' +
				'<div class="priority"><input></div>' +
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
	var array = []; // Clear process array
	var counter = 1;
	$('.milliseconds').each(function() {
		array.push({p:counter++, ms:Number(this.value), wt: NaN, tt: NaN});
	});
	this.processArray = array;
	this.numberOfProcesses = array.length;
};

GUI.updateTimes = function () {
	var index = 0, array = this.processArray;
	$('.waittime').each(function () {
		$(this).text(array[index].wt);
//		console.log(array[index].wt)
		index++;
	});
	index = 0;
	$('.turntime').each(function () {
		$(this).text(array[index].tt);
//		console.log(array[index].tt)
		index++;
	});
};

GUI.calcFCFS = function () {
	this.updateProcessArray();

	var element, wt = 0, tt = 0;
	for (element in this.processArray) {
		this.processArray[element].wt = wt;
		tt += this.processArray[element].ms;
		this.processArray[element].tt = tt;
		wt = tt;
	}

	this.updateTimes();
	this.generateGantt();
};

GUI.calcSJF = function () {
	this.updateProcessArray();

	// Sort array based on burst time order
	this.processArray.sort(function (a, b) {
		return a.ms - b.ms;
	});

	var element, wt = 0, tt = 0;
	for (element in this.processArray) {
		this.processArray[element].wt = wt;
		tt += this.processArray[element].ms;
		this.processArray[element].tt = tt;
		wt = tt;
	}

	this.generateGantt();

	// Sort array based on process order
	this.processArray.sort(function (a, b) {
		return a.p - b.p;
	});

	this.updateTimes();
}

GUI.calcWaitAndTurnTime = function () {
	var sum = 0, element;
	for (element in this.processArray) {
		sum += this.processArray[element].wt
	}
	$('#avgwaittime').text(round(sum / this.numberOfProcesses));

	sum = 0;
	for (element in this.processArray) {
		sum += this.processArray[element].tt
	}
	$('#avgturntime').text(round(sum / this.numberOfProcesses));
};

////////////////////////////////////////////////////////////////////////////////

// This function executes once the page finishes loading
$(function () {
	GUI.generateGantt();

	var quantumSpinner = $("#quantumSpinner").spinner();

	// jQuery UI for the spinner
	var processSpinner = $("#processSpinner").spinner({
		// Prevent spinner from being less than 1
		spin: function (event, ui) {
			if (ui.value < 1) {
				$(this).spinner("value", 1);
				return false;
			}
			GUI.generateInput(ui.value);
		}
	});
	// Manual input for the spinner
	processSpinner.on('keyup', function () {
		var input = processSpinner.spinner('value');
		if (input < 1) { // Error with typed input
			processSpinner.parent().css('border-color', 'red');
			return;
		}
		processSpinner.parent().css({'border-color': '#c5c5c5'});
		GUI.generateInput(input);
	});
	// Set initial value for the spinner
	processSpinner.spinner('value', 1);

	function onProcessSpinnerChange(input) {
		processSpinner.parent().css({'border-color': '#c5c5c5'});
		GUI.generateInput(input);
	}

////////////////////////////////////////////////////////////////////////////////

	// jQuery UI for the algorithm combo box
	var algorithmComboBox = $("#algorithm").selectmenu({
		change: function (event, data) {
			GUI.selectedAlgorithm = data.item.index;
			GUI.onAlgorithmComboBoxChange();
		}
	});

	// Allow the combo box to be changed by scrolling up and down
	algorithmComboBox.next().on('mousewheel', function (event) {
		GUI.selectedAlgorithm = algorithmComboBox[0].selectedIndex;

		// Scroll down
		if (event.deltaY < 0 && GUI.selectedAlgorithm < 3) {
			algorithmComboBox[0].selectedIndex += 1;
			GUI.selectedAlgorithm += 1;
			algorithmComboBox.selectmenu('refresh');

		// Scroll Up
		} else if (event.deltaY > 0 && GUI.selectedAlgorithm > 0) {
			algorithmComboBox[0].selectedIndex -= 1;
			GUI.selectedAlgorithm -= 1;
			algorithmComboBox.selectmenu('refresh');
		}
		GUI.onAlgorithmComboBoxChange();
	});

	var randomButton = $('#randomButton').button();

	// Event for when the random button is clicked
	randomButton.click(function (event) {
		event.preventDefault();
		$('.milliseconds').each(function() {
			$(this).val(Math.floor(Math.random() * 10) + 1);
		});
	})
});

// Regenerate the Gantt Chart on window resize
$(window).resize(function() {
	GUI.generateGantt();
});
