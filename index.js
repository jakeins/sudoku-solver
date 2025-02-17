

const borderStyleThin = "1px solid black";
const borderStyleBold = "3px solid black";

const extainer = document.querySelector("div");

const sampleValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];


function getStyledCellElement(cell) {
	const cellElement = document.createElement("div");
	cellElement.className = "text-center";
	cellElement.style.width = "30px";
	cellElement.style.height = "30px";
	cellElement.style.border = borderStyleThin;
	cellElement.innerText = cell.value ?? "";

	
	// Add bold borders for 3x3 grid separation
	if (cell.rowIndex % 3 === 0) {
		cellElement.style.borderTop = borderStyleBold;
	}
	
	if (cell.colIndex % 3 === 0) {
		cellElement.style.borderLeft = borderStyleBold;
	}
	
	if (cell.rowIndex === 8) {
		cellElement.style.borderBottom = borderStyleBold;
	}
	
	if (cell.colIndex === 8) {
		cellElement.style.borderRight = borderStyleBold;
	}
	
	return cellElement;
}

function generateLevelElement(playField, freshCells, levelNo, log) {
    // Create container div
    const container = document.createElement("div");
    container.className = "d-flex justify-content-start align-items-start p-3";
	
    const title = document.createElement("h3");
	container.appendChild(title);
    title.innerText = levelNo;

    // Create Sudoku grid
    const sudokuGrid = document.createElement("div");
	container.appendChild(sudokuGrid);
    sudokuGrid.className = "d-grid p-2";
    sudokuGrid.style.display = "grid";
    sudokuGrid.style.gridTemplateColumns = "repeat(9, 30px)";
    sudokuGrid.style.gridTemplateRows = "repeat(9, 30px)";
    sudokuGrid.style.border = "1px solid black";

	for (let rowIndex = 0; rowIndex < 9; rowIndex++) {		
		for (let colIndex = 0; colIndex < 9; colIndex++) {
			const cell = playField[rowIndex][colIndex];
			const cellElement = getStyledCellElement(cell);
			
			if (freshCells.includes(cell)) {
				cellElement.style.backgroundColor = 'pink';
			}
			
			sudokuGrid.appendChild(cellElement);
		}
	}
    
    // Create message log
    const messageLog = document.createElement("div");
	container.appendChild(messageLog);
    messageLog.className = "border border-dark p-2 ms-3";
    messageLog.style.width = "200px";
    messageLog.style.height = "270px";
    messageLog.style.overflowY = "auto";

    log.forEach(msg => {
        const p = document.createElement("p");
        p.className = "m-1";
        p.innerText = msg;
        messageLog.appendChild(p);
    });
    
    return container;
}


function arrayify(input) {
	const output = Array.isArray(input) ? input : [input];	
	return output.join(', ');	
}

function justLog(input) {
	if (typeof input !== 'object' || input instanceof Array) {	
		console.log(arrayify(input));
		return;
	}
	
	const output = [];	
	for (const prop in input) {
		output.push(`${prop}: ${arrayify(input[prop])}`);
	}
	console.log(output.join('; '));					
}

function resolveRow(playField, rowIndex) {
	justLog(`🔫🔫🔫 Started fitting row (${rowIndex + 1})...`);
	
	const row = playField[rowIndex];
	
	const knownValues = row.filter(cell => cell.value !== null).map(cell => cell.value);
	justLog(`Known values: ${knownValues}.`);
	
	const resolvedCells = [];
	
	if (knownValues.length === 9) {
		justLog(`Row is already resolved.`);
		return resolvedCells;
	}
		
	const pendingValues = sampleValues.filter(sv => !knownValues.includes(sv));	
	justLog(`Pending values: ${pendingValues}.`);
		
	for (const candidateValue of pendingValues) {
		justLog(`🔫 Let's fit ${candidateValue} ...`);
		
		const whereCanWeFitCandidateTo = [];		
		
		const pendingCells = row.filter(cell => cell.value === null);
		justLog(`Pending cells: ${pendingCells.map(cell => cell.location)}.`);
		for (const cell of pendingCells) {
			justLog(`Looking at the cell  ${cell.location} ...`);			
			
			const knownColumnValues = cell.getKnownColumnValues();
			const knownGroupValues = cell.getKnownGroupValues();
			justLog(`Its column has: ${knownColumnValues}, its group has: ${knownGroupValues}.`);
			
			justLog(`Can we insert ${candidateValue} here?`);
			
			if (knownColumnValues.includes(candidateValue) || knownGroupValues.includes(candidateValue)) {
				justLog(`No we can not.`);
			}
			else {
				justLog(`Yes, we can.`);
				whereCanWeFitCandidateTo.push(cell);
				
				if (whereCanWeFitCandidateTo.length > 1) {
					justLog(`Seems too vague already...`);
					break;
				}
			}
		}
		
		if (whereCanWeFitCandidateTo.length == 0) {
			justLog(`Uhmmm no places to fit into. What's next??? 🤷🤷🤷`);
		}
		else if (whereCanWeFitCandidateTo.length == 1) {
			const theCell = whereCanWeFitCandidateTo[0];
			justLog(`We should put ${candidateValue} into ${theCell.location}! 🥳🥳🥳`);
			theCell.value = candidateValue;
			resolvedCells.push(theCell);
			justLog(`Updated ${theCell.location} with value ${candidateValue}! 🥳🥳🥳`);
		}
		else {
			justLog(`So we can fit ${candidateValue} into few cells. Better luck next time. 💩💩💩`);
		}		
		
		justLog(`🏁 Finished fitting ${candidateValue}.`);

	}	


	

	justLog(`🏁🏁🏁 Finished fitting row (${rowIndex + 1}).`);
	justLog(`🏁🏁🏁 Fit ${resolvedCells.length} cells ${resolvedCells.map(cell => cell.location)}.`);
	return resolvedCells;
}



function fillTheCell(cell, field, value, rowIndex, colIndex) {
	cell.value = value;
	cell.rowIndex = rowIndex;
	cell.colIndex = colIndex;
	
	cell.groupRowIndex = Math.floor(rowIndex / 3);
	cell.groupColIndex = Math.floor(colIndex / 3);
	
	cell.myRowCells = field[rowIndex];
	cell.myColumnCells = field.map(row => row[colIndex]);
	cell.myGroupCells = field.filter((row, i) => Math.floor(i / 3) === cell.groupRowIndex).flatMap(row => row.filter((col, i) => Math.floor(i / 3) === cell.groupColIndex));
	
	cell.getKnownRowValues = () => cell.myRowCells.map(cell => cell.value).filter(value => value !== null);
	cell.getKnownColumnValues = () => cell.myColumnCells.map(cell => cell.value).filter(value => value !== null);
	cell.getKnownGroupValues = () => cell.myGroupCells.map(cell => cell.value).filter(value => value !== null);
	
	cell.location = `(${rowIndex + 1}:${colIndex + 1})`;
}

function produceField(digitTable) {
	const field = [
	  [ {}, {}, {},   {}, {}, {},   {}, {}, {} ],
	  [ {}, {}, {},   {}, {}, {},   {}, {}, {} ],
	  [ {}, {}, {},   {}, {}, {},   {}, {}, {} ],
	  
	  [ {}, {}, {},   {}, {}, {},   {}, {}, {} ],
	  [ {}, {}, {},   {}, {}, {},   {}, {}, {} ],
	  [ {}, {}, {},   {}, {}, {},   {}, {}, {} ],
	  
	  [ {}, {}, {},   {}, {}, {},   {}, {}, {} ],
	  [ {}, {}, {},   {}, {}, {},   {}, {}, {} ],
	  [ {}, {}, {},   {}, {}, {},   {}, {}, {} ],
	];
	
	for (let rowIndex = 0; rowIndex < 9; rowIndex++) {	
		for (let colIndex = 0; colIndex < 9; colIndex++) {
			const cell = field[rowIndex][colIndex];
			const value = digitTable[rowIndex][colIndex];
			fillTheCell(cell, field, value, rowIndex, colIndex);
		}
	}
	
	console.log({field});
	
	return field;
}

async function playGame(digitTable) {
	const playField = produceField(digitTable);
	
	for (let levelNo = 0; levelNo <= 100; levelNo++) {
		const log = [];
		let freshCells = [];
		
		if (levelNo > 0) {
			// Just go through rows indefinitely.
			const currentRow = (levelNo - 1) % 9;
			freshCells = resolveRow(playField, currentRow);		
		}
		if (levelNo === 0 || freshCells.length > 0)
		{
			const levelElement = generateLevelElement(playField, freshCells, levelNo, log);
			extainer.appendChild(levelElement);
		}
		
		if (playField.flatMap(row => row).every(cell => cell.value !== null)) {
			justLog(`you are a winrar`);
			break;			
		}
		
		await new Promise(r => setTimeout(r, 1));	
	}
}

const easyA = [
  [5, 3, null, null, 7, null, null, null, null],
  [6, null, null, 1, 9, 5, null, null, null],
  [null, 9, 8, null, null, null, null, 6, null],
  [8, null, null, null, 6, null, null, null, 3],
  [4, null, null, 8, null, 3, null, null, 1],
  [7, null, null, null, 2, null, null, null, 6],
  [null, 6, null, null, null, null, 2, 8, null],
  [null, null, null, 4, 1, 9, null, null, 5],
  [null, null, null, null, 8, null, null, 7, 9]
];

const hardB = [
  [null, null, null, 6, null, null, 4, null, null],
  [7, null, null, null, null, 3, 6, null, null],
  [null, null, null, null, 9, 1, null, 8, null],
  [null, null, null, null, null, null, null, null, null],
  [null, 5, null, 1, 8, null, null, null, 3],
  [null, null, null, 3, null, 6, null, 4, 5],
  [null, 4, null, 2, null, null, null, 6, null],
  [9, null, 3, null, null, null, null, null, null],
  [null, 2, null, null, null, null, 1, null, null]
];


playGame(easyA);
