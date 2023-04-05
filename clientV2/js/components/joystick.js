// https://jsfiddle.net/aa0et7tr/5/

export default class Joystick {

	constructor() {
		this.joystick = this.createJoystick(document.getElementById('joystick-wrapper'));
		this.dragStart = null;
	}

	createJoystick(parent) {
		const maxDiff = 100;
		const stick = document.createElement('div');
		stick.classList.add('joystick-stick');

		stick.addEventListener('touchstart', handleMouseDown);
		document.addEventListener('touchmove', handleMouseMove);
		document.addEventListener('touchend', handleMouseUp);

		
		let currentPos = { x: 0, y: 0 };

		var self = this;
		function handleMouseDown(event) {
			stick.style.transition = '0s';
			if (event.changedTouches) {
				self.dragStart = {
				x: event.changedTouches[0].clientX,
				y: event.changedTouches[0].clientY,
			};
			return;
			}
			self.dragStart = {
			x: event.clientX,
			y: event.clientY,
			};

		}

		function handleMouseMove(event) {
			if (self.dragStart === null) {
				return;
			}

			// event.preventDefault();

			if (event.changedTouches) {
				event.clientX = event.changedTouches[0].clientX;
				event.clientY = event.changedTouches[0].clientY;
			}

			const xDiff = event.clientX - self.dragStart.x;
			const yDiff = event.clientY - self.dragStart.y;
			const angle = Math.atan2(yDiff, xDiff);
				const distance = Math.min(maxDiff, Math.hypot(xDiff, yDiff));
				const xNew = distance * Math.cos(angle);
				const yNew = distance * Math.sin(angle);
			stick.style.transform = `translate3d(${xNew}px, ${yNew}px, 0px)`;
			currentPos = { x: xNew, y: yNew };
		}

		function handleMouseUp(event) {
			if (self.dragStart === null) return;
			stick.style.transition = '.2s';
			stick.style.transform = `translate3d(0px, 0px, 0px)`;
			self.dragStart = null;
			currentPos = { x: 0, y: 0 };
		}

		parent.appendChild(stick);
		return {
			getPosition: () => currentPos,
		};
	}
}