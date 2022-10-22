let Timer = class {
	constructor() {
		
		this.startDate = null;
		this.totalTime = null;
		
		this.uiUpdateTimeout = this.uiUpdateTimeoutMax = 5;
		
		this.initialised=false;
		this.init();
	}
	
	init() {
		this.start();
	}
	
	reduceUITimout() {
		this.uiUpdateTimeout--;
		
		if (!this.uiUpdateTimeout) {
			this.uiUpdateTimeout=this.uiUpdateTimeoutMax;
			this.updateUI();
		};
	}

	start() {
		this.startDate = new Date();
		this.initialised=true;
	}
	
	
	stop() {
		this.totalTime = new Date() - this.startDate;
	}
	
	update() {
		if (!this.initialised) return false;
		if (this.totalTime) return; // if we have a total time, the game has ended, ignore update fn
		this.reduceUITimout();
	}
	
	updateUI() {
		let puzzle = vars.game.puzzle;
		let timer = puzzle.timerText;
		
		let ms = new Date() - this.startDate;
		let seconds = (ms/10|0)/100;
		timer.setText(`${seconds}s`);
	}
}