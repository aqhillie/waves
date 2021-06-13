var initialize = function() {
	const canvas = document.getElementById("canvas");
	const context = canvas.getContext("2d");

	const fps = 120;
	const numPoints = 300;
	const waterLevel = 150;
	const rockSize = 10;

	// Wave Constants
	const waveTension = 0.01;
	const waveDampening = 0.0025;
	const waveSpread = rockSize * .01;

	var p = new Array();
	const pointDistance = canvas.width / (numPoints - 1);
	const waterBaselineY = canvas.height - waterLevel;

	let position = 0;

	for (let i =0 ;i < numPoints; i++) {
		p[i] = new Object();
		p[i].x = position;
		p[i].y = waterBaselineY
		p[i].targetY = waterBaselineY;
		p[i].speed = 0;
		position += pointDistance;
	}

	const updatePoint = point => {
		let x = point.targetY - point.y;
		point.speed += waveTension * x - point.speed * waveDampening;
		point.y += point.speed;
	}

	const drawCircle = (p, radius, strokeColor, fillColor = strokeColor) => {
		context.beginPath();
		context.strokeStyle = strokeColor;
		context.fillStyle = fillColor;
		context.arc(p.x, p.y, radius, 0, 2 * Math.PI);
		context.fill();
		context.stroke();
		context.closePath();
	}

	const Splash = (xPosition, speed) => {
		let index = clamp(xPosition / pointDistance, 0, p.length - 1);

		console.log(index);
		console.log(Math.round(index));

		p[Math.round(index)].speed = speed;

		setTimeout(() => { createNewRock() }, Math.random() * 1000);
	}

	const updateWater = () => {
		for (let i = 0; i < p.length; i++) {
			updatePoint(p[i]);
		}

		let leftDeltas = new Array();
		let rightDeltas = new Array();

		// spread wave to nearby points
		for (let j = 0; j < 8; j++) {
			for (let i = 0; i < p.length; i++) {
				if (i > 0) {
					leftDeltas[i] = waveSpread * (p[i].y - p[i - 1].y);
					p[i - 1].speed += leftDeltas[i];
				}
				if (i < p.length - 1) {
					rightDeltas[i] = waveSpread * (p[i].y - p[i + 1].y);
					p[i + 1].speed += rightDeltas[i];
				}
			}

			for (let i = 0; i < p.length; i++) {
				if (i > 0) {
					p[i - 1].y += leftDeltas[i];
				}
				if (i < p.length - 1) {
					p[i + 1].y += rightDeltas[i];
				}
			}
		}


	}

	const drawFrame = () => {
		context.beginPath();
		context.fillStyle = context.strokeStyle = "#0feDb7";
		context.clearRect(0, 0, canvas.width, canvas.height);

		for (i=0;i<p.length;i++) {
			if (i==0) context.moveTo(p[i].x,p[i].y);
			else context.lineTo(p[i].x,p[i].y);
		}

		context.lineTo(canvas.width, canvas.height);
		context.lineTo(0, canvas.height);
	
		context.closePath();
		context.stroke();
		context.fill();

		updateRocks();
		updateWater();
	}

	var rocks = new Array();

	const createNewRock = () => {
		let rock = new Object();

		rock.x = Math.random() * canvas.width;
		rock.y = 0;
		rock.speed = 1;
		rock.size = 10;
		rock.isUnderWater = false;

		rocks.push(rock);
	}

	const updateRocks = () => {
		for (let i = 0; i < rocks.length; i++) {
			let rock = rocks[i];

			drawCircle(rock, rock.size, 'black');

			if (rock.isUnderWater) {
				rock.y += 1;
			} else {
				rock.y += rock.speed;
				rock.speed *= 1.1;	
			}
	
			if (!rock.isUnderWater && rock.y >= waterBaselineY) {
				rock.isUnderWater = true;
				Splash(rock.x, rock.speed * 2);
			}	
		}
	}

	createNewRock();
	setInterval(function() { drawFrame() }, 1000 / fps)
}
