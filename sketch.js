let jogo = new Array(3).fill(0).map(() => new Array(3).fill(0));
let player = 1;

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(150);
}

function draw() {
	background(255);
	drawMatrix(jogo, 0, 0, width, height);
	if (endgame(jogo) !== false) {
		(endgame(jogo) === 2) ? background(255, 0, 0): (endgame(jogo) === 1) ? background(0, 255, 0) : background(200);
		drawMatrix(jogo, 0, 0, width, height);
		noStroke();
		fill(0);
		textAlign(CENTER)
		textSize(50);
		text("Click to restart", width / 2, height / 2);
	} else if (player === 2) {
		let all = true;
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				if (jogo[i][j] !== 0) all = false;
			}
		}
		if (all) {
			player = 1;
			jogo[0][0] = 2;
		} else {
			let {
				i,
				j
			} = calculateNextMove();
			if (jogo[i][j] === 0) {
				jogo[i][j] = 2;
				player = 1;
			} else {
				console.error("olokomeu");
			}
		}
	}
}

function gamepos(x, y) {
	return {
		j: floor(x / (width / 3)),
		i: floor(y / (height / 3))
	};
}

function mousePressed() {
	if (endgame(jogo) !== false) {
		jogo = new Array(3).fill(0).map(() => new Array(3).fill(0));
	} else
	if (player === 1 && endgame(jogo) === false) {
		const {
			i,
			j
		} = gamepos(mouseX, mouseY);
		if (jogo[i][j] === 0) {
			jogo[i][j] = 1;
			player++;
		}
	}
}

function calculateNextMove() {
	let tree = new GenerateTree(jogo);
	tree.scoreTree();
	let m = Math.max(...tree.nodes.map(x => x.score));
	let moves = [];
	for (let node of tree.nodes) {
		if (node.score === m) {
			moves.push(node.matrix);
		}
	}
	let move = moves[Math.floor(Math.random()*moves.length)];
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (jogo[i][j] === 0 && move[i][j] === 2) {
				return {
					i,
					j
				};
			}
		}
	}
	console.error("Algo de errado não está certo!")
	return {
		i: -1,
		j: -1
	};
}

class GenerateTree {
	constructor(matrix, player = 1) {
		this.matrix = copym(matrix);
		this.nodes = [];
		this.player = 1 + ((player++) % 2);
		this.score = null;
		let win = endgame(this.matrix);
		if (win !== false) {
			//fim de jogo
			this.score = (win === 1) ? -1 : (win === 0) ? 0 : 1;
		} else {
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					if (matrix[i][j] === 0) {
						let nmatrix = copym(matrix);
						nmatrix[i][j] = this.player;
						this.nodes.push(new GenerateTree(nmatrix, player));
					}
				}
			}
		}
	}
	// draw(x, y, w, h) {
	// 	console.log(x);
	// 	for (let i = 0; i < this.nodes.length; i++) {
	// 		stroke(0);
	// 		strokeWeight(1);
	// 		noFill();
	// 		const nx = (this.nodes.length % 2 === 0) ? x - w * (this.nodes.length - 1) / 2 + i * w : x - w / 2 - w * (this.nodes.length - 2) / 2 + i * w;
	// 		line(x + w / 2, y + h / 2, nx + w / 2, y + h * 1.2);
	// 		this.nodes[i].draw(nx, y + h * 1.2, w, h);
	// 	}
	// 	drawMatrix(this.matrix, x, y, w, h);

	// }
	scoreTree() {
		for (let i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i].score === null) {
				this.nodes[i].scoreTree();
			}
		}
		this.score = (this.player === 1) ? Math.min(...this.nodes.map(x => x.score)) : Math.max(...this.nodes.map(x => x.score));
	}
}

function endgame(matrix) {
	const wins = [
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 4, 8],
		[2, 4, 6]
	]
	let zeros = 0;
	for (let win of wins) {
		let player = null;
		let fim = true;
		for (let k = 0; k < win.length; k++) {
			const i = floor(win[k] / 3);
			const j = win[k] % 3;
			if (matrix[i][j] === 0) zeros++;
			if (player === null && matrix[i][j] !== 0) {
				player = matrix[i][j];
			} else if (player !== matrix[i][j]) {
				fim = false;
			}
		}
		if (fim) return player;
	}
	if (zeros === 0) return 0

	return false;
}

function copym(m) {
	return JSON.parse(JSON.stringify(m));
}

function drawMatrix(m, x, y, w, h) {
	noFill();
	stroke(255, 0, 0);

	rect(x, y, w, h);
	stroke(255, 0, 255);
	strokeWeight(2);
	line(x + w / 3, y, x + w / 3, y + h);
	line(x + 2 * w / 3, y, x + 2 * w / 3, y + h);
	line(x, y + h / 3, x + w, y + h / 3);
	line(x, y + 2 * h / 3, x + w, y + 2 * h / 3);

	stroke(0);
	strokeWeight(2);
	noFill();
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			const ww = w / 3;
			const hh = h / 3;
			const xx = x + j * ww;
			const yy = y + i * hh;
			switch (m[i][j]) {
				case 0:
					break;
				case 1:
					drawO(xx, yy, ww, hh);
					break;
				case 2:
					drawX(xx, yy, ww, hh);
					break;
				default:
					console.error(m[i][j]);
			}
		}
	}
}

function drawX(x, y, w, h) {
	const s = min(w, h) * 0.8;
	line(x + (w - s) / 2, y + (h - s) / 2, x + s + (w - s) / 2, y + s + (h - s) / 2);
	line(x + s + (w - s) / 2, y + (h - s) / 2, x + (w - s) / 2, y + s + (h - s) / 2);
}

function drawO(x, y, w, h) {
	const s = min(w, h) * 0.8;
	ellipse(x + (w - s) / 2 + s / 2, y + (h - s) / 2 + s / 2, s);
}
