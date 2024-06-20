import {
	drainPoints,
	drawLaserPen,
	IOriginalPointData,
	setColor,
	setDelay,
	setMaxWidth,
	setMinWidth,
	setOpacity,
	setRoundCap,
	setTension,
} from 'laser-pen';
import chroma from 'chroma-js';

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let tracks: IOriginalPointData[] = [];
let animationFrameId: number | null = null;

const colorA = chroma.lch(84, 96, 95);
const colorB = chroma.lch(77, 56, 178);

function handleMouseMove(event: MouseEvent) {
	if (!canvas || !ctx) return;

	const rect = canvas.getBoundingClientRect();

	tracks.push({
		x: event.clientX - rect.x,
		y: event.clientY - rect.y,
		time: Date.now(),
	});
}

function startLaser() {
	if (canvas || ctx) return;

	canvas = document.createElement('canvas');
	canvas.id = `laser-canvas-${Date.now()}`;
	canvas.style.position = 'fixed';
	canvas.style.top = '0';
	canvas.style.left = '0';
	canvas.style.width = '100vw';
	canvas.style.minWidth = '100vw';
	canvas.style.height = '100vh';
	canvas.style.minHeight = '100vh';
	canvas.style.pointerEvents = 'none';
	canvas.style.zIndex = '999999';
	document.body.appendChild(canvas);

	ctx = canvas.getContext('2d');

	resizeCanvas();

	document.addEventListener('mousemove', handleMouseMove);

	setDelay(400);
	setMaxWidth(8);
	setMinWidth(1);
	setTension(0.1);
	setOpacity(0);
	setRoundCap(true);

	draw();
}

function stopLaser() {
	if (!canvas || !ctx) return;

	document.body.removeChild(canvas);
	canvas = null;
	ctx = null;
	tracks = [];

	document.removeEventListener('mousemove', handleMouseMove);

	if (animationFrameId !== null) {
		window.cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}
}

function resizeCanvas() {
	if (!canvas) return;

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

function draw() {
	if (!canvas || !ctx) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	tracks = drainPoints(tracks);

	if (tracks.length >= 3) {
		const [r, g, b] = chroma
			.mix(colorA, colorB, (Date.now() % 2000) / 2000, 'lch')
			.rgb();
		setColor(r, g, b);

		drawLaserPen(ctx, tracks);
	}

	animationFrameId = window.requestAnimationFrame(draw);
}

window.addEventListener('toggleLaser' as any, (event: CustomEvent) => {
	const { enable } = event.detail;

	if (enable) {
		startLaser();
	} else {
		stopLaser();
	}
});

window.addEventListener('resize', resizeCanvas);
