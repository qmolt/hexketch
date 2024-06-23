import hexketch from "./hexketch.js"
import HexGame from "./HexGame.js"

//html elements
//game state
const selGame = document.getElementById('selGame');
const textGame = document.getElementById('textGame');
const butLoadGame = document.getElementById('butLoadGame');
const butSaveGame = document.getElementById('butSaveGame');
const butNewGame = document.getElementById('butNewGame');

//board
const butExpandCanvas = document.getElementById('butExpandCanvas');
const butReduceCanvas = document.getElementById('butReduceCanvas');
const butZoomIn = document.getElementById('butZoomIn');
const butZoomOut = document.getElementById('butZoomOut');
const butMoveLeft = document.getElementById('butMoveLeft');
const butMoveRight = document.getElementById('butMoveRight');
const butMoveUp = document.getElementById('butMoveUp');
const butMoveDown = document.getElementById('butMoveDown');
const checkGrid = document.getElementById('checkGrid');
const switchGrid = document.getElementById('switchGrid');

//actions/elements
const butSelTile = document.getElementById('butSelTile');
const butSelOL = document.getElementById('butSelOL');
const butSelHL = document.getElementById('butSelHL');
const butSelArrow = document.getElementById('butSelArrow');
const butSelComment = document.getElementById('butSelComment');
const butDoAdd = document.getElementById('butDoAdd');
const butDoEdit = document.getElementById('butDoEdit');
const butDoMove = document.getElementById('butDoMove');
const butDoDelete = document.getElementById('butDoDelete');
const butDoReset = document.getElementById('butDoReset');

//tile
const butTileFig = document.querySelectorAll('.tileFig');
const butTileColor = document.querySelectorAll('.tileColor');

//ol
//( ಠ ͜ʖಠ)

//hl
const colorHL = document.getElementById('colorHL');
const selHLOpacity = document.getElementById('selHLOpacity');

//arrow
const colorArrow = document.getElementById('colorArrow');
const selArrowWeight = document.getElementById('selArrowWeight');

//comment
const textComment = document.getElementById('textComment');
const colorComment = document.getElementById('colorComment');
const selFont = document.getElementById('selFont');
const selSize = document.getElementById('selSize');

//colors
const colorBG = document.getElementById('colorBG');
const selTilePalette = document.getElementById('selTilePalette');
const selTileStyle = document.getElementById('selTileStyle');
const selOLColor = document.getElementById('selOLColor');

//save
const takePhoto = document.getElementById('takePhoto');
const saveBg = document.getElementById('saveBg');

//sections to hide/show
const sectionTile = document.getElementById('sectionTile');
const sectionOL = document.getElementById('sectionOL');
const sectionHL = document.getElementById('sectionHL');
const sectionArrow = document.getElementById('sectionArrow');
const sectionComment = document.getElementById('sectionComment');

//obj to hexketch.js
let sketchProp = {
	canvasSize: 600,
	hexSize: 40,
	hexOrient: 'pointy',
	gridDots: [],
	bgColor: "#213444",
	gridVsbl: 1,
	saveFrame: false,
	saveBg: true,
	userOffsetX: 0,
	userOffsetY: 0,
	selElement: 'none',
	selAction: 'none',
	tilePalette: '0',
	tileStyle: '0',
	oLColor: '0',
	updateStatus: false
};
let sketchInfo = {
	selElement: 'none',	//tile, ol, hl, arrow, comment, none
	selAction: 'none', //add, edit, move, delete, none
	paletteCBSafe: false,
	unsavedData: false,
	overwriteRisk: false
};
let tempProp = {
	tileFig: 'ladybug',
	tileColor: 'w',
	hLColor: '#e03375',
	hLOpacity: 191,
	arrowColor: '#e0d233',
	arrowWeight: 3,
	commentMsg: '',
	commentColor: '#ffffff',
	commentFont: 'Helvetica',
	commentSize: 12,
	arrowState: false,
	arrowfcX: 0,
	arrowfcY: 0,
	arrowfpX: -1,
	arrowfpY: -1,
	moveTileState: false,
	moveTileIdx: -1,
	moveCommentState: false,
	moveCommentIdx: -1
};

//sketch
let gamesColl = [];
let mainGame = new HexGame('0', '');
let myHexketch = new hexketch(mainGame, sketchProp, tempProp, 'myHexketchbook');

//game state
butNewGame.addEventListener('click', startNewGame);
function startNewGame(){
	mainGame.clearAll();
	
	sketchInfo.unsavedData = true;
	slotGame();
}
selGame.addEventListener('change', slotGame);
function slotGame(){
	let idxGame = gamesColl.findIndex(o => {return o.id==selGame.value;});
	if(idxGame<0){
		textGame.value=''; 
		sketchInfo.overwriteRisk = false;
		updateWarning();
	}
	else{
		textGame.value = gamesColl[idxGame].name;
		sketchInfo.overwriteRisk = true;
		updateWarning();
	}
}
textGame.addEventListener('input', nameGame);
function nameGame(){
	sketchInfo.unsavedData = true;
	updateWarning();
}
butLoadGame.addEventListener('click', loadGame);
function loadGame(){
	let idxGame = gamesColl.findIndex(o => {return o.id==selGame.value;});
	mainGame.copyAll(gamesColl[idxGame]);

	sketchInfo.unsavedData = false;
	sketchInfo.overwriteRisk = true;
	updateWarning();
}
butSaveGame.addEventListener('click', saveGame);
function saveGame(){
	let gameId = selGame.value;
	let gameName = textGame.value;
	if(gameName===''){gameName='unnamed';}
	//if replacing
	let idxGame = gamesColl.findIndex(o => {return o.id==selGame.value;});
	if(idxGame>=0){gamesColl.splice(idxGame, 1);}
	//create and add
	let copyGame = new HexGame('-1', '');
	copyGame.copyAll(mainGame);
	copyGame.setGameId(gameId, gameName);
	gamesColl.push(copyGame);

	sketchInfo.unsavedData = false;
	updateWarning();
}

//canvas size
butExpandCanvas.addEventListener('click', expandCanvas);
function expandCanvas(){sketchProp.canvasSize += 50; sketchProp.updateStatus=true;}
butReduceCanvas.addEventListener('click', reduceCanvas);
function reduceCanvas(){sketchProp.canvasSize = Math.max(200, sketchProp.canvasSize - 50); sketchProp.updateStatus=true;}

//zoom
butZoomIn.addEventListener('click', zoomIn);
function zoomIn(){sketchProp.hexSize = Math.min(sketchProp.hexSize + 5, 100); sketchProp.updateStatus=true;}
butZoomOut.addEventListener('click', zoomOut);
function zoomOut(){sketchProp.hexSize = Math.max(sketchProp.hexSize - 5, 10); sketchProp.updateStatus=true;}

//move
butMoveLeft.addEventListener('click', moveLeft);
function moveLeft(){sketchProp.userOffsetX -= sketchProp.hexSize;}
butMoveRight.addEventListener('click', moveRight);
function moveRight(){sketchProp.userOffsetX += sketchProp.hexSize;}
butMoveUp.addEventListener('click', moveUp);
function moveUp(){sketchProp.userOffsetY -= sketchProp.hexSize;}
butMoveDown.addEventListener('click', moveDown);
function moveDown(){sketchProp.userOffsetY += sketchProp.hexSize;}

//grid
selOrientation.addEventListener('change', oriGrid);
function oriGrid(){sketchProp.hexOrient = selOrientation.value; sketchProp.updateStatus=true;}

switchGrid.addEventListener('click', showGrid);
function showGrid(){sketchProp.gridVsbl = (switchGrid.checked)?1:0;}

//functions
butSelTile.addEventListener('click', selTile);
function selTile(){
	sketchProp.selElement = 'tile';
	sketchInfo.selElement = 'tile';
	updateInfo();
	showSection('tile');
	hideAction('tile');
	tempProp.arrowState = false;
	tempProp.moveTileState = false;
	tempProp.moveCommentState = false;
}
butSelOL.addEventListener('click', selOL);
function selOL(){
	sketchProp.selElement = 'outline';
	sketchInfo.selElement = 'outline';
	updateInfo();
	showSection('outline');
	hideAction('outline');
	tempProp.arrowState = false;
	tempProp.moveTileState = false;
	tempProp.moveCommentState = false;
}
butSelHL.addEventListener('click', selHL);
function selHL(){
	sketchProp.selElement = 'highlight';
	sketchInfo.selElement = 'highlight';
	updateInfo();
	showSection('highlight');
	hideAction('highlight');
	tempProp.arrowState = false;
	tempProp.moveTileState = false;
	tempProp.moveCommentState = false;
}
butSelArrow.addEventListener('click', selArrow);
function selArrow(){
	sketchProp.selElement = 'arrow';
	sketchInfo.selElement = 'arrow';
	updateInfo();
	showSection('arrow');
	hideAction('arrow');
	tempProp.arrowState = false;
	tempProp.moveTileState = false;
	tempProp.moveCommentState = false;
}
butSelComment.addEventListener('click', selComment);
function selComment(){
	sketchProp.selElement = 'comment';
	sketchInfo.selElement = 'comment';
	updateInfo();
	showSection('comment');
	hideAction('comment');
	tempProp.arrowState = false;
	tempProp.moveTileState = false;
	tempProp.moveCommentState = false;
}

butDoAdd.addEventListener('click', doAdd);
function doAdd(){
	sketchProp.selAction = 'add';
	sketchInfo.selAction = 'add';
	updateInfo();
	tempProp.arrowState = false;
	tempProp.moveTileState = false;
	tempProp.moveCommentState = false;
}
butDoEdit.addEventListener('click', doEdit);
function doEdit(){
	sketchProp.selAction = 'edit';
	sketchInfo.selAction = 'edit';
	updateInfo();
	tempProp.arrowState = false;
	tempProp.moveTileState = false;
	tempProp.moveCommentState = false;
}
butDoMove.addEventListener('click', doMove);
function doMove(){
	sketchProp.selAction = 'move';
	sketchInfo.selAction = 'move';
	updateInfo();
	tempProp.arrowState = false;
	tempProp.moveTileState = false;
	tempProp.moveCommentState = false;
}
butDoDelete.addEventListener('click', doDelete);
function doDelete(){
	sketchProp.selAction = 'delete';
	sketchInfo.selAction = 'delete';
	updateInfo();
	tempProp.arrowState = false;
	tempProp.moveTileState = false;
	tempProp.moveCommentState = false;
}
butDoReset.addEventListener('click', doReset);
function doReset(){
	sketchProp.selAction = 'none';
	sketchProp.selElement = 'none';
	sketchInfo.selAction = 'none';
	sketchInfo.selElement = 'none';
	updateInfo();
	showSection('none');
	hideAction('none');
	tempProp.arrowState = false;
	tempProp.moveTileState = false;
	tempProp.moveCommentState = false;
}

//tile
butTileFig.forEach(but => {
	but.addEventListener('click', () => {
		if(but.innerHTML === ' '){tempProp.tileFig = 'blank';}
		else if(but.innerHTML === 'A'){tempProp.tileFig = 'ant';}
		else if(but.innerHTML === 'B'){tempProp.tileFig = 'beetle';}
		else if(but.innerHTML === 'G'){tempProp.tileFig = 'grasshopper';}
		else if(but.innerHTML === 'L'){tempProp.tileFig = 'ladybug';}
		else if(but.innerHTML === 'M'){tempProp.tileFig = 'mosquito';}
		else if(but.innerHTML === 'P'){tempProp.tileFig = 'pillbug';}
		else if(but.innerHTML === 'Q'){tempProp.tileFig = 'queen';}
		else if(but.innerHTML === 'S'){tempProp.tileFig = 'spider';}
		else if(but.innerHTML === '?'){tempProp.tileFig = 'qm';}
		else if(but.innerHTML === '!'){tempProp.tileFig = 'em';}
	});
});
butTileColor.forEach(but => {
	but.addEventListener('click', () => {
		if(but.innerHTML === 'black'){tempProp.tileColor = 'b';}
		else{tempProp.tileColor = 'w';}
	});
});

//hl
colorHL.addEventListener('input', hLColor);
function hLColor(){tempProp.hLColor = colorHL.value;}
selHLOpacity.addEventListener('change', hLOpacity);
function hLOpacity(){tempProp.hLOpacity = 2.55 * parseInt(selHLOpacity.value);}

//arrow
colorArrow.addEventListener('input', arrowColor);
function arrowColor(){tempProp.arrowColor = colorArrow.value;}
selArrowWeight.addEventListener('change', arrowWeight);
function arrowWeight(){tempProp.arrowWeight = parseInt(selArrowWeight.value);}

//comment
textComment.addEventListener('input', commentText);
function commentText(){tempProp.commentMsg = textComment.value;}
colorComment.addEventListener('input', commentColor);
function commentColor(){tempProp.commentColor = colorComment.value;}
selFont.addEventListener('change', commentFont);
function commentFont(){tempProp.commentFont = selFont.value;}
selSize.addEventListener('change', commentSize);
function commentSize(){tempProp.commentSize = parseInt(selSize.value);}

//bg color
colorBG.addEventListener('input', canvasColor);
function canvasColor(){sketchProp.bgColor = colorBG.value;}
selTilePalette.addEventListener('change', tilePalette);
function tilePalette(){
	let palette = selTilePalette.value;
	if(palette === '3' || palette === '4' || palette === '5' || palette === '6'){
		sketchInfo.paletteCBSafe = true;
	}else{
		sketchInfo.paletteCBSafe = false;
	}
	sketchProp.tilePalette = palette;
	updateWarning();
}
selTileStyle.addEventListener('change', tileStyle);
function tileStyle(){
	sketchProp.tileStyle = selTileStyle.value;
}
selOLColor.addEventListener('change', oLColor);
function oLColor(){
	sketchProp.oLColor = selOLColor.value;
}

//save
takePhoto.addEventListener('click', saveHexketch);
function saveHexketch(){sketchProp.saveFrame = true;}
saveBg.addEventListener('click', includeBg);
function includeBg(){sketchProp.saveBg = saveBg.checked;}

//info
function updateInfo(){
	let aInfo = [];

	if(sketchInfo.selElement === 'none'){aInfo.push("select an element.");}
	else if(sketchInfo.selElement === 'tile'){aInfo.push("<b>tile</b> element.");}
	else if(sketchInfo.selElement === 'outline'){aInfo.push("<b>outline</b> element.");}
	else if(sketchInfo.selElement === 'highlight'){aInfo.push("<b>highlight</b> element.");}
	else if(sketchInfo.selElement === 'arrow'){aInfo.push("<b>arrow</b> element.");}
	else if(sketchInfo.selElement === 'comment'){aInfo.push("<b>comment</b> element.");}

	if(sketchInfo.selAction === 'none'){aInfo.push("select an action.");}
	else if(sketchInfo.selAction === 'add'){aInfo.push("<b>add</b> action.");}
	else if(sketchInfo.selAction === 'edit'){aInfo.push("<b>edit</b> action.");}
	else if(sketchInfo.selAction === 'move'){aInfo.push("<b>move</b> action.");}
	else if(sketchInfo.selAction === 'delete'){aInfo.push("<b>delete</b> action.");}
	
	actionInfo.innerHTML = aInfo.join(" // ");
}
function updateWarning(){
	let aWarn = [];

	if(sketchInfo.overwriteRisk){aWarn.push('slot used: load to view, save to overwrite.')}
	if(sketchInfo.unsavedData){aWarn.push('unsaved data.');}
	if(sketchInfo.paletteCBSafe){aWarn.push('this palette is color-blind safe.');}

	warningInfo.innerHTML = aWarn.join(" // ");
}

//show/hide properties
function showSection(section){
	sectionTile.style.display = (section==='tile')?'block':'none';
	sectionOL.style.display = (section==='outline')?'block':'none';
	sectionHL.style.display = (section==='highlight')?'block':'none';
	sectionArrow.style.display = (section==='arrow')?'block':'none';
	sectionComment.style.display = (section==='comment')?'block':'none';
}
function hideAction(elem){
	butDoEdit.style.display = (elem==='outline')?'none':'block';
	butDoMove.style.display = (elem==='outline' || elem === 'highlight' || elem === 'arrow')?'none':'block';
}