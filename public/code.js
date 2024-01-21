// import { AppMeta, AppMetaObjects, appInstance } from "./app-meta.mjs";

let el_desktop = document.querySelector(".desktop");
let el_date_time = document.querySelector(".desktop .taskbar .date-time ");
let el_fullscreen = document.querySelector(".desktop .taskbar .fullscreen ");
let el_start = document.querySelector(".desktop .taskbar .start");
let el_start_menu = document.querySelector(".desktop .taskbar .start-menu");
let el_desktop_screen = document.querySelector(".desktop .screen");
let el_right_click_menu = document.querySelector(
	".desktop .screen .right-click-menu"
);
let el_taskbar = document.querySelector(".desktop .taskbar");
let el_taskbar_left = document.querySelector(".desktop .taskbar .left");

let flags = {
	date_time: false,
};

window.onload = () => {
	// console.log(AppMetaObjects);

	setDateTime();
	setInterval(setDateTime, 1000);
	document
		.getElementsByClassName("date-time")[0]
		.addEventListener("click", () => {
			flags.date_time = !flags.date_time;
		});

	// prevent all right clicks in page
	document
		.getElementsByClassName("desktop")[0]
		.addEventListener("contextmenu", (event) => {
			event.preventDefault();
		});

	// screen left click
	el_desktop_screen.addEventListener(
		"click",
		(event) => {
			event.preventDefault();
			el_right_click_menu.classList.remove("show");
			el_start_menu.classList.remove("show-grid");
		},
		false
	);

	// screen right click
	el_desktop_screen.addEventListener(
		"contextmenu",
		screenRightClickAction,
		false
	);

	// right_click_menu on click
	el_right_click_menu.addEventListener("click", (event) => {
		event.preventDefault();
		event.stopPropagation();
	});

	// start menu toggle
	el_start.addEventListener("click", startMenuToggle);

	// fullscreen taskbar-button
	el_fullscreen.addEventListener("click", fullscreen.handler);
	// window.addEventListener('resize',fullscreen.updateDisplayOnly)

	// event delegated open-apps move
	el_desktop_screen.onmousedown = screenActionHandler;
	el_desktop_screen.ontouchstart = screenActionHandler;

	// event delegated - start menu actions handler
	el_start_menu.onmousedown = startMenuActionHandler;

	el_taskbar_left.onmousedown = taskbarLeftActionHandler;
};

function setDateTime() {
	let now = new Date();
	let hours = now.getHours() % 12;
	let ampm = parseInt(now.getHours() / 12);
	let minutes = now.getMinutes();
	let seconds = now.getSeconds();
	let date = now.getDate();
	let month = now.getMonth();
	let year = now.getFullYear();

	let months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];

	el_date_time.innerHTML = flags.date_time
		? `<p>${hours}:${minutes} ${ampm ? "PM" : "AM"}</p>
        <p>${date}-${months[month]}-${year}`
		: `<p>${now.getHours()}:${minutes}:${seconds.toString().length == 1 ? `0${seconds}` : seconds
		}</p>
        <p>${date}-${months[month]}-${year}`;
}

function screenRightClickAction(event) {
	event.preventDefault();
	event.stopPropagation();
	let elStyle = getComputedStyle(el_right_click_menu);
	let [x, y, screenWidth, screenHeight, rcMenuWidth, rcMenuHeight] = [
		event.clientX,
		event.clientY,
		el_desktop_screen.offsetWidth,
		el_desktop_screen.offsetHeight,
		el_right_click_menu.offsetWidth,
		el_right_click_menu.offsetHeight,
	];

	rcMenuHeight =
		rcMenuHeight == 0 ? parseInt(elStyle.height.split("px")[0]) : rcMenuHeight;
	rcMenuWidth =
		rcMenuWidth == 0 ? parseInt(elStyle.width.split("px")[0]) : rcMenuWidth;

	if (screenHeight > rcMenuHeight + y) {
		el_right_click_menu.style.top = y + "px";
		el_right_click_menu.style.bottom = "unset";
	} else {
		el_right_click_menu.style.top = "unset";
		el_right_click_menu.style.bottom = screenHeight - y + "px";
		console.log("Y " + (screenHeight - y));
	}

	if (screenWidth > rcMenuWidth + x) {
		el_right_click_menu.style.left = x + "px";
		el_right_click_menu.style.right = "unset";
	} else {
		el_right_click_menu.style.right = screenWidth - x + "px";
		el_right_click_menu.style.left = "unset";
		console.log(x, rcMenuWidth, screenWidth, "X right : " + (screenWidth - x));
	}
	el_right_click_menu.classList.add("show");
	return false;
}

let fullscreen = {
	flag: false,
	handler: () => {
		flag = true;
		setTimeout(() => (flag = false), 1000);
		if (window.innerHeight === screen.height) {
			// The browser is in fullscreen mode
			el_fullscreen.children[0].classList.remove("hide"); //full
			el_fullscreen.children[1].classList.add("hide"); //exit-full
			document.exitFullscreen().catch(() => { });
		} else {
			// The browser is NOT in fullscreen mode
			el_desktop.requestFullscreen().then(() => {
				el_fullscreen.children[0].classList.add("hide"); //full
				el_fullscreen.children[1].classList.remove("hide"); //exit-full
			});
		}
	},
	updateDisplayOnly: () => {
		if (flag) return;
		if (window.innerHeight === screen.height) {
			// The browser is in fullscreen mode
			el_fullscreen.children[0].classList.remove("hide"); //full
			el_fullscreen.children[1].classList.add("hide"); //exit-full
		} else {
			// The browser is NOT in fullscreen mode
			el_fullscreen.children[0].classList.add("hide"); //full
			el_fullscreen.children[1].classList.remove("hide"); //exit-full
		}
	},
};

function screenActionHandler(e) {
	let target = e.target;
	let flag = true;
	while (!target.classList.contains("screen") && flag) {
		flag = false;
		if (target.classList.contains("app-action-min")) {
			AppInstance.__appInstanceStore[ target.parentElement.dataset.instanceId ].minimizeWindow();
		} else if (target.classList.contains("app-action-max")) {
			// maximize to full screen
		} else if (target.classList.contains("app-action-close")) {
			AppInstance.__appInstanceStore[target.parentElement.dataset.instanceId].destroy();
		} else if (target.classList.contains("open-app")) {

			AppInstance.__appInstanceStore[target.dataset.instanceId].bringAppToTop();

			if (!target.classList.contains("draggable")) {
				return;
			}

			target.moving = true;

			if (e.clientX) {
				// If they exist then use Mouse input
				target.oldX = e.clientX;
				target.oldY = e.clientY;
			} else {
				// Otherwise use touch input
				// Since there can be multiple touches, you need to mention which touch to look for, we are using the first touch only in this case
				target.oldX = e.touches[0].clientX;
				target.oldY = e.touches[0].clientY;
			}

			target.oldLeft =
				window
					.getComputedStyle(target)
					.getPropertyValue("left")
					.split("px")[0] * 1;
			target.oldTop =
				window.getComputedStyle(target).getPropertyValue("top").split("px")[0] *
				1;

			el_desktop_screen.onmousemove = dr;
			el_desktop_screen.addEventListener("touchmove", dr, { passive: false });

			function dr(event) {
				event.preventDefault();

				if (!target.moving) {
					return;
				}
				if (event.clientX) {
					target.distX = event.clientX - target.oldX;
					target.distY = event.clientY - target.oldY;
				} else {
					target.distX = event.touches[0].clientX - target.oldX;
					target.distY = event.touches[0].clientY - target.oldY;
				}

				target.style.left = target.oldLeft + target.distX + "px";
				target.style.top = target.oldTop + target.distY + "px";
			}

			function endDrag() {
				target.moving = false;
				el_desktop_screen.onmousemove = null;
				el_desktop_screen.removeEventListener("touchmove", dr);
			}
			target.onmouseup = endDrag;
			target.ontouchend = endDrag;
		} else if ( target.classList.contains("file-container") && target.classList.contains("resume") ){
			new AppInstance(app_resume);
		}else {
			flag = true;
			target = target.parentElement;
		}
	}
}

function startMenuToggle() {
	if (el_start_menu.classList.contains("show-grid"))
		el_start_menu.classList.remove("show-grid");
	else el_start_menu.classList.add("show-grid");
}

function startMenuActionHandler(e) {
	let target = e.target;
	let flag = true;
	while (!target.classList.contains("start-menu") && flag) {
		flag = false;
		if (target.classList.contains("calculator")) {
			new AppInstance(app_calculator);
		}else
		if (target.classList.contains("camera")){
			new AppInstance(app_camera); 
		} else {
			flag = true;
			target = target.parentElement;
		}
	}
	startMenuToggle();
}

function taskbarLeftActionHandler(e) {
	let target = e.target;
	let flag = true;
	while (!target.classList.contains("left") && flag) {
		flag = false;
		if (target.classList.contains("app-is-open")) {
			id = target.dataset.instanceId;
			AppInstance.__appInstanceStore[ id ].toggleWindow();
		} else {
			flag = true;
			target = target.parentElement;
		}
	}
	// startMenuToggle();
}

class AppMeta {
	constructor(appMetaName, appMetaURL, appMetaIconName, width = 0, height = 0) {
		this.name = appMetaName;
		this.URL = appMetaURL;
		this.iconClass = appMetaIconName;
		this.width = width;
		this.height = height;
	}
}

const app_calculator = new AppMeta("Calculator", "/apps/calculator", "icon-calculator", 400, 534);
const app_camera = new AppMeta("Camera", "/apps/camera", "icon-camera", 500, 400);
const app_resume = new AppMeta("Resume.pdf", "/apps/resume/resume.pdf", "icon-pdf", 600, 820);

const app_clock = new AppMeta("Clock", "/apps/clock", "icon-clock", 200, 200);
const app_photos = new AppMeta("Photos", "/apps/photos", "icon-photos");
const app_fileExplorer = new AppMeta("File explorer", "/apps/fileExplorer", "icon-launcher");
const app_browser = new AppMeta("Browser", "/apps/browser", "icon-browser");
const app_budgetEZ = new AppMeta("BudgetEZ", "/apps/BudgetEZ", "icon-budget");
const DefaultAppMetaObjects = [
	app_calculator,
	app_clock,
	app_camera,
	app_photos,
	app_fileExplorer,
	app_browser,
	app_budgetEZ,
	app_resume,
];
let AppMetaObjects = [...DefaultAppMetaObjects];

class AppInstance {

	// ----------------------------------------------------------------------------------------- //
	// STATIC SCOPE

	static __instanceIdCounter = 0;
	static __appInstanceStore = {};
	static __app_lastGreatestZindex = 1;
	static __windowState={
		MINIMIZED:"MINIMIZED",
		WINDOWED:"WINDOWED",
		MAXIMIZED:"MAXIMIZED",
		FULLSCREEN:"FULLSCREEN",
	}
	static __focusedInstanceId=-1;

	static setFocusedId( instanceId ){
		AppInstance.__focusedInstanceId=instanceId;
	}

	static unFocusAnyApp() {
		let focusedTaskbarApp = el_taskbar_left.querySelector(".app-focused");
		if (focusedTaskbarApp)
			focusedTaskbarApp.classList.remove("app-focused");

		let focusedWindowTopbar = el_desktop_screen.querySelector(".topbar.topbar-focused");
		if (focusedWindowTopbar)
			focusedWindowTopbar.classList.remove("topbar-focused");
	}

	static toggleAppVisibility(instanceId) {
		let appInst = AppInstance.__appInstanceStore[id];

		if( !appInst.taskbarApp.classList.contains("app-focused") ){
			appInst.bringAppToTop();
			return;
		}

		let el = AppInstance.__appInstanceStore[instanceId].windowApp;
		let taskbarEl = AppInstance.__appInstanceStore[instanceId].taskbarApp;
		let isMin = el.classList.contains("minimize");
		let isMax = el.classList.contains("maximize");
		if (isMin) {
			// in minimized state; go to maximized state;
			
		} else if (!isMin || isMax) {
			//in maximized state. go to minimized state;
			el.classList.add("minimize");
			taskbarEl.classList.remove("app-focused");
		}
	}
	
	// ----------------------------------------------------------------------------------------- //
	// OBJECT SCOPE

	constructor(appMetaObj, customData = {}) {
		this.instanceId = ++AppInstance.__instanceIdCounter;
		this.appMeta = appMetaObj;
		this.windowApp;
		this.taskbarApp;
		this.data = {
			windowState:AppInstance.__windowState.WINDOWED,
			data:customData
		};
		this.generateOpenAppHTML(this);
		this.windowApp.querySelector("iframe").onload = () => {
			this.iframeClickListener = this.windowApp
				.querySelector("iframe")
				.contentWindow.document.addEventListener("click", this.bringAppToTop);
		};

		AppInstance.__appInstanceStore[this.instanceId] = this;
		this.bringAppToTop();
	}

	isFocused(){
		return (AppInstance.__focusedInstanceId === this.instanceId);
	}
	isMinimized(){
		return (this.data.windowState === AppInstance.__windowState.MINIMIZED)
	}
	isWindowed(){
		return (this.data.windowState === AppInstance.__windowState.WINDOWED)
	}
	isMaximized(){
		return (this.data.windowState === AppInstance.__windowState.MAXIMIZED)
	}
	isFullscreen(){
		return (this.data.windowState === AppInstance.__windowState.FULLSCREEN)
	}


	bringAppToTop = () => {
		this.windowApp.style.zIndex = ++AppInstance.__app_lastGreatestZindex;
		AppInstance.unFocusAnyApp();
		this.focusWindow();
	}

	focusWindow(){
		this.windowApp.querySelector(".topbar").classList.add("topbar-focused");
		this.taskbarApp.classList.add("app-focused");
		AppInstance.setFocusedId( this.instanceId );
	}
	unfocusWindow(){
		this.windowApp.querySelector(".topbar").classList.remove("topbar-focused");
		this.taskbarApp.classList.remove("app-focused");
		AppInstance.setFocusedId( this.instanceId );
	}

	minimizeWindow(){
		this.windowApp.classList.add("minimize");
		this.taskbarApp.classList.remove("app-focused");
		this.data.windowState=AppInstance.__windowState.MINIMIZED;
	}
	restoreWindow(){
		// restores to windowed state
		this.windowApp.classList.remove("minimize");
		this.windowApp.classList.add("restoreWindow");
		setTimeout(() => {
			this.windowApp.classList.remove("restoreWindow");
		}, 1100);
		this.taskbarApp.classList.add("app-focused");
		this.data.windowState=AppInstance.__windowState.WINDOWED;
	}
	maximizeWindow(){}
	goFullscreenWindow(){}

	toggleWindow(){
		// this function is the behaviour for "mouseclick"
		// action on taskbarApp.

		if( !this.isFocused() ){
			this.bringAppToTop();
			return;
		}

		if ( this.isMinimized() ) {
			// in minimized state; go to maximized state;
			this.restoreWindow(); // need to handle STATES.
		} else if ( this.isWindowed() ) {
			//in maximized state. go to minimized state;
			this.minimizeWindow();
		}
	}

	generateOpenAppHTML(appInstance) {
		let windowAppHTML = `
            <div class="open-app draggable pop-open" data-instance-id="${appInstance.instanceId}" style="width:${appInstance.appMeta.width}px;height:${appInstance.appMeta.height+40}px">
                <div class="topbar">
                    <div class="left">
                        ${appInstance.appMeta.name}
                    </div>
                    <div class="right" data-instance-id="${appInstance.instanceId}">
                        <div class="app-action-min centerHV">
                            <i class="icon icon-minimize"></i>
                        </div>
                        <div class="app-action-max disable centerHV">
                            <i class="icon icon-maximize"></i>
                        </div>
                        <div class="app-action-close centerHV">
                            <i class="icon icon-close"></i>
                        </div>
                    </div>
                    
                </div>                
    
                <iframe src="${appInstance.appMeta.URL}" >
                    
                </iframe>
            </div>
            `;
		let taskbarAppHTML = `
            <div class="app app-is-open app-focused icon-container hover pop-open" data-instance-id="${appInstance.instanceId}">
            <i class="icon ${appInstance.appMeta.iconClass}"></i>
            </div>
            `;
		let wrapper = document.createElement("div");
		wrapper.innerHTML = windowAppHTML;
		this.windowApp = wrapper.querySelector(".open-app");

		this.windowApp.style.height=this.appMeta.height;
		this.windowApp.style.width=this.appMeta.width;

		wrapper.innerHTML = taskbarAppHTML;
		this.taskbarApp = wrapper.querySelector(".app");

		el_desktop_screen.appendChild(this.windowApp);
		el_taskbar_left.appendChild(this.taskbarApp);

		setTimeout(() => {
			this.windowApp.classList.remove("pop-open");
			this.taskbarApp.classList.remove("pop-open");
		}, 250);
	}
	destroy = () => {
		this.windowApp.classList.add("pop-close");
		this.taskbarApp.classList.add("pop-close");
		setTimeout(() => {
			removeEventListener("click", this.iframeClickListener);
			this.windowApp.remove();
			this.taskbarApp.remove();
			delete AppInstance.__appInstanceStore[this.instanceId];
		}, 250);
	}
}

