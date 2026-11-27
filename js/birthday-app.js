// Modern Birthday App - ES6+ Implementation
// Replaces jQuery-dependent functions with vanilla JavaScript

class BirthdayApp {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.garden = null;
        this.offsetX = 0;
        this.offsetY = 0;
        this.heartPoints = [];
        this.heartAnimation = null;
        this.gardenRenderTimer = null;
        this.gardenAnimationStarted = false;
        this.gardenAnimationComplete = false;
        this.gardenMessagesComplete = false;
        this.gardenCompletionCallbacks = [];
        this.counterTimer = null;
        this.typingState = null;
        this.init();
    }

    init() {
        // Initialize canvas elements when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupCanvas());
        } else {
            this.setupCanvas();
        }
    }

    setupCanvas() {
        const loveHeart = document.getElementById("loveHeart");
        if (loveHeart) {
            this.offsetX = 335;
            this.offsetY = 257.5;
        }

        this.canvas = document.getElementById("garden");
        
        if (this.canvas) {
            // Keep the original 670-by-625 drawing space; CSS scales it proportionally.
            this.canvas.width = 670;
            this.canvas.height = 625;
            
            this.ctx = this.canvas.getContext("2d");
            this.ctx.globalCompositeOperation = "lighter";
            this.garden = new Garden(this.ctx, this.canvas);

            this.adjustContentPosition();
            window.addEventListener("resize", () => this.adjustContentPosition());
        }
    }

    adjustContentPosition() {
        const content = document.getElementById("content");
        if (!content) return;

        if (window.matchMedia("(max-width: 1149px), (max-height: 600px)").matches) {
            content.style.marginTop = "";
            return;
        }

        content.style.marginTop = Math.max((window.innerHeight - content.offsetHeight) / 2, 10) + "px";
    }

    startGardenRenderLoop() {
        if (!this.garden || this.gardenRenderTimer) return;

        this.gardenRenderTimer = setInterval(() => {
            if (this.garden) {
                this.garden.render();
            }
        }, Garden.options.growSpeed);
    }

    // Modern fadeIn replacement for jQuery fadeIn
    fadeIn(element, duration = 3000, callback = null) {
        if (!element) return;
        
        element.style.opacity = 0;
        element.style.display = 'block';
        
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (callback) {
                callback();
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Heart animation functionality with predefined points
    startHeartAnimation(onComplete = null) {
        if (!this.garden) return false;

        if (typeof onComplete === "function") {
            if (this.gardenMessagesComplete) {
                onComplete();
                return true;
            }
            this.gardenCompletionCallbacks.push(onComplete);
        }

        if (this.gardenAnimationStarted) return false;

        this.gardenAnimationStarted = true;
        this.startGardenRenderLoop();
        const interval = 5;
        let angle = 0;
        const heart = [];
        
        this.heartAnimation = setInterval(() => {
            const bloom = this.getHeartPoint(angle);
            let draw = true;
            
            for (let i = 0; i < heart.length; i++) {
                const p = heart[i];
                const distance = Math.sqrt(Math.pow(p[0] - bloom[0], 2) + Math.pow(p[1] - bloom[1], 2));
                if (distance < Garden.options.bloomRadius.max * 1.3) {
                    draw = false;
                    break;
                }
            }
            
            if (draw) {
                heart.push(bloom);
                this.garden.createRandomBloom(bloom[0], bloom[1]);
            }
            
            if (angle >= 982) {
                clearInterval(this.heartAnimation);
                this.heartAnimation = null;
                this.gardenAnimationComplete = true;
                this.showMessages(() => {
                    this.gardenMessagesComplete = true;
                    const callbacks = this.gardenCompletionCallbacks.splice(0);
                    callbacks.forEach((callback) => callback());
                });
            } else {
                angle++;
            }
        }, interval);
    }

    getHeartPoint(angle) {
        const xs = [-223, -221, -216, -214, -211, -207, -198, -191, -184, -177, -165, -159, -154, -145, -138, -131, -119, -108, -94, -85, -78, -69, -62, -55, -48, -39, -32, -25, -18, -7, 0, 12, 18, 28, 32, 39, 46, 53, 60, 67, 71, 78, 85, 92, 97, 104, 113, 120, 124, 134, 138, 145, 152, 159, 166, 173, 177, 184, 191, 196, 200, 207, 209, 214, 214, 216, -218, -223, -228, -234, -239, -244, -248, -251, -255, -257, -260, -262, -262, -260, -255, -251, -248, -239, -234, -232, -225, -218, -211, -205, -200, -193, -188, -182, -172, -165, -159, -152, -145, -140, -133, -126, -119, -110, -103, -97, -87, -80, -74, -67, -62, -55, -46, -39, -32, -23, -14, -7, 0, 7, 14, 18, 28, 37, 44, 51, 58, 65, 71, 78, 85, 92, 99, 106, 113, 120, 127, 134, 138, 143, 150, 157, 163, 170, 177, 184, 191, 198, 205, 209, 219, 223, 230, 235, 239, 246, 251, 251, 258, 260, 260, 262, 260, 255, 248, 242, 237, 230, 225, 219, -216, -223, -228, -228, -230, -232, -232, -228, -223, -218, -216, -209, -207, -202, -198, -195, -188, -182, -172, -165, -159, -149, -142, -136, -131, -126, -119, -113, -106, -99, -94, -90, -83, -78, -71, -67, -60, -53, -44, -37, -25, -16, -9, -5, 2, 9, 16, 25, 32, 37, 44, 48, 55, 65, 69, 76, 83, 90, 99, 106, 115, 122, 127, 134, 140, 145, 150, 157, 161, 166, 168, 175, 182, 186, 193, 198, 205, 209, 214, 219, 221, 225, 225, 225, 225, 221, 216, 212, -209, -202, -200, -195, -191, -188, -186, -179, -172, -165, -159, -152, -145, -138, -133, -129, -124, -117, -110, -103, -97, -90, -83, -78, -71, -64, -57, -50, -44, -37, -30, -25, -18, -9, -2, 5, 14, 21, 28, 37, 41, 51, 58, 67, 71, 78, 85, 94, 101, 111, 117, 124, 131, 136, 140, 145, 154, 159, 163, 168, 175, 182, 186, 196, 200, 209, 209, -216, -216, -216, -216, -216, -216, -216, -216, -216, -216, -214, -214, -214, -214, -211, -211, 212, 212, 212, 212, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, -218, -223, -225, -230, -232, -232, -230, -228, -223, -218, -214, -207, -205, -200, -193, -186, -182, -177, -170, -165, -161, -154, -147, -142, -136, -129, -119, -113, -103, -97, -90, -83, -76, -69, -62, -57, -50, -44, -37, -30, -23, -16, -9, -2, 5, 12, 18, 25, 30, 39, 46, 55, 62, 69, 76, 83, 92, 99, 106, 115, 122, 127, 129, 136, 145, 152, 159, 166, 175, 179, 184, 191, 191, 193, 198, 202, 209, 214, 221, 225, 230, 230, 228, 221, 219, -218, -216, -209, -200, -191, -184, -177, -170, -165, -159, -154, -147, -140, -136, -129, -119, -113, -103, -97, -90, -83, -74, -67, -60, -57, -50, -41, -34, -30, -23, -16, -7, 0, 7, 14, 21, 25, 32, 37, 44, 51, 58, 65, 71, 81, 88, 94, 101, 106, 113, 117, 122, 127, 131, 138, 147, 154, 163, 170, 179, 182, 184, 193, 200, 205, 209, -214, -214, -216, -216, -216, -216, -216, -216, -216, -216, -214, -214, -214, -214, -214, -214, -214, -214, -214, 212, 212, 212, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, -124, -129, -133, -138, -145, -154, -161, -170, -177, -184, -188, -193, -195, -198, -202, -205, -209, -216, -221, -225, -225, -225, -223, -218, -216, -205, -200, -191, -184, -177, -170, -165, -159, -154, -145, -138, -131, -124, -117, -110, -103, -97, -90, -83, -76, -69, -60, -53, -46, -39, -34, -27, -21, -11, -2, 5, 12, 18, 23, 30, 35, 44, 51, 60, 67, 74, 81, 88, 94, 104, 111, 120, 124, 131, 136, 140, 145, 152, 159, 168, 175, 179, 186, 191, 196, 198, 200, 205, 212, 219, 221, 223, 223, 219, 212, 205, 198, 193, 186, 173, 166, 161, 157, 152, 147, 138, 129, 117, 69, 62, 55, 48, 37, 32, 25, -27, -32, -39, -46, -53, -62, -69, -122, -126, -133, -138, -145, -152, -159, -165, -172, -177, -179, -184, -186, -188, -195, -200, -202, -205, -202, -198, -188, -182, -172, -163, -159, -149, -142, -133, -124, -115, -106, -94, -85, -78, -69, -62, -53, -44, -34, -25, -16, -9, -2, 7, 14, 21, 28, 35, 41, 51, 58, 65, 81, 88, 94, 104, 113, 117, 124, 129, 134, 140, 152, 159, 168, 173, 177, 182, 184, 189, 196, 200, 202, 200, 196, 191, 184, 179, 173, 166, 159, 152, 147, 140, 134, 129, 122, 115, 69, 62, 55, 46, 41, 35, 28, -25, -30, -37, -44, -48, -55, -62, -71, -129, -122, -115, -108, -106, -101, -99, -94, -87, -80, -74, -67, -117, -117, -117, -117, -117, -117, -117, -117, -117, -117, -117, -117, -117, -117, -119, -119, -76, -76, -78, -78, -78, -78, -78, -78, -78, -78, -78, -78, -78, -78, -78, -78, -115, -110, -103, -97, -92, -85, -117, -115, -108, -101, -97, -90, -83, -99, -99, -99, -106, -108, -110, -110, -108, -103, -103, -99, -97, -94, -92, -92, -94, -21, -21, -23, -23, -23, -23, -23, -23, -23, -21, -21, -21, -21, -21, -21, -21, -21, -30, -23, -16, -7, 0, 5, 9, 16, 23, 30, 21, 18, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 18, 18, -16, -11, -7, 2, 7, 12, 18, 14, 9, 2, -5, -14, -18, -21, 0, 0, -7, -11, -11, -9, -5, 0, 2, 5, 9, 9, 9, 9, 67, 74, 81, 88, 94, 99, 99, 104, 113, 120, 127, 74, 74, 74, 74, 74, 74, 74, 74, 74, 74, 71, 71, 74, 74, 74, 74, 108, 108, 108, 108, 108, 108, 108, 108, 108, 108, 108, 108, 108, 108, 106, 99, 92, 85, 81, 74, 78, 85, 92, 97, 101, 104, 92, 92, 90, 85, 85, 85, 88, 90, 97, 99, 101, 101, 101, 101, 97];
        const ys = [289, 296, 301, 303, 310, 312, 315, 317, 317, 319, 319, 319, 324, 324, 326, 328, 331, 331, 333, 333, 335, 335, 335, 335, 335, 335, 335, 335, 338, 338, 338, 338, 338, 338, 338, 338, 338, 338, 338, 338, 335, 335, 335, 333, 333, 333, 331, 328, 326, 326, 326, 324, 324, 324, 321, 321, 321, 319, 319, 317, 315, 315, 310, 303, 298, 292, 211, 213, 216, 218, 220, 223, 225, 229, 232, 236, 243, 248, 255, 262, 266, 271, 273, 275, 280, 285, 289, 289, 292, 294, 294, 296, 298, 301, 305, 305, 308, 308, 308, 310, 310, 310, 312, 312, 312, 315, 315, 317, 319, 319, 321, 321, 321, 321, 321, 321, 321, 321, 321, 321, 321, 319, 321, 321, 321, 321, 321, 319, 317, 317, 317, 317, 315, 315, 315, 315, 315, 312, 312, 308, 308, 308, 305, 303, 303, 301, 301, 298, 296, 294, 292, 289, 287, 285, 282, 278, 275, 269, 266, 259, 255, 248, 243, 236, 229, 225, 223, 220, 218, 216, 213, 213, 218, 223, 227, 234, 241, 246, 248, 252, 257, 259, 264, 271, 273, 278, 282, 285, 285, 285, 285, 285, 287, 289, 292, 294, 296, 296, 298, 298, 301, 303, 301, 301, 298, 296, 296, 296, 296, 298, 303, 303, 305, 305, 305, 308, 308, 308, 305, 303, 301, 298, 298, 296, 294, 294, 294, 294, 294, 294, 294, 294, 292, 289, 289, 289, 285, 282, 280, 275, 271, 271, 269, 269, 269, 264, 264, 262, 257, 255, 248, 246, 239, 232, 225, 220, 216, 211, 232, 234, 236, 243, 246, 250, 255, 262, 262, 262, 262, 262, 262, 262, 266, 269, 273, 275, 275, 278, 278, 278, 278, 275, 275, 275, 275, 275, 275, 278, 278, 280, 282, 285, 287, 287, 287, 287, 287, 285, 282, 282, 278, 275, 273, 273, 273, 273, 273, 273, 273, 273, 273, 271, 269, 264, 262, 259, 255, 252, 250, 250, 248, 248, 246, 241, 234, 126, 133, 140, 144, 151, 158, 165, 172, 179, 186, 193, 200, 204, 213, 220, 227, 119, 128, 138, 142, 149, 156, 163, 170, 177, 184, 190, 197, 207, 213, 220, 227, 73, 75, 80, 82, 89, 96, 103, 108, 110, 115, 117, 121, 124, 126, 128, 128, 131, 135, 138, 140, 144, 147, 149, 151, 154, 154, 154, 154, 154, 154, 154, 154, 154, 156, 158, 161, 161, 165, 167, 167, 170, 170, 170, 170, 170, 170, 167, 165, 163, 161, 161, 158, 158, 158, 158, 158, 158, 158, 158, 158, 156, 154, 149, 147, 147, 147, 147, 147, 147, 144, 140, 135, 131, 124, 121, 119, 115, 112, 110, 108, 103, 96, 91, 87, 82, 91, 98, 101, 103, 103, 103, 105, 108, 110, 115, 119, 126, 131, 133, 133, 133, 133, 133, 133, 133, 133, 133, 133, 135, 138, 140, 142, 142, 142, 144, 147, 147, 147, 147, 147, 144, 144, 142, 142, 140, 140, 140, 140, 140, 140, 140, 140, 138, 135, 133, 133, 128, 126, 124, 124, 124, 124, 124, 121, 119, 115, 112, 110, 108, 105, 103, -37, -28, -24, -14, -7, -0, 6, 13, 20, 27, 32, 39, 45, 55, 62, 68, 75, 82, 89, -44, -35, -28, -21, -12, -5, 2, 9, 18, 25, 32, 39, 45, 52, 59, 66, 75, 82, 91, -113, -111, -106, -104, -102, -102, -104, -104, -104, -104, -99, -97, -92, -88, -83, -79, -76, -74, -72, -65, -60, -53, -47, -42, -37, -37, -37, -35, -30, -26, -21, -19, -14, -12, -10, -10, -10, -10, -7, -7, -7, -7, -7, -7, -5, -5, -5, -0, -0, 2, 4, 4, 6, 6, 6, 6, 6, 6, 4, 2, -0, -0, -0, -0, -0, -3, -3, -3, -3, -3, -3, -3, -3, -5, -10, -12, -17, -19, -19, -19, -19, -21, -24, -26, -30, -35, -40, -47, -49, -51, -56, -63, -72, -76, -83, -86, -88, -90, -90, -90, -92, -97, -102, -106, -109, -111, -111, -113, -115, -115, -118, -120, -122, -125, -125, -122, -120, -118, -118, -118, -118, -115, -102, -99, -97, -95, -95, -92, -92, -92, -92, -90, -86, -81, -76, -69, -67, -65, -63, -56, -51, -51, -51, -51, -51, -44, -40, -33, -30, -28, -28, -28, -28, -28, -26, -26, -26, -24, -21, -17, -17, -17, -17, -17, -14, -14, -14, -17, -19, -19, -21, -21, -21, -21, -21, -21, -21, -21, -24, -26, -28, -33, -35, -35, -35, -35, -37, -40, -42, -44, -51, -53, -56, -58, -63, -69, -69, -74, -74, -76, -79, -81, -81, -86, -90, -95, -99, -102, -102, -102, -102, -102, -104, -106, -106, -109, -111, -113, -111, -111, -109, -106, -106, -106, -106, -74, -76, -76, -76, -72, -67, -69, -72, -74, -74, -74, -74, -81, -88, -95, -102, -109, -115, -122, -129, -136, -143, -150, -157, -164, -171, -178, -184, -81, -88, -92, -99, -106, -115, -125, -132, -138, -145, -152, -161, -168, -175, -180, -187, -187, -182, -182, -182, -184, -187, -189, -194, -194, -194, -196, -194, -189, -191, -198, -207, -201, -205, -212, -219, -224, -230, -235, -233, -228, -224, -219, -210, -205, -189, -182, -175, -168, -161, -152, -148, -141, -134, -127, -120, -113, -106, -99, -90, -83, -76, -72, -72, -72, -72, -69, -72, -74, -74, -74, -74, -83, -90, -95, -104, -111, -118, -125, -132, -138, -148, -152, -159, -168, -175, -182, -187, -184, -182, -182, -182, -182, -184, -187, -191, -194, -194, -194, -194, -191, -191, -201, -210, -207, -214, -221, -228, -233, -240, -237, -233, -228, -221, -214, -207, -79, -76, -76, -74, -72, -67, -74, -74, -76, -76, -76, -79, -88, -95, -104, -113, -120, -129, -136, -143, -150, -155, -161, -168, -175, -182, -189, -86, -92, -99, -109, -115, -122, -132, -141, -148, -155, -161, -168, -175, -182, -184, -184, -182, -184, -184, -189, -194, -194, -194, -191, -189, -182, -201, -205, -203, -207, -214, -221, -230, -235, -235, -230, -226, -219, -212, -205, -203];
        
        if (angle < xs.length && angle < ys.length) {
            return [this.offsetX + xs[angle], this.offsetY + ys[angle]];
        }
        return [this.offsetX, this.offsetY];
    }

    startCounter(startDate) {
        if (this.counterTimer) {
            clearInterval(this.counterTimer);
        }

        this.birthdayStart = startDate || new Date("2005-11-29T00:00:00+05:00");
        this.timeElapse(this.birthdayStart);
        this.counterTimer = setInterval(() => this.timeElapse(this.birthdayStart), 1000);
    }

    // Time calculation and display with proper formatting
    timeElapse(together) {
        const current = new Date();
        const seconds = Math.floor((current.getTime() - together.getTime()) / 1000);
        const days = Math.floor(seconds / (3600 * 24));
        const remainingSeconds = seconds % (3600 * 24);
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const secs = remainingSeconds % 60;

        const paddedHours = hours < 10 ? "0" + hours : hours;
        const paddedMinutes = minutes < 10 ? "0" + minutes : minutes;
        const paddedSeconds = secs < 10 ? "0" + secs : secs;

        const elapsedTimeElement = document.getElementById("elapseClock");
        if (elapsedTimeElement) {
            elapsedTimeElement.innerHTML = `<span class="counter-part"><span class="digit">${days}</span><span class="counter-unit"> days</span></span> <span class="counter-part"><span class="digit">${paddedHours}</span><span class="counter-unit"> hours</span></span> <span class="counter-part"><span class="digit">${paddedMinutes}</span><span class="counter-unit"> minutes</span></span> <span class="counter-part"><span class="digit">${paddedSeconds}</span><span class="counter-unit"> seconds</span></span>`;
        }
    }

    // Typewriter effect reveals DOM text without exposing partial HTML tags.
    typewriter(element, onComplete = null) {
        if (!element) return;

        if (this.typingState && this.typingState.timer) {
            clearInterval(this.typingState.timer);
        }

        const lines = Array.from(element.querySelectorAll(".code-line"));
        const main = element.closest("#mainDiv");
        const sequentialPresentation = main && main.dataset.presentation === "sequence";
        lines.forEach((line) => {
            if (sequentialPresentation) line.style.display = "none";
            const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
            const textNodes = [];
            while (walker.nextNode()) textNodes.push(walker.currentNode);

            textNodes.forEach((textNode) => {
                const characters = document.createDocumentFragment();
                for (const character of textNode.nodeValue) {
                    const span = document.createElement("span");
                    span.className = "typing-char";
                    span.textContent = character;
                    characters.appendChild(span);
                }
                textNode.parentNode.replaceChild(characters, textNode);
            });
        });

        element.style.display = "block";
        const cursor = document.createElement("span");
        cursor.className = "typewriter-cursor";
        cursor.textContent = "_";
        cursor.setAttribute("aria-hidden", "true");

        const state = {
            element,
            lines,
            lineIndex: 0,
            charIndex: 0,
            timer: null,
            cursor,
            onComplete,
            completed: false,
            onClick: null,
            onKeyDown: null,
            onManualScroll: null,
            mobileFollowPaused: false,
            lastAutoFollowLine: -1
        };
        this.typingState = state;

        state.onClick = (event) => {
            if (event.button !== 0) return;
            const activeState = this.typingState;
            if (!activeState || activeState.completed || activeState.lineIndex >= activeState.lines.length) return;
            this.completeCurrentLine();
            if (typeof window.birthdayConfettiBurst === "function") window.birthdayConfettiBurst();
        };
        state.onKeyDown = (event) => {
            const focused = document.activeElement;
            if (!(focused === element || element.contains(focused))) return;
            if (focused && focused.matches && focused.matches("button, input, select, textarea, a, [contenteditable='true']")) return;
            if ((event.key === "Enter" || event.code === "Space") && !event.repeat) {
                event.preventDefault();
                this.completeCurrentLine();
            }
        };
        element.addEventListener("click", state.onClick);
        document.addEventListener("keydown", state.onKeyDown);
        if (!sequentialPresentation) {
            state.onManualScroll = () => {
                state.mobileFollowPaused = true;
            };
            window.addEventListener("wheel", state.onManualScroll, { passive: true });
            window.addEventListener("touchmove", state.onManualScroll, { passive: true });
        }

        this.startCurrentLine(state);
    }

    startCurrentLine(state) {
        if (state.completed) return;

        while (state.lineIndex < state.lines.length) {
            const line = state.lines[state.lineIndex];
            const characters = Array.from(line.querySelectorAll(".typing-char"));
            state.charIndex = 0;
            if (characters.length === 0) {
                state.lineIndex++;
                continue;
            }

            line.style.display = "block";
            line.appendChild(state.cursor);
            this.scrollActiveLineIntoView(state);
            state.timer = setInterval(() => {
                if (state.charIndex < characters.length) {
                    characters[state.charIndex].style.display = "inline";
                    state.charIndex++;
                    this.scrollActiveLineIntoView(state);
                }
                if (state.charIndex >= characters.length) {
                    clearInterval(state.timer);
                    state.timer = null;
                    state.cursor.remove();
                    state.lineIndex++;
                    this.startCurrentLine(state);
                }
            }, 75);
            return;
        }

        this.finishTypewriter(state);
    }

    scrollActiveLineIntoView(state) {
        const main = state.element.closest("#mainDiv");
        if (!main) return;

        const sequentialPresentation = main.dataset.presentation === "sequence";
        if (sequentialPresentation && main.dataset.stage !== "code") return;
        if (!sequentialPresentation && !window.matchMedia("(max-width: 1100px), (max-height: 600px)").matches) return;

        const line = state.lines[state.lineIndex];
        if (!line) return;

        if (sequentialPresentation) {
            const lineRect = line.getBoundingClientRect();
            const containerRect = state.element.getBoundingClientRect();
            const inset = 10;
            if (lineRect.top < containerRect.top + inset) {
                state.element.scrollTop -= containerRect.top + inset - lineRect.top;
            } else if (lineRect.bottom > containerRect.bottom - inset) {
                state.element.scrollTop += lineRect.bottom - containerRect.bottom + inset;
            }
            return;
        }

        if (state.mobileFollowPaused) {
            if (window.scrollY > 24) return;
            state.mobileFollowPaused = false;
        }

        if (state.lastAutoFollowLine === state.lineIndex || (state.charIndex > 0 && state.charIndex % 12 !== 0)) return;

        const viewportHeight = Math.min(window.innerHeight, window.visualViewport ? window.visualViewport.height : window.innerHeight);
        const codeRect = state.element.getBoundingClientRect();
        if (codeRect.bottom <= 0 || codeRect.top >= viewportHeight) return;

        const lineRect = line.getBoundingClientRect();
        const safeBottom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--safe-area-bottom")) || 0;
        const lowerEdge = viewportHeight - Math.max(24, safeBottom + 12);
        if (lineRect.bottom > lowerEdge && state.lastAutoFollowLine !== state.lineIndex) {
            state.lastAutoFollowLine = state.lineIndex;
            const targetBottom = Math.min(viewportHeight * 0.7, lowerEdge - 20);
            const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
            window.scrollBy({ top: lineRect.bottom - targetBottom, behavior });
        }
    }

    completeCurrentLine() {
        const state = this.typingState;
        if (!state || state.completed || state.lineIndex >= state.lines.length) return;

        if (state.timer) {
            clearInterval(state.timer);
            state.timer = null;
        }

        const line = state.lines[state.lineIndex];
        line.querySelectorAll(".typing-char").forEach((character) => {
            character.style.display = "inline";
        });
        state.cursor.remove();
        state.lineIndex++;
        this.startCurrentLine(state);
    }

    finishTypewriter(state) {
        if (state.completed) return;
        state.completed = true;
        if (state.timer) clearInterval(state.timer);
        state.cursor.remove();
        state.element.removeEventListener("click", state.onClick);
        document.removeEventListener("keydown", state.onKeyDown);
        if (state.onManualScroll) {
            window.removeEventListener("wheel", state.onManualScroll);
            window.removeEventListener("touchmove", state.onManualScroll);
        }
        if (typeof state.onComplete === "function") state.onComplete();
    }

    // Show messages after heart animation
    showMessages(onComplete = null) {
        const messages = document.getElementById('messages');
        if (messages) {
            this.fadeIn(messages, 5000, () => {
                if (typeof onComplete === "function") onComplete();
            });
        }
    }

}

// Initialize the app globally
window.birthdayApp = new BirthdayApp();

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BirthdayApp;
}
