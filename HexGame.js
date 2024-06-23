export default class HexGame{
	constructor(id, name){
		this.id = id;
		this.name = name;
	
		this.aStacks = [];
		this.aOLs = [];
		this.aHLs = [];
		this.aArrows = [];
		this.aComments = [];
	
		this.idxMovingComment = -1;
		this.idxMovingStack = -1;
	}
	
	setGameId(id, name){
		this.id = id;
		this.name = name;
	}
	clearAll(){
		this.id = '0';
		this.name = '';
		let lenArray = this.aStacks.length;
		this.aStacks.splice(0, lenArray);
		lenArray = this.aOLs.length;
		this.aOLs.splice(0, lenArray);
		lenArray = this.aHLs.length;
		this.aHLs.splice(0, lenArray);
		lenArray = this.aArrows.length;
		this.aArrows.splice(0, lenArray);
		lenArray = this.aComments.length;
		this.aComments.splice(0, lenArray);
		this.idxMovingComment = -1;
		this.idxMovingStack = -1;
	}
	copyAll(aGame){
		//empty all arrays
		this.clearAll();
		//copy all
		this.id = aGame.id;
		this.name = aGame.name;
		let lenArray = aGame.aStacks.length;
		for(let i=0; i<lenArray; i++){this.aStacks.push(aGame.aStacks[i]);}
		lenArray = aGame.aOLs.length;
		for(let i=0; i<lenArray; i++){this.aStacks.push(aGame.aOLs[i]);}
		lenArray = aGame.aHLs.length;
		for(let i=0; i<lenArray; i++){this.aStacks.push(aGame.aHLs[i]);}
		lenArray = aGame.aArrows.length;
		for(let i=0; i<lenArray; i++){this.aStacks.push(aGame.aArrows[i]);}
		lenArray = aGame.aComments.length;
		for(let i=0; i<lenArray; i++){this.aStacks.push(aGame.aComments[i]);}
		this.idxMovingComment = -1;
		this.idxMovingStack = -1;
	}
	addTile(cX, cY, pX, pY, fig, col, mrk){
		//find stack
		let idxStack = this.aStacks.findIndex(o => {return (o.cX == cX && o.cY == cY);});
		//(make stack if needed) add tile to stack
		if(idxStack<0){
			let newStack = new Stack(cX, cY, pX, pY);
			newStack.tiles.push(new Tile(fig, col, mrk));
			this.aStacks.push(newStack);
		}
		else{
			this.aStacks[idxStack].tiles.push(new Tile(fig, col, mrk));
		}
	}
	editTile(cX, cY, fig, col){
		let idxStack = this.aStacks.findIndex(o => {return (o.cX == cX && o.cY == cY);});
		if(idxStack<0){return;}
		
		let stackSize = this.aStacks[idxStack].tiles.length;
		if(stackSize<1){return;}
		this.aStacks[idxStack].tiles[stackSize-1].figure = fig;
		this.aStacks[idxStack].tiles[stackSize-1].color = col;
		this.aStacks[idxStack].tiles[stackSize-1].mark = mrk;
	}
	deleteTile(cX, cY){
		let idxStack = this.aStacks.findIndex(o => {return (o.cX == cX && o.cY == cY);});
		if(idxStack<0){return;}
						
		let stackSize = this.aStacks[idxStack].tiles.length;
		if(stackSize>1){
			this.aStacks[idxStack].tiles.splice(stackSize-1, 1);
		}
		else{
			this.aStacks.splice(idxStack, 1);
		}
	}
	sortTilesCX(){this.aStacks.sort((a, b) => a.cX - b.cX);}
	sortTilesCY(){this.aStacks.sort((a, b) => a.cY - b.cY);}
	moveTile(cX, cY, pX, pY){
		if(this.idxMovingStack<0){
			this.moveStartTile(cX, cY);	
		}
		else{
			this.moveEndTile(cX, cY, pX, pY);
		}
	}
	moveStartTile(cX, cY){
		let idxStack = this.aStacks.findIndex(o => {return (o.cX == cX && o.cY == cY);});
		if(idxStack<0){return;}
		if(this.aStacks[idxStack].tiles.length==0){return;}//should never happen but still
		this.idxMovingStack = idxStack;
	}
	moveEndTile(cX, cY, pX, pY){
		if(this.idxMovingStack>=0){
			let oldIdx = this.idxMovingStack;
			let oldStackSize = this.aStacks[oldIdx].tiles.length;
			let newIdx = this.aStacks.findIndex(o => {return (o.cX == cX && o.cY === cY);});
			//ignore if same coord
			if(oldIdx == newIdx){this.idxMovingStack=-1; return;}
			//no stack at new coord
			if(newIdx<0){
				//not only tile in old stack
				if(oldStackSize>1){
					//add new stack with new tile
					let newStack = new Stack(cX, cY, pX, pY);
					newStack.tiles.push(this.aStacks[oldIdx].tiles[oldStackSize-1]);
					this.aStacks.push(newStack);
					//delete from old stack
					this.aStacks[oldIdx].tiles.splice(oldStackSize-1, 1);
				}//only tile in old stack
				else{
					//change coords and pos
					this.aStacks[oldIdx].cX = cX;
					this.aStacks[oldIdx].cY = cY;
					this.aStacks[oldIdx].pX = pX;
					this.aStacks[oldIdx].pY = pY;
				}
			}//already a stack at new coord
			else{
				this.aStacks[newIdx].tiles.push(this.aStacks[oldIdx].tiles[oldStackSize-1]);
				//not only tile in old stack
				if(oldStackSize>1){
					this.aStacks[oldIdx].tiles.splice(oldStackSize-1, 1);
				}//only tile in old stack
				else{
					this.aStacks.splice(oldIdx, 1);
				}
			}
		}
		this.idxMovingStack = -1;
	}
	//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	addOL(cX, cY, pX, pY){
		//ignore if OL already at this coord
		let foundOL = this.aOLs.find(o => {return (o.cX == cX && o.cY == cY);});
		if(foundOL){return;}

		//add to array
		this.aOLs.push(new OL(cX, cY, pX, pY));	
	}
	deleteOL(cX, cY){
		let idxOL = this.aOLs.findIndex(o => {return (o.cX == cX && o.cY == cY);});
		if(idxOL<0){return;}
		this.aOLs.splice(idxOL, 1);
	}
	//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	addHL(cX, cY, pX, pY, col, a){
		//ignore if HL already at this coord
		let foundHL = this.aHLs.find(o => {return (o.cX == cX && o.cY == cY);});
		if(foundHL){return;}
		//add to array
		this.aHLs.push(new HL(cX, cY, pX, pY, col, a));
	}
	editHL(cX, cY, col, a){
		let idxHL = this.aHLs.findIndex(o => {return (o.cX == cX && o.cY == cY);});
		if(idxHL<0){return;}
		this.aHLs[idxHL].color = col;
		this.aHLs[idxHL].alpha = a;
	}
	deleteHL(cX, cY){
		let idxHL = this.aHLs.findIndex(o => {return (o.cX == cX && o.cY == cY);});
		if(idxHL<0){return;}
		this.aHLs.splice(idxHL, 1);	
	}
	//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	addArrow(fcX, fcY, fpX, fpY, tcX, tcY, tpX, tpY, col, w){
		this.aArrows.push(new Arrow(fcX, fcY, fpX, fpY, tcX, tcY, tpX, tpY, col, w));
	}
	editArrow(cX, cY, col, w){
		let idxArrowT = this.aArrows.findIndex(o => {return (o.tcX == cX && o.tcY == cY);});
		if(idxArrowT<0){return;}
		this.aArrows[idxArrowT].color = col;
		this.aArrows[idxArrowT].weight = w;
	}
	deleteArrow(cX, cY){
		let idxArrowT = this.aArrows.findIndex(o => {return (o.tcX == cX && o.tcY == cY);});
		if(idxArrowT<0){return;}
		this.aArrows.splice(idxArrowT, 1);
	}
	//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	addComment(cX, cY, pX, pY, msg, col, size, font){
		//ignore if comment is empty
		if(msg===''){return;}
		//ignore if comment already at this coord
		let foundComment = this.aComments.find(o => {return (o.cX == cX && o.cY == cY);});
		if(foundComment){return;}
		//add to array
		this.aComments.push(new Comment(cX, cY, pX, pY, msg, col, size, font));
	}
	editComment(cX, cY, msg, col, size, font){
		let idxComment = this.aComments.findIndex(o => {return (o.cX == cX && o.cY == cY);});
		if(idxComment<0){return;}
		this.aComments[idxComment].msg = msg;
		this.aComments[idxComment].color = col;
		this.aComments[idxComment].size = size;
		this.aComments[idxComment].font = font;
	}
	deleteComment(cX, cY){
		let idxComment = this.aComments.findIndex(o => {return (o.cX == cX && o.cY == cY);});
		if(idxComment<0){return;}
		this.aComments.splice(idxComment, 1);
	}
	moveComment(cX, cY, pX, pY){
		if(this.idxMovingComment<0){
			this.moveStartComment(cX, cY);
		}
		else{
			this.moveEndComment(cX, cY, cX, cY);
		}
	}
	moveStartComment(cX, cY){
		let idxComment = this.aComments.findIndex(o => {return (o.cX == cX && o.cY == cY);});
		if(idxComment<0){return;}
		this.idxMovingComment = idxComment;
	}
	moveEndComment(cX, cY, pX, pY){
		let idxComment = this.aComments.findIndex(o => {return (o.cX == cX && o.cY == cY);});
		if(idxComment>=0){return;}
		this.aComments[this.idxMovingComment].cX = cX;
		this.aComments[this.idxMovingComment].cY = cY;
		this.aComments[this.idxMovingComment].pX = pX;
		this.aComments[this.idxMovingComment].pY = pY;
		this.idxMovingComment = -1;
	}
}

class Tile{
	constructor(figure, color, mark){
		this.figure = figure;
		this.color = color;
		this.mark = mark;
	}
}
class Stack{
	constructor(cX, cY, pX, pY){
		this.tiles = [];
	
		this.cX = cX;
		this.cY = cY;
		this.pX = pX;
		this.pY = pY;
	}
}

class OL{
	constructor(cX, cY, pX, pY){
		this.cX = cX;
		this.cY = cY;
		this.pX = pX;
		this.pY = pY;
	}
}

class HL{
	constructor(cX, cY, pX, pY, col, a){
		this.color = col;
		this.alpha = a;

		this.cX = cX;
		this.cY = cY;
		this.pX = pX;
		this.pY = pY;
	}
}

class Arrow{
	constructor(fcX, fcY, fpX, fpY, tcX, tcY, tpX, tpY, col, w){
		this.color = col;
		this.weight = w;

		this.fcX = fcX;
		this.fcY = fcY;
		this.fpX = fpX;
		this.fpY = fpY;
		
		this.tcX = tcX;
		this.tcY = tcY;
		this.tpX = tpX;
		this.tpY = tpY;
		
	}
}

class Comment{
	constructor(cX, cY, pX, pY, msg, col, size, font){
		this.msg = msg;
		this.color = col;
		this.size = size;
		this.font = font;

		this.cX = cX;
		this.cY = cY;
		this.pX = pX;
		this.pY = pY;
	}
}