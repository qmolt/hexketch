import HexGame from "./HexGame.js"

export default class hexketch{

	constructor(game, sketchProp, tempProp, div){

		new p5(function(p5){ 

			const imgSide = 128;	//(2048/16)
			const gridSize = 28;
			const offsetStack = 12;
			let bhexDraw;
			let bhexGrid;
			let bhexOptions;
			let bhexOrient;
			let bhexOrigin;

			let bgCanvas;

			let canvasSize = sketchProp.canvasSize;
			let hexOrient = sketchProp.hexOrient;
			let hexSize = sketchProp.hexSize;
			let userOffsetX = sketchProp.userOffsetX;
			let userOffsetY = sketchProp.userOffsetY;
			let offsetX = canvasSize/2 + userOffsetX;
			let offsetY = canvasSize/2 + userOffsetY;

			let gridDots = [];
			let gridLines = [];

			let imgHexS;

			const rampPeriod = 2501;
			let phasor;

			p5.preload = function(){
  				imgHexS = p5.loadImage('assets/img_hexketch.png');
			}
			p5.setup = function(){
				//p5
				p5.frameRate(10);
				bgCanvas = p5.createGraphics(canvasSize, canvasSize);
				p5.createCanvas(canvasSize, canvasSize);
				p5.colorMode(p5.HSB, 256);
				p5.ellipseMode(p5.CENTER);

				//grid
				bhexOrigin = new BHex.Drawing.Point(0, 0); //bhex only stores offset, doesn't apply it
				bhexOrient = (hexOrient==='pointy') ? BHex.Drawing.Static.Orientation.PointyTop : BHex.Drawing.Static.Orientation.FlatTop;
				bhexGrid = new BHex.Grid(gridSize);
				bhexOptions = new BHex.Drawing.Options(hexSize, bhexOrient, bhexOrigin);
				bhexDraw = new BHex.Drawing.Drawing(bhexGrid, bhexOptions);

				//dots coord
				gridDotsCoords(bhexDraw, gridDots);

				//lines coord
				gridLinesCoords(bhexDraw, gridLines, gridSize);

				//debug pause
				//p5.noLoop();
			}
			p5.draw = function(){
				
				phasor = (p5.millis()%rampPeriod)/(rampPeriod-1);

				//check board changes
				if(sketchProp.updateStatus){
					
					hexSize = sketchProp.hexSize;
					hexOrient = sketchProp.hexOrient;

					canvasSize = sketchProp.canvasSize;					
					p5.resizeCanvas(canvasSize, canvasSize);
					bgCanvas = p5.createGraphics(canvasSize, canvasSize);
					offsetX = canvasSize/2 + sketchProp.userOffsetX;
					offsetY = canvasSize/2 + sketchProp.userOffsetY;

					tempProp.arrowState = false;

					//remake grid
					bhexOrient = (hexOrient==='pointy') ? BHex.Drawing.Static.Orientation.PointyTop : BHex.Drawing.Static.Orientation.FlatTop;
					bhexOptions = new BHex.Drawing.Options(hexSize, bhexOrient, bhexOrigin);
					bhexDraw = new BHex.Drawing.Drawing(bhexGrid, bhexOptions);

					//update dots
					gridDotsCoords(bhexDraw, gridDots);
					
					//update lines
					gridLinesCoords(bhexDraw, gridLines, gridSize);

					//update positions for OL
					for(let i=0; i<game.aOLs.length;i++){
						let newPos = bhexCoord2Pos(bhexDraw, game.aOLs[i].cX, game.aOLs[i].cY);
						if(newPos){
							game.aOLs[i].pX = newPos.x;
							game.aOLs[i].pY = newPos.y;
						}
					}
					//update positions for tiles
					for(let i=0; i<game.aStacks.length; i++){
						let newPos = bhexCoord2Pos(bhexDraw, aStacks[i].cX, game.aStacks[i].cY);
						if(newPos){
							game.aStacks[i].pX = newPos.x;
							game.aStacks[i].pY = newPos.y;
						}
					}
					//update positions for HL
					for(let i=0; i<game.aHLs.length;i++){
						let newPos = bhexCoord2Pos(bhexDraw, game.aHLs[i].cX, game.aHLs[i].cY);
						if(newPos){
							game.aHLs[i].pX = newPos.x;
							game.aHLs[i].pY = newPos.y;
						}
					}
					//update positions for arrows
					for(let i=0; i<game.aArrows.length;i++){
						let newPosF = bhexCoord2Pos(bhexDraw, game.aArrows[i].fcX, game.aArrows[i].fcY);
						let newPosT = bhexCoord2Pos(bhexDraw, game.aArrows[i].tcX, game.aArrows[i].tcY);
						if(newPosF && newPosT){
							game.aArrows[i].fpX = newPosF.x;
							game.aArrows[i].fpY = newPosF.y;
							game.aArrows[i].tpX = newPosT.x;
							game.aArrows[i].tpY = newPosT.y;
						}
					}
					//update positions for comments
					for(let i=0; i<aComments.length;i++){
						let newPos = bhexCoord2Pos(bhexDraw, aComments[i].cX, aComments[i].cY);
						if(newPos){
							aComments[i].pX = newPos.x;
							aComments[i].pY = newPos.y;
						}
					}

					sketchProp.updateStatus = false;
				}
				//user moves the board
				if(userOffsetX != sketchProp.userOffsetX || userOffsetY != sketchProp.userOffsetY){
					userOffsetX = sketchProp.userOffsetX;
					userOffsetY = sketchProp.userOffsetY;
					offsetX = canvasSize/2 + userOffsetX;
					offsetY = canvasSize/2 + userOffsetY;
				}
				
				//pos cursor
				let posX = p5.mouseX - offsetX;
				let posY = p5.mouseY - offsetY;
				let hexMouse = bhexPos2Center(bhexDraw, posX, posY);
				let hmPX, hmPY;
				let theta = 0;
				if(hexMouse){
					hmPX = hexMouse.x + offsetX;
					hmPY = hexMouse.y + offsetY;
				}

				p5.clear();
				//draw bg
				let bgColor = p5.color(sketchProp.bgColor);
				bgCanvas.background(bgColor);
				if(sketchProp.saveFrame && !sketchProp.saveBg){bgCanvas.clear();}
				p5.image(bgCanvas, 0, 0);

				//draw grid
				if(sketchProp.gridVsbl){

					//dots
					let compBgColor = compP5Color(bgColor, 80);
					p5.stroke(compBgColor);
					p5.strokeWeight(sketchProp.hexSize*0.2);
					
					for(let i=0; i<gridDots.length; i++){
						let x = gridDots[i].x;
						let y = gridDots[i].y;
						p5.point(offsetX + x, offsetY + y);
					}

					//lines
					p5.strokeWeight(sketchProp.hexSize*0.02);
					for(let i=0; i<gridLines.length; i++){
						let x1 = gridLines[i].x1;
						let y1 = gridLines[i].y1;
						let x2 = gridLines[i].x2;
						let y2 = gridLines[i].y2;
						p5.line(offsetX + x1, offsetY + y1, offsetX + x2, offsetY + y2);
					}
				}
				
				//draw elements
				let sx, sy, sw, sh;
				let dx, dy, dw, dh;
				let pltt;
				let srcS = imgSide;
				let dstR = sketchProp.hexSize;

				//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
				//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
				//draw outlines
				for(let i=0; i<game.aOLs.length; i++){
					pltt = palettePos(sketchProp.oLColor, {type:'OL', oriTile:sketchProp.hexOrient});
					if(pltt){
						sx = pltt.x;
						sy = pltt.y;
						sw = srcS;
						sh = srcS;
						dx = offsetX + game.aOLs[i].pX - dstR;
						dy = offsetY + game.aOLs[i].pY - dstR;
						dw = 2*dstR;
						dh = 2*dstR;
						p5.image(imgHexS, dx, dy, dw, dh, sx, sy, sw, sh);
					}
				}
				//draw temp outline
				if(sketchProp.selElement==='outline' && sketchProp.selAction==='add'){
					pltt = palettePos(sketchProp.oLColor, {type:'OL', oriTile:sketchProp.hexOrient});
					if(pltt){
						dx = hmPX - dstR;
						dy = hmPY - dstR;
						dw = 2*dstR;
						dh = 2*dstR;
						sx = pltt.x;
						sy = pltt.y;
						sw = srcS;
						sh = srcS;
						p5.image(imgHexS, dx, dy, dw, dh, sx, sy, sw, sh);
					}
				} 
				//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
				//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
				//draw tiles
				for(let i=0; i<game.aStacks.length; i++){
					dx = offsetX + game.aStacks[i].pX; 
					dy = offsetY + game.aStacks[i].pY; 
					dw = 2*dstR;
					dh = 2*dstR;
					//stack
					for(let j=0; j<game.aStacks[i].tiles.length; j++){
						//if moving tile
						if(game.idxMovingStack==i){
							if(game.aStacks[i].tiles.length-1==j){
								continue;
							}
						}
						//offset
						let stackOffset = 0.05*hexSize*j;
						//tile
						pltt = palettePos(sketchProp.tilePalette, {
							type:'tile', 
							colorTile:game.aStacks[i].tiles[j].color, 
							oriTile:sketchProp.hexOrient
						});
						if(!pltt){continue;}
						sx = pltt.x;
						sy = pltt.y;
						sw = srcS;
						sh = srcS;
						theta = pltt.theta;
						p5.push();
						p5.translate(dx, dy);
						p5.rotate(theta);
						p5.image(imgHexS, -dstR-stackOffset, -dstR-stackOffset, dw, dh, sx, sy, sw, sh);
						p5.pop();
						//figure
						pltt = palettePos(sketchProp.tilePalette, {
							type:game.aStacks[i].tiles[j].figure,
							colorTile:game.aStacks[i].tiles[j].color,
							oriTile:sketchProp.hexOrient
						});
						if(!pltt){continue;}
						sx = pltt.x;
						sy = pltt.y;
						sw = srcS;
						sh = srcS;
						theta = pltt.theta;
						p5.push();
						p5.translate(dx, dy);
						p5.rotate(theta);
						p5.image(imgHexS, -dstR-stackOffset, -dstR-stackOffset, dw, dh, sx, sy, sw, sh);
						p5.pop();
					}
				}
				//draw moving tile
				if(game.idxMovingStack>=0){
					dx = hmPX;
					dy = hmPY;
					let idxStack = game.idxMovingStack;
					let idxTile = game.aStacks[idxStack].tiles.length-1;
					//tile
					pltt = palettePos(sketchProp.tilePalette, {
						type:'tile', 
						colorTile:game.aStacks[idxStack].tiles[idxTile].color, 
						oriTile:sketchProp.hexOrient
					});
					if(pltt){
						sx = pltt.x;
						sy = pltt.y;
						sw = srcS;
						sh = srcS;
						theta = pltt.theta;
						p5.push();
						p5.translate(dx, dy);
						p5.rotate(theta);
						p5.image(imgHexS, -dstR, -dstR, dw, dh, sx, sy, sw, sh);
						p5.pop();
					}
					//figure
					pltt = palettePos(sketchProp.tilePalette, {
						type:game.aStacks[idxStack].tiles[idxTile].figure,
						colorTile:game.aStacks[idxStack].tiles[idxTile].color,
						oriTile:sketchProp.hexOrient
					});
					if(pltt){
						sx = pltt.x;
						sy = pltt.y;
						sw = srcS;
						sh = srcS;
						theta = pltt.theta;
						p5.push();
						p5.translate(dx, dy);
						p5.rotate(theta);
						p5.image(imgHexS, -dstR, -dstR, dw, dh, sx, sy, sw, sh);
						p5.pop();
					}
				}
				//draw temp tile
				if(sketchProp.selElement==='tile' && sketchProp.selAction==='add'){
					dx = hmPX;
					dy = hmPY;
					dw = 2*dstR;
					dh = 2*dstR;
					pltt=palettePos(sketchProp.tilePalette, {type:'tile', colorTile:tempProp.tileColor, oriTile:sketchProp.hexOrient});
					if(pltt){
						sx = pltt.x;
						sy = pltt.y;
						sw = srcS;
						sh = srcS;
						theta = pltt.theta;
						p5.push();
						p5.translate(dx, dy);
						p5.rotate(theta);
						p5.image(imgHexS, -dstR, -dstR, dw, dh, sx, sy, sw, sh);
						p5.pop();
					}
					if(tempProp.tileFig!=='blank'){
						pltt=palettePos(sketchProp.tilePalette, {type:tempProp.tileFig, colorTile:tempProp.tileColor, oriTile:sketchProp.hexOrient});
						if(pltt){
							sx = pltt.x;
							sy = pltt.y;
							sw = srcS;
							sh = srcS;
							theta = pltt.theta;
							p5.push();
							p5.translate(dx, dy);
							p5.rotate(theta);
							p5.image(imgHexS, -dstR, -dstR, dw, dh, sx, sy, sw, sh);
							p5.pop();
						}
					}
				}
				//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
				//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
				//draw highlights
				for(let i=0; i<game.aHLs.length; i++){
					let hLColor = p5.color(game.aHLs[i].color);
					hLColor.setAlpha(game.aHLs[i].alpha); 
					dx = offsetX + game.aHLs[i].pX;
					dy = offsetY + game.aHLs[i].pY;
					p5.noStroke();
					p5.fill(hLColor);
					p5.ellipse(dx, dy, hexSize, hexSize);
				}
				//draw temp outline
				if(sketchProp.selElement==='highlight' && sketchProp.selAction==='add'){
					let hLColor = p5.color(tempProp.hLColor);
					hLColor.setAlpha(tempProp.hLOpacity); 
					dx = hmPX;
					dy = hmPY;
					p5.noStroke();
					p5.fill(hLColor);
					p5.ellipse(dx, dy, hexSize, hexSize);
				}
				//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
				//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
				//draw arrows
				for(let i=0; i<game.aArrows.length; i++){
					let arrowColor = p5.color(game.aArrows[i].color);
					p5.stroke(arrowColor);
					p5.fill(arrowColor);
					let arrowWeight = game.aArrows[i].weight; 
					p5.strokeWeight(arrowWeight);

					sx = offsetX + game.aArrows[i].fpX;
					sy = offsetY + game.aArrows[i].fpY;
					dx = offsetX + game.aArrows[i].tpX;
					dy = offsetY + game.aArrows[i].tpY;
					p5.line(sx, sy, dx, dy);

					theta = p5.atan2(dy-sy, dx-sx);
					let triSide = hexSize * 0.25;
					p5.push();
					p5.translate(dx, dy);
					p5.rotate(theta + p5.HALF_PI);
					p5.triangle(-triSide*0.5, 0, triSide*0.5, 0, 0, -0.8660254*triSide);
					p5.pop();
				}
				//draw temp arrow
				if(tempProp.arrowState && hexMouse){
					sx = offsetX + tempProp.arrowfpX;
					sy = offsetY + tempProp.arrowfpY;
					let arrowColor = p5.color(tempProp.arrowColor);
					p5.stroke(arrowColor);
					p5.fill(arrowColor);
					let arrowWeight = tempProp.arrowWeight;
					p5.strokeWeight(arrowWeight);
					p5.line(sx, sy, hmPX, hmPY);
				}
				//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
				//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
				//draw text
				for(let i=0; i<game.aComments.length; i++){
					//ignore if moving
					if(tempProp.moveCommentState==true){if(tempProp.moveCommentIdx==i){continue;}}
					//draw
					let textFont = game.aComments[i].font; 
					p5.textFont(textFont);
					let textSize = game.aComments[i].size;
  					p5.textSize(textSize);
					let textColor = game.aComments[i].color;
					let textMsg = game.aComments[i].msg;
					//if moving use mouse coords
					if(game.idxMovingComment == i){
						dx = hmPX;
						dy = hmPY;
					}
					else{
						dx = offsetX + game.aComments[i].pX;
						dy = offsetY + game.aComments[i].pY;
					}
					p5.noStroke();
					p5.fill(0);
  					p5.text(textMsg, dx, dy);
					p5.fill(textColor);
  					p5.text(textMsg, dx+1, dy+1);
				}
				//draw temp comment
				if(sketchProp.selElement==='comment' && sketchProp.selAction==='add'){
					let textFont = tempProp.commentFont; 
					p5.textFont(textFont);
					let textSize = tempProp.commentSize;
  					p5.textSize(textSize);
					let textColor = tempProp.commentColor;
					let textMsg = tempProp.commentMsg;
					p5.noStroke();
					p5.fill(textColor);
  					p5.text(textMsg, hmPX, hmPY);
				}

				//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
				//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
				//save frame
				if(sketchProp.saveFrame){
					p5.saveCanvas('myHexketch', 'png');
					sketchProp.saveFrame = false;
				}
				
				//show cursor
				p5.noStroke();
				p5.fill(255, 120);
				if(hexMouse){
					p5.ellipse(hmPX, hmPY, 1.732*hexSize, 1.732*hexSize);
				}
			}
			p5.mouseReleased = function(){
				triggerAction();
			}
			p5.keyReleased = function(){ //gotta go fast!
				let code = p5.keyCode;
				if(code == 32){tempProp.tileColor = (tempProp.tileColor==='b')?'w':'b';} //space
				else if(code == 65){tempProp.tileFig = 'ant';} 		//a
				else if(code == 66){tempProp.tileFig = 'beetle';}	//b
				else if(code == 71){tempProp.tileFig = 'grasshopper';}//g
				else if(code == 76){tempProp.tileFig = 'ladybug';}	//l
				else if(code == 77){tempProp.tileFig = 'mosquito';}	//m
				else if(code == 80){tempProp.tileFig = 'pillbug';}	//p
				else if(code == 81){tempProp.tileFig = 'queen';}	//q
				else if(code == 83){tempProp.tileFig = 'spider';}	//s
				else if(code == 219){tempProp.tileFig = 'qm';}		//?
				else if(code == 49){tempProp.tileFig = 'em';}		//!
				else if(code == 190){tempProp.tileFig = 'blank';}	//.

				//else if(code == ?){triggerAction();} //enter
				return false;
			}

			function triggerAction(){
				//ignore if out of canvas
				if(p5.mouseX>canvasSize || p5.mouseY>canvasSize || p5.mouseX<0 || p5.mouseY<0){return;}
				
				//ignore if no action/elem selected
				if(sketchProp.selAction === 'none' || sketchProp.selElement === 'none'){return;}
				
				//mouse position
				let posX = p5.mouseX - offsetX;
				let posY = p5.mouseY - offsetY;
				let hexMouse = bhexDraw.getHexAt(new BHex.Drawing.Point(posX, posY));
				if(!hexMouse){return;}

				let hmCX = hexMouse.x;
				let hmCY = hexMouse.y;
				let hmPX = hexMouse.center.x;
				let hmPY = hexMouse.center.y;

				//tile actions
				if(sketchProp.selElement === 'tile'){
					let tileColor = tempProp.tileColor;
					let tileFig = tempProp.tileFig;

					if(sketchProp.selAction === 'add'){
						//add
						game.addTile(hmCX, hmCY, hmPX, hmPY, tileFig, tileColor);
						//sort
						game.sortTilesCX();
						game.sortTilesCY();
					}
					else if(sketchProp.selAction === 'edit'){
						game.editTile(hmCX, hmCY, tileFig, tileColor);
					}
					else if(sketchProp.selAction === 'move'){
						game.moveTile(hmCX, hmCY, hmPX, hmPY);
						//sort
						game.sortTilesCX();
						game.sortTilesCY();
					}
					else if(sketchProp.selAction === 'delete'){
						game.deleteTile(hmCX, hmCY);
					}
				}
				//outline actions
				else if(sketchProp.selElement === 'outline'){
					if(sketchProp.selAction === 'add'){
						game.addOL(hmCX, hmCY, hmPX, hmPY);
					}
					else if(sketchProp.selAction === 'delete'){
						game.deleteOL(hmCX, hmCY);
					}
				}
				//highlight actions
				else if(sketchProp.selElement === 'highlight'){
					let hLColor = tempProp.hLColor;
					let hLAlpha = tempProp.hLOpacity;

					if(sketchProp.selAction === 'add'){
						game.addHL(hmCX, hmCY, hmPX, hmPY, hLColor, hLAlpha);
					}
					else if(sketchProp.selAction === 'edit'){
						game.editHL(hmCX, hmCY, tempProp.hLColor, tempProp.hLOpacity);
					}
					else if(sketchProp.selAction === 'delete'){
						game.deleteHL(hmCX, hmCY);
					}
				}
				//arrow actions
				else if(sketchProp.selElement === 'arrow'){
					if(sketchProp.selAction === 'add'){
						if(tempProp.arrowState == true){
							if(tempProp.arrowfcX==hmCX && tempProp.arrowfcY==hmCY){
								tempProp.arrowState=false; 
								return;
							}
							game.addArrow(tempProp.arrowfcX, tempProp.arrowfcY, tempProp.arrowfpX, tempProp.arrowfpY, 
								hmCX, hmCY, hmPX, hmPY, 
								tempProp.arrowColor, tempProp.arrowWeight);
							tempProp.arrowState=false; 
						}
						else{
							tempProp.arrowState = true;
							tempProp.arrowfcX = hmCX;
							tempProp.arrowfcY = hmCY;
							tempProp.arrowfpX = hmPX;
							tempProp.arrowfpY = hmPY;
						}
					}
					else if(sketchProp.selAction === 'edit'){
						game.editArrow(hmCX, hmCY, tempProp.arrowColor, tempProp.arrowWeight);
					}
					else if(sketchProp.selAction === 'delete'){
						game.deleteArrow(hmCX, hmCY);
					}
				}
				//comment actions
				else if(sketchProp.selElement === 'comment'){
					if(sketchProp.selAction === 'add'){
						game.addComment(hmCX, hmCY, hmPX, hmPY, 
							tempProp.commentMsg, tempProp.commentColor, tempProp.commentSize, tempProp.commentFont);
					}
					else if(sketchProp.selAction === 'edit'){
						game.editComment(hmCX, hmCY, 
							tempProp.commentMsg, tempProp.commentColor, tempProp.commentSize, tempProp.commentFont);
					}
					else if(sketchProp.selAction === 'move'){
						game.moveComment(hmCX, hmCY, hmPX, hmPY);
					}
					else if(sketchProp.selAction === 'delete'){
						game.deleteComment(hmCX, hmCY);
					}
				}
			}

			//aux functions
			function bhexPos2Center(bhexDrawing, posX, posY){
				let hex = bhexDraw.getHexAt(new BHex.Drawing.Point(posX, posY));
				if(hex){return{x:hex.center.x, y:hex.center.y};}
				else{return null;}
			}
			function bhexCoord2Pos(bhexDrawing, coordX, coordY){
				let hex = bhexDrawing.grid.hexes.find(o => {return (o.x === coordX && o.y === coordY)});
				if(hex){return{x:hex.center.x, y:hex.center.y};}
				else{return null;}
			}
			function gridDotsCoords(bhexDrawing, arrayDots){
				arrayDots.splice(0, arrayDots.length);
				for(let i=0; i<bhexDrawing.grid.hexes.length; i++){
					let x = bhexDrawing.grid.hexes[i].center.x;
					let y = bhexDrawing.grid.hexes[i].center.y;
					arrayDots.push({x:x, y:y});
				}
			}
			function gridLinesCoords(bhexDrawing, arrayLines, n){
				let a, b, c, d;
				let posHex1, posHex2;

				arrayLines.splice(0, arrayLines.length);
				for(let i=0; i<gridSize; i++){
					
					a = -n; b = i; c = i; d = -n;
					posHex1 = bhexCoord2Pos(bhexDrawing, a, b);
					posHex2 = bhexCoord2Pos(bhexDrawing, c, d);
					if(posHex1 && posHex2){arrayLines.push({x1:posHex1.x, y1:posHex1.y, x2:posHex2.x, y2:posHex2.y});}

					a = -i; b = i-n; c = n; d = i-n;
					posHex1 = bhexCoord2Pos(bhexDrawing, a, b);
					posHex2 = bhexCoord2Pos(bhexDrawing, c, d);
					if(posHex1 && posHex2){arrayLines.push({x1:posHex1.x, y1:posHex1.y, x2:posHex2.x, y2:posHex2.y});}
					
					a = n-i; b = -n; c = n-i; d = i;
					posHex1 = bhexCoord2Pos(bhexDrawing, a, b);
					posHex2 = bhexCoord2Pos(bhexDrawing, c, d);
					if(posHex1 && posHex2){arrayLines.push({x1:posHex1.x, y1:posHex1.y, x2:posHex2.x, y2:posHex2.y});}

					a = n; b = -i; c = -i; d = n;
					posHex1 = bhexCoord2Pos(bhexDrawing, a, b);
					posHex2 = bhexCoord2Pos(bhexDrawing, c, d);
					if(posHex1 && posHex2){arrayLines.push({x1:posHex1.x, y1:posHex1.y, x2:posHex2.x, y2:posHex2.y});}

					a = i; b = n-i; c = -n; d = n-i;
					posHex1 = bhexCoord2Pos(bhexDrawing, a, b);
					posHex2 = bhexCoord2Pos(bhexDrawing, c, d);
					if(posHex1 && posHex2){arrayLines.push({x1:posHex1.x, y1:posHex1.y, x2:posHex2.x, y2:posHex2.y});}

					a = i-n; b = n; c = i-n; d = -i;
					posHex1 = bhexCoord2Pos(bhexDrawing, a, b);
					posHex2 = bhexCoord2Pos(bhexDrawing, c, d);
					if(posHex1 && posHex2){arrayLines.push({x1:posHex1.x, y1:posHex1.y, x2:posHex2.x, y2:posHex2.y});}
				}

				a = -n; b = n; c = n; d = -n;
				posHex1 = bhexCoord2Pos(bhexDrawing, a, b);
				posHex2 = bhexCoord2Pos(bhexDrawing, c, d);
				if(posHex1 && posHex2){arrayLines.push({x1:posHex1.x, y1:posHex1.y, x2:posHex2.x, y2:posHex2.y});}

				a = -n; b = 0; c = n; d = 0;
				posHex1 = bhexCoord2Pos(bhexDrawing, a, b);
				posHex2 = bhexCoord2Pos(bhexDrawing, c, d);
				if(posHex1 && posHex2){arrayLines.push({x1:posHex1.x, y1:posHex1.y, x2:posHex2.x, y2:posHex2.y});}

				a = 0; b = -n; c = 0; d = n;
				posHex1 = bhexCoord2Pos(bhexDrawing, a, b);
				posHex2 = bhexCoord2Pos(bhexDrawing, c, d);
				if(posHex1 && posHex2){arrayLines.push({x1:posHex1.x, y1:posHex1.y, x2:posHex2.x, y2:posHex2.y});}
			}
			function compP5Color(p5Color, alpha){
				let col = p5Color;
				col.setRed(255 - p5Color.levels[0]);
				col.setGreen(255 - p5Color.levels[1]);
				col.setBlue(255 - p5Color.levels[2]);
				col.setAlpha(alpha);
				return col;
			}
			function palettePos(palette, specProp){
				let col, row;
				let type = specProp.type;
				let angle = 0;

				//get row
				row = parseInt(palette);
				if(isNaN(row)){row = 0;}
				if(row < 0 || row > 15){row = 0;}

				//get column
				if(type === 'OL'){
					let oriTile = specProp.oriTile;
					if(oriTile === 'pointy'){col = 14;}
					else if(oriTile === 'flat'){col = 15;}
					else{return null;}
				}
				else if(type === 'tile'){
					let colorTile = specProp.colorTile;
					let oriTile = specProp.oriTile;
					
					if(row==8 || row==9){ //non included flat
						if(colorTile === 'b'){col = 11;}
						else if(colorTile === 'w'){col = 10;}
						else{return null;}
						
						if(oriTile === 'flat'){angle = p5.PI/6;}
					}
					else{ //flat included
						if(colorTile === 'b'){
							if(oriTile === 'pointy'){col = 11;}
							else if(oriTile === 'flat'){col = 13;}
							else{return null;}
						}
						else if(colorTile === 'w'){
							if(oriTile === 'pointy'){col = 10;}
							else if(oriTile === 'flat'){col = 12;}
							else{return null;}
						}
						else{return null;}
					}
				}
				else{
					let colorTile = specProp.colorTile;
					let oriTile = specProp.oriTile;
					
					//carbon
					if(colorTile==='b' && row == 1){row = 2;}

					//fig
					if(type === 'ant'){col = 0;}
					else if(type === 'beetle'){col = 1;}
					else if(type === 'grasshopper'){col = 2;}
					else if(type === 'ladybug'){col = 3;}
					else if(type === 'mosquito'){col = 4;}
					else if(type === 'pillbug'){col = 5;}
					else if(type === 'queen'){col = 6;}
					else if(type === 'spider'){col = 7;}
					else if(type === 'qm'){col = 8;}
					else if(type === 'em'){col = 9;}
					else{return null;}

					//if flat not included
					if(row==8 || row==9){if(oriTile === 'flat'){angle = p5.PI/6;}}
				}

				//source img
				let x = col * imgSide;
				let y = row * imgSide;
				return {x:x, y:y, theta:angle};
			}

		}, div);
	}
}