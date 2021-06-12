var initialize = function() {
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");

	const fps = 60;
	const numPoints = 5;
	const speed = 5;
	const waterLevel = 150;
	// var fadeSpeed = 3;

	// var t = new Array();
	let p = new Array();
	const pointDistance = canvas.width / numPoints;
	const waterBaselineY = canvas.height - waterLevel;

	let position = 0;

	for (i=0;i<=numPoints;i++) {
		p[i] = new Array();
		p[i].x = position;
		p[i].y = waterBaselineY;

		position += pointDistance;
	}

	var drawFrame = function() {
		context.beginPath();
		context.fillStyle = context.strokeStyle = "#0feDb7";
		context.clearRect(0, 0, canvas.width, canvas.height);

		for (i=0;i<p.length;i++) {
			if (i==0) context.moveTo(p[i].x,p[i].y);
			else context.lineTo(p[i].x,p[i].y);
		}

		context.lineTo(canvas.width, canvas.height);
		context.lineTo(0, canvas.height);
		// context.lineTo(0,0);

		context.closePath();
		context.stroke();
		context.fill();
	}

	setInterval(function() { drawFrame() }, 1000 / fps)
}
