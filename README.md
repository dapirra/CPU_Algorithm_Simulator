<!--
CPU Scheduler Simulator
Name: David Pirraglia
Professor: Sister Jane Fritz
Class: COM 310
-->

## CPU Scheduler Simulator

### Features:
- Support for FCFS, SJF, RR, and Priority algorithms
- Capable of instantly updating values without having to hit a 'Calculate' button
- Added a random button that added processes between 1-9ms
- Added a random button for priorities as well that generates values between 0-10
- Input boxes have a red border when invalid data is entered
- All input boxes and combo boxes are able to be changed by the mouse wheel
- The table is able to be resized by dragging the bottom right corner
- Added a blue CPU favicon to the page
- Added a customized scrollbar to the table (Only supported in webkit based browsers)
- Used Git to keep track of history

### Warnings:
- This program requires internet access to download libraries and resources
- Be careful not to accidently change the values in the spinners by scrolling the table
	- I recommend keeping the cursor over the wait time and turnaround time columns when scrolling
- The Gantt Chart may not render clearly when the cells become too small
	- This can happen with small quantum values for example
- The table may look smooshed on your computer, just drag the bottom right corner to properly size it
- You can enter decimal values as the burst times, however 1ms is the smallest burst time allowed
