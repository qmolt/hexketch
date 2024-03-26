export default class hexketch{

	constructor(sketchProp, tempProp, div){

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

			let aTiles = [];
			let aOLs = [];
			let aHLs = [];
			let aArrows = [];
			let aComments = [];

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
					for(let i=0; i<aOLs.length;i++){
						let newPos = bhexCoord2Pos(bhexDraw, aOLs[i].cX, aOLs[i].cY);
						if(newPos){
							aOLs[i].pX = newPos.x;
							aOLs[i].pY = newPos.y;
						}
					}
					//update positions for tiles
					for(let i=0; i<aTiles.length; i++){
						let newPos = bhexCoord2Pos(bhexDraw, aTiles[i].cX, aTiles[i].cY);
						if(newPos){
							aTiles[i].pX = newPos.x;
							aTiles[i].pY = newPos.y;
						}
					}
					//update positions for HL
					for(let i=0; i<aHLs.length;i++){
						let newPos = bhexCoord2Pos(bhexDraw, aHLs[i].cX, aHLs[i].cY);
						if(newPos){
							aHLs[i].pX = newPos.x;
							aHLs[i].pY = newPos.y;
						}
					}
					//update positions for arrows
					for(let i=0; i<aArrows.length;i++){
						let newPosF = bhexCoord2Pos(bhexDraw, aArrows[i].fcX, aArrows[i].fcY);
						let newPosT = bhexCoord2Pos(bhexDraw, aArrows[i].tcX, aArrows[i].tcY);
						if(newPosF && newposT){
							aArrows[i].fpX = newPosF.x;
							aArrows[i].fpY = newPosF.y;
							aArrows[i].tpX = newPosT.x;
							aArrows[i].tpY = newPosT.y;
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
				if(hexMouse){
					hmPX = hexMouse.x + offsetX;
					hmPY = hexMouse.y + offsetY;
				}

				//draw bg
				p5.clear();
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

				//draw outlines
				for(let i=0; i<aOLs.length; i++){
					pltt = palettePos(sketchProp.tilePalette, {type:'OL', oriTile:sketchProp.hexOrient});
					sx = pltt.x;
					sy = pltt.y;
					sw = srcS;
					sh = srcS;
					dx = offsetX + aOLs[i].pX - dstR;
					dy = offsetY + aOLs[i].pY - dstR;
					dw = 2*dstR;
					dh = 2*dstR;
					p5.image(imgHexS, dx, dy, dw, dh, sx, sy, sw, sh);
				}
				//draw tiles
				for(let i=0; i<aTiles.length; i++){
					dx = offsetX + aTiles[i].pX - dstR;
					dy = offsetY + aTiles[i].pY - dstR;
					dw = 2*dstR;
					dh = 2*dstR;
					//stack
					for(let j=0; j<aTiles[i].bTiles.length; j++){
						//skip if moving tile
						if(tempProp.moveTileState){if(tempProp.moveTileIdx==i && aTiles[i].bTiles.length-1==j){continue;}}

						let stackOffset = 0.05*hexSize*j;
						//tile
						pltt = palettePos(sketchProp.tilePalette, {
							type:'tile', 
							colorTile:aTiles[i].bTiles[j].color, 
							oriTile:sketchProp.hexOrient
						});
						sx = pltt.x;
						sy = pltt.y;
						sw = srcS;
						sh = srcS;
						p5.image(imgHexS, dx-stackOffset, dy-stackOffset, dw, dh, sx, sy, sw, sh);
						
						//figure
						if(aTiles[i].bTiles[j].figure==='blank'){continue;}
						pltt = palettePos(sketchProp.tilePalette, {
							type:aTiles[i].bTiles[j].figure
						});
						sx = pltt.x;
						sy = pltt.y;
						sw = srcS;
						sh = srcS;
						p5.image(imgHexS, dx-stackOffset, dy-stackOffset, dw, dh, sx, sy, sw, sh);
					}
				}
				//draw moving tile
				if(tempProp.moveTileState){
					let idx = tempProp.moveTileIdx;
					let stackIdx = aTiles[idx].bTiles.length - 1;
					dx = hmPX - dstR;
					dy = hmPY - dstR;
					dw = 2*dstR;
					dh = 2*dstR;
					//tile
					pltt = palettePos(sketchProp.tilePalette, {
						type:'tile', 
						colorTile:aTiles[idx].bTiles[stackIdx].color, 
						oriTile:sketchProp.hexOrient
					});
					sx = pltt.x;
					sy = pltt.y;
					sw = srcS;
					sh = srcS;
					p5.image(imgHexS, dx, dy, dw, dh, sx, sy, sw, sh);
					//figure
					if(aTiles[idx].bTiles[stackIdx].figure!=='blank'){
						pltt = palettePos(sketchProp.tilePalette, {
							type:aTiles[idx].bTiles[stackIdx].figure
						});
						sx = pltt.x;
						sy = pltt.y;
						sw = srcS;
						sh = srcS;
						p5.image(imgHexS, dx, dy, dw, dh, sx, sy, sw, sh);
					}
				}
				//draw highlights
				for(let i=0; i<aHLs.length; i++){
					let hLColor = p5.color(aHLs[i].color);
					hLColor.setAlpha(aHLs[i].alpha); 
					
					dx = offsetX + aHLs[i].pX;
					dy = offsetY + aHLs[i].pY;
					p5.noStroke();
					p5.fill(hLColor);
					p5.ellipse(dx, dy, hexSize, hexSize);
				}
				//draw arrows
				for(let i=0; i<aArrows.length; i++){
					let arrowColor = p5.color(aArrows[i].color);
					p5.stroke(arrowColor);
					p5.fill(arrowColor);
					let arrowWeight = aArrows[i].weight; 
					p5.strokeWeight(arrowWeight);

					sx = offsetX + aArrows[i].fpX;
					sy = offsetY + aArrows[i].fpY;
					dx = offsetX + aArrows[i].tpX;
					dy = offsetY + aArrows[i].tpY;
					p5.line(sx, sy, dx, dy);

					let theta = p5.atan2(dy-sy, dx-sx);
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

				//draw text
				for(let i=0; i<aComments.length; i++){
					//ignore if moving
					if(tempProp.moveCommentState==true){if(tempProp.moveCommentIdx==i){continue;}}
					//draw
					let textFont = aComments[i].font; 
					p5.textFont(textFont);
					let textSize = aComments[i].size;
  					p5.textSize(textSize);
					let textColor = aComments[i].color;
					let textMsg = aComments[i].msg;
					dx = offsetX + aComments[i].pX;
					dy = offsetY + aComments[i].pY;
					p5.noStroke();
					p5.fill(0);
  					p5.text(textMsg, dx, dy);
					p5.fill(textColor);
  					p5.text(textMsg, dx+1, dy+1);
				}
				//draw moving comment
				if(tempProp.moveCommentState==true){
					let idx = tempProp.moveCommentIdx;
					let textFont = aComments[idx].font; 
					p5.textFont(textFont);
					let textSize = aComments[idx].size;
  					p5.textSize(textSize);
					let textColor = aComments[idx].color;
					let textMsg = aComments[idx].msg;
					p5.noStroke();
					p5.fill(textColor);
  					p5.text(textMsg, hmPX, hmPY);
				}

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
						//find stack
						let hexIdx = aTiles.findIndex(o => {return (o.cX === hmCX && o.cY === hmCY)});
						if(hexIdx<0){
							aTiles.push({
								bTiles: [{figure:tileFig, color:tileColor}],
								cX: hmCX,
								cY: hmCY,
								pX: hmPX,
								pY: hmPY
							});
						}
						else{
							aTiles[hexIdx].bTiles.push({figure:tileFig, color:tileColor});
						}
					}
					else if(sketchProp.selAction === 'edit'){
						let hexIdx = aTiles.findIndex(o => {return (o.cX === hmCX && o.cY === hmCY)});
						if(hexIdx<0){return;}
						
						let stackSize = aTiles[hexIdx].bTiles.length;
						if(stackSize>0){
							aTiles[hexIdx].bTiles[stackSize-1].figure = tempProp.tileFig;
							aTiles[hexIdx].bTiles[stackSize-1].color = tempProp.tileColor;
						}
					}
					else if(sketchProp.selAction === 'move'){
						if(tempProp.moveTileState){
							let oldIdx = tempProp.moveTileIdx;
							let oldStackSize = aTiles[oldIdx].bTiles.length;
							let newIdx = aTiles.findIndex(o => {return (o.cX === hmCX && o.cY === hmCY)});
							
							//ignore if same coord
							if(oldIdx == newIdx){tempProp.moveTileState=false; return}
							
							//no stack at new coord
							if(newIdx<0){
								//not only tile in old stack
								if(oldStackSize>1){
									aTiles.push({
										bTiles: [aTiles[oldIdx].bTiles[oldStackSize-1]],
										cX: hmCX,
										cY: hmCY,
										pX: hmPX,
										pY: hmPY
									});
									aTiles[oldIdx].bTiles.splice(oldStackSize-1, 1);
								}//only tile in old stack
								else{
									aTiles[oldIdx].cX = hmCX;
									aTiles[oldIdx].cY = hmCY;
									aTiles[oldIdx].pX = hmPX;
									aTiles[oldIdx].pY = hmPY;
								}
							}//already a stack at new coord
							else{
								aTiles[newIdx].bTiles.push(aTiles[oldIdx].bTiles[oldStackSize-1]);

								//not only tile in old stack
								if(oldStackSize>1){
									aTiles[oldIdx].bTiles.splice(oldStackSize-1, 1);
								}//only tile in old stack
								else{
									aTiles.splice(oldIdx, 1);
								}
							}
							tempProp.moveTileState = false;
						}
						else{
							let hexIdx = aTiles.findIndex(o => {return (o.cX === hmCX && o.cY === hmCY)});
							if(hexIdx<0){return;}
							tempProp.moveTileIdx = hexIdx;
							tempProp.moveTileState = true;
						}
					}
					else if(sketchProp.selAction === 'delete'){
						let hexIdx = aTiles.findIndex(o => {return (o.cX === hmCX && o.cY === hmCY)});
						if(hexIdx<0){return;}
						
						let stackSize = aTiles[hexIdx].bTiles.length;
						if(stackSize>1){
							aTiles[hexIdx].bTiles.splice(stackSize-1, 1);
						}
						else{
							aTiles.splice(hexIdx, 1);
						}
					}
				}
				//outline actions
				else if(sketchProp.selElement === 'outline'){
					if(sketchProp.selAction === 'add'){
						//ignore if OL already at this coord
						let hex = aOLs.find(o => {return (o.cX === hmCX && o.cY === hmCY)});
						if(hex){return;}

						//add to array
						aOLs.push({
							cX: hmCX,
							cY: hmCY,
							pX: hmPX,
							pY: hmPY
						});	
					}
					else if(sketchProp.selAction === 'delete'){
						let hexIdx = aOLs.findIndex(o => {return (o.cX === hmCX && o.cY === hmCY)});
						if(hexIdx<0){return;}
						aOLs.splice(hexIdx, 1);
					}
				}
				//highlight actions
				else if(sketchProp.selElement === 'highlight'){
					let hLColor = tempProp.hLColor;
					let hLAlpha = tempProp.hLOpacity;

					if(sketchProp.selAction === 'add'){
						//ignore if HL already at this coord
						let hex = aHLs.find(o => {return (o.cX === hmCX && o.cY === hmCY)});
						if(hex){return;}

						//add to array
						aHLs.push({
							color: hLColor,
							alpha: hLAlpha,
							cX: hmCX,
							cY: hmCY,
							pX: hmPX,
							pY: hmPY
						});
					}
					else if(sketchProp.selAction === 'edit'){
						let hexIdx = aHLs.findIndex(o => {return (o.cX === hmCX && o.cY === hmCY)});
						if(hexIdx<0){return;}
						aHLs[hexIdx].color = tempProp.hLColor;
						aHLs[hexIdx].alpha = tempProp.hLOpacity;
					}
					else if(sketchProp.selAction === 'delete'){
						let hexIdx = aHLs.findIndex(o => {return (o.cX === hmCX && o.cY === hmCY)});
						if(hexIdx<0){return;}
						aHLs.splice(hexIdx, 1);	
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
							aArrows.push({
								color: tempProp.arrowColor,
								weight: tempProp.arrowWeight,
								fcX: tempProp.arrowfcX,
								fcY: tempProp.arrowfcY,
								fpX: tempProp.arrowfpX,
								fpY: tempProp.arrowfpY,
								tcX: hmCX,
								tcY: hmCY,
								tpX: hmPX,
								tpY: hmPY,
							});
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
						let hexIdx = aArrows.findIndex(o => {return (o.tcX === hmCX && o.tcY === hmCY)});
						if(hexIdx<0){return;}
						aArrows[hexIdx].color = tempProp.arrowColor;
						aArrows[hexIdx].weight = tempProp.arrowWeight;
					}
					else if(sketchProp.selAction === 'delete'){
						let hexIdx = aArrows.findIndex(o => {return (o.tcX === hmCX && o.tcY === hmCY)});
						if(hexIdx<0){return;}
						aArrows.splice(hexIdx, 1);
					}
				}
				//comment actions
				else if(sketchProp.selElement === 'comment'){
					if(sketchProp.selAction === 'add'){
						//ignore if comment already at this coord
						let hex = aComments.find(o => {return (o.cX === hmCX && o.cY === hmCY)});
						if(hex){return;}
						//add to array
						aComments.push({
							msg: tempProp.commentMsg,
							color: tempProp.commentColor,
							size: tempProp.commentSize,
							font: tempProp.commentFont,
							cX: hmCX,
							cY: hmCY,
							pX: hmPX,
							pY: hmPY
						});
					}
					else if(sketchProp.selAction === 'edit'){
						let hexIdx = aComments.findIndex(o => {return (o.cX === hmCX && o.cY === hmCY)});
						if(hexIdx<0){return;}
						aComments[hexIdx].msg = tempProp.commentMsg;
						aComments[hexIdx].color = tempProp.commentColor;
						aComments[hexIdx].size = tempProp.commentSize;
						aComments[hexIdx].font = tempProp.commentFont;
					}
					else if(sketchProp.selAction === 'move'){
						if(tempProp.moveCommentState){
							let idx = tempProp.moveCommentIdx;
							aComments[idx].cX = hmCX;
							aComments[idx].cY = hmCY;
							aComments[idx].pX = hmPX;
							aComments[idx].pY = hmPY;
							tempProp.moveCommentState = false;
						}
						else{
							let hexIdx = aComments.findIndex(o => {return (o.cX === hmCX && o.cY === hmCY)});
							if(hexIdx<0){return;}
							tempProp.moveCommentIdx = hexIdx;
							tempProp.moveCommentState = true;
						}
					}
					else if(sketchProp.selAction === 'delete'){
						let hexIdx = aComments.findIndex(o => {return (o.cX === hmCX && o.cY === hmCY)});
						if(hexIdx<0){return;}
						aComments.splice(hexIdx, 1);
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

				//get column
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
				else if(type === 'tile'){
					let colorTile = specProp.colorTile;
					let oriTile = specProp.oriTile;
					if(oriTile === 'pointy'){
						if(colorTile === 'w'){col = 10;}
						else if(colorTile === 'b'){col = 11;}
						else{return null;}
					}
					else if(oriTile === 'flat'){
						if(colorTile === 'w'){col = 12;}
						else if(colorTile === 'b'){col = 13;}
						else{return null;}
					}
					else{return null;}
				}
				else if(type === 'OL'){
					let oriTile = specProp.oriTile;
					if(oriTile === 'pointy'){col = 14;}
					else if(oriTile === 'flat'){col = 15;}
					else{return null;}
				}
				else{return null;}
				
				//get row
				row = parseInt(palette);
				if(isNaN(row)){row = 0;}
				if(row < 0 || row > 15){row = 0;}

				//source img
				let x = col * imgSide;
				let y = row * imgSide;
				return {x:x, y:y};
			}

		}, div);
	}
}