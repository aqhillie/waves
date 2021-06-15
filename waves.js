var initialize = function() {
	const canvas = document.getElementById("canvas");
	const context = canvas.getContext("2d");

	const fps = 60;
	const numPoints = 80;
	const waterLevel = 150;
	const rockSize = 10;

	const gravity = 9.81 / fps;

	// Water Constants
	const waterDensity = 3;

	// Wave Constants
	const waveTension = 0.02;
	const waveDampening = 0.004;
	const waveSpread = (rockSize * .02) / (300 / numPoints);

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

	const drawRock = (rock, strokeColor, fillColor = strokeColor) => {
		context.beginPath();
		context.strokeStyle = strokeColor;
		context.fillStyle = fillColor;
		context.moveTo(rock.x - rock.width / 2, rock.y - rock.height / 2);
		context.lineTo(rock.x + rock.width / 2, rock.y - rock.height / 2);
		context.lineTo(rock.x + rock.width / 2, rock.y + rock.height / 2);
		context.lineTo(rock.x - rock.width / 2, rock.y + rock.height / 2);
		context.fill();
		context.stroke();
		context.closePath();
	}

	const fractionalPointAt = xPosition => {
		return clamp(xPosition / pointDistance, 0, p.length - 1);
	}

	const closestPointAt = xPosition => {
		return Math.round(fractionalPointAt(xPosition));
	}

	const averageWaterLevelAt = xPosition => {
		let index = fractionalPointAt(xPosition);

		return (index % 1 === 0) ? index : ((p[Math.floor(index)].y + p[Math.ceil(index)].y) /2);
	}

	const Splash = (obj, speed) => {
		// let start = Math.floor(fractionalPointAt(obj.x - obj.width / 2));
		// let end = Math.ceil(fractionalPointAt(obj.x + obj.width / 2));

		// for (let i = start; i <= end; i++) {
		// 	p[i].speed = -speed;
		// }

		p[closestPointAt(obj.x)].speed = speed;

		// setTimeout(() => { createNewRock() }, Math.random() * 1000);
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

	var rock = null;

	const createNewRock = () => {
		rock = new Object();

		rock.x = canvas.width / 2;
		rock.y = 0;
		rock.ySpeed = 0;
		rock.width = 20;
		rock.height = 20;
		rock.acceleration = 0;
		rock.isUnderWater = false;
		rock.splashed = false;
		rock.timesUnderWater = 0;
		rock.stopMoving = false;
	}

	const updateRocks = () => {
		drawRock(rock, 'black');

		if (rock.timesUnderWater > 2) {
			if (rock.stopMoving) {
				rock.y = waterBaselineY;
			} else {
				rock.ySpeed = (averageWaterLevelAt(rock.x) - rock.y) * .25;
				if (Math.abs(rock.ySpeed) < .0003) {
					rock.stopMoving = true;
				}
			}
		} else {
			let dir = rock.ySpeed >= 0 ? 1 : -1;
			let bForce = 0;
			let immersedArea = clamp((rock.y + rock.height / 2) - averageWaterLevelAt(rock.x), 0, rock.height);
			let drag = 0;
	
			if (immersedArea > 0) {
				drag = .7;
			}

			let fluidDensity = null;

			switch(rock.timesUnderWater) {
				case 1:
				case 2:
					fluidDensity = .2;
				default:
					fluidDensity = .3;
			}

			bForce = fluidDensity * immersedArea * -gravity;
	
			rock.acceleration = gravity + bForce + (drag * - dir);
			rock.ySpeed += rock.acceleration;
		}

		rock.y += rock.ySpeed;	

		if (!rock.isUnderWater && rock.y >= averageWaterLevelAt(rock.x)) {
			rock.isUnderWater = true;
			rock.timesUnderWater++;
			if (!rock.splashed) {
				Splash(rock, 100);
				rock.splashed = true;
			}
		} else if (rock.y < averageWaterLevelAt(rock.x)) {
			rock.isUnderWater = false;
		}

	}

	createNewRock();
	setInterval(function() { drawFrame() }, 1000 / fps)
}
