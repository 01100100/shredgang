import React, { useEffect, useRef } from 'react';
import { gsap, Strong } from 'gsap';

const GeometryBackground = ({ children }) => {
    const backgroundRef = useRef(null);

    useEffect(() => {
        const initCanvas = (canvasId) => {
            const C = document.getElementById(canvasId) as HTMLCanvasElement;
            const c = C.getContext('2d');
            let viewWidth = C.width = C.scrollWidth;
            let viewHeight = C.height = C.scrollHeight;

            const triW = 21;
            const triH = 27;
            const trailMaxLength = 18;
            const trailIntervalCreation = 100;
            const delayBeforeDisappear = 2;
            const colors = [
                '#eb9000', '#f6b400', '#440510', '#8a0a08', '#05391e', '#004b25', '#0c1a36', '#01235d', '#0b3f7a', '#0561a6', '#007ecb', '#32b2fa', '#54cefc', '#91dffa'
            ];

            let cols, rows, tris, interval;

            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            };

            const shuffleArray = (o) => {
                for (let j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
                return o;
            };

            const Triangle = function (pos, column, row) {
                this.selectedForTrail = false;
                this.pos = pos;
                this.col = column;
                this.row = row;
                this.alpha = this.tAlpha = 1;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.rgb = hexToRgb(this.color);
                this.opened = false;
                this.opening = false;
                this.closing = false;
                this.isLeft = (this.pos % 2);

                this.tX1 = (this.isLeft) ? (this.col + 1) * triW : this.col * triW;
                this.tX2 = (this.isLeft) ? this.col * triW : (this.col + 1) * triW;
                this.tX3 = (this.isLeft) ? (this.col + 1) * triW : this.col * triW;

                this.x1 = this.tX1;
                this.x2 = this.tX1;
                this.x3 = this.tX1;

                this.tY1 = .5 * this.row * triH;
                this.tY2 = .5 * (this.row + 1) * triH;
                this.tY3 = .5 * (this.row + 2) * triH;

                this.y1 = this.tY1;
                this.y2 = this.tY1;
                this.y3 = this.tY1;

                this.draw = function () {
                    c.fillStyle = 'rgba(' + this.rgb.r + ',' + this.rgb.g + ',' + this.rgb.b + ',' + this.alpha + ')';
                    c.beginPath();
                    c.moveTo(this.x1, this.y1);
                    c.lineTo(this.x2, this.y2);
                    c.lineTo(this.x3, this.y3);
                    c.closePath();
                    c.fill();
                };

                this.open = function (direction, targetSpeed, targetAlpha, targetDelay) {
                    if (!this.opened || !this.opening) {
                        if (this.tweenClose) this.tweenClose.kill();
                        this.opening = true;
                        this.direction = direction || "top";
                        this.delay = targetDelay || 0;
                        this.tAlpha = targetAlpha;
                        this.tSpeed = targetSpeed || 1.5;
                        if (this.direction == "side") {
                            this.x1 = this.x2 = this.x3 = this.tX1;
                            this.y1 = this.tY1;
                            this.y2 = this.tY2;
                            this.y3 = this.tY3;
                        } else if (this.direction == "top") {
                            this.x1 = (this.tX2 + this.tX3) / 2;
                            this.x2 = this.tX2;
                            this.x3 = this.tX3;
                            this.y1 = (this.tY2 + this.tY3) / 2;
                            this.y2 = this.tY2;
                            this.y3 = this.tY3;
                        } else if (this.direction == "bottom") {
                            this.x1 = this.tX1;
                            this.x2 = this.tX2;
                            this.x3 = (this.tX1 + this.tX2) / 2;
                            this.y1 = this.tY1;
                            this.y2 = this.tY2;
                            this.y3 = (this.tY1 + this.tY2) / 2;
                        }
                        this.tweenOpen = gsap.to(this, {
                            duration: this.tSpeed,
                            x1: this.tX1,
                            x2: this.tX2,
                            x3: this.tX3,
                            y1: this.tY1,
                            y2: this.tY2,
                            y3: this.tY3,
                            alpha: this.tAlpha,
                            ease: Strong.easeInOut,
                            delay: this.delay,
                            onComplete: openComplete,
                            onCompleteParams: [this]
                        });
                    }
                };

                this.close = function (direction, targetSpeed, targetDelay) {
                    this.direction = direction || "top";
                    this.delay = targetDelay || 1;
                    this.tSpeed = targetSpeed || .8;
                    this.opened = false;
                    this.closing = true;
                    let closeX1, closeX2, closeX3, closeY1, closeY2, closeY3;

                    if (this.direction == "side") {
                        closeX1 = closeX2 = closeX3 = this.tX1;
                        closeY1 = this.tY1;
                        closeY2 = this.tY2;
                        closeY3 = this.tY3;
                    } else if (this.direction == "top") {
                        closeX1 = (this.tX2 + this.tX3) / 2;
                        closeX2 = this.tX2;
                        closeX3 = this.tX3;
                        closeY1 = (this.tY2 + this.tY3) / 2;
                        closeY2 = this.tY2;
                        closeY3 = this.tY3;
                    } else if (this.direction == "bottom") {
                        closeX1 = this.tX1;
                        closeX2 = this.tX2;
                        closeX3 = (this.tX1 + this.tX2) / 2;
                        closeY1 = this.tY1;
                        closeY2 = this.tY2;
                        closeY3 = (this.tY1 + this.tY2) / 2;
                    }
                    if (this.tweenClose) this.tweenClose.kill();
                    this.tweenClose = gsap.to(this, {
                        duration: this.tSpeed,
                        x1: closeX1,
                        x2: closeX2,
                        x3: closeX3,
                        y1: closeY1,
                        y2: closeY2,
                        y3: closeY3,
                        alpha: 0,
                        ease: Strong.easeInOut,
                        delay: this.delay,
                        onComplete: closeComplete,
                        onCompleteParams: [this]
                    });
                };
            };

            const openComplete = (tri) => {
                tri.opened = true;
                tri.opening = false;
                tri.closing = false;
            };

            const closeComplete = (tri) => {
                tri.opened = false;
                tri.opening = false;
                tri.closing = false;
            };

            const unselectTris = () => {
                for (let i = 0; i < tris.length; i++) {
                    tris[i].selectedForTrail = false;
                }
            };

            const createTrail = () => {
                unselectTris();
                let currentTri;
                const trailLength = Math.floor(Math.random() * trailMaxLength - 2) + 2;
                const index = Math.round(Math.random() * tris.length);
                const startTri = tris[index];
                startTri.selectedForTrail = true;
                currentTri = {
                    tri: startTri,
                    openDir: "side",
                    closeDir: "side"
                };

                let opacity;
                for (let i = 0; i < trailLength; i++) {
                    const o = getNeighbour(currentTri.tri);
                    if (o != null) {
                        o.tri.selectedForTrail = true;
                        opacity = (Math.random() < .8) ? Math.random() * .5 : 1;
                        currentTri.tri.closeDir = o.openDir;
                        currentTri.tri.open(currentTri.openDir, 1.5, opacity, i * 0.1);
                        currentTri.tri.close(currentTri.closeDir, 1, delayBeforeDisappear + i * 0.1);
                        currentTri = o;
                    } else {
                        opacity = (Math.random() < .8) ? Math.random() * .5 : 1;
                        currentTri.tri.open(currentTri.openDir, 1.5, opacity, (i + 1) * 0.1);
                        currentTri.tri.close(currentTri.closeDir, 1, delayBeforeDisappear + (i + 1) * 0.1);
                        break;
                    }
                }
            };

            const getNeighbour = (t) => {
                const neighbours = ["side", "top", "bottom"];
                shuffleArray(neighbours);
                for (let i = 0; i < neighbours.length; i++) {
                    if (neighbours[i] == "top") {
                        if (t.row != 0 && !tris[t.pos - cols].selectedForTrail && !tris[t.pos - cols].opened) {
                            return {
                                tri: tris[t.pos - cols],
                                openDir: "top",
                                closeDir: "top"
                            };
                        }
                    } else if (neighbours[i] == "bottom") {
                        if (t.row != rows - 1 && !tris[t.pos + cols].selectedForTrail && !tris[t.pos + cols].opened) {
                            return {
                                tri: tris[t.pos + cols],
                                openDir: "bottom",
                                closeDir: "top"
                            };
                        }
                    } else {
                        if (t.isLeft && t.col != cols - 1 && !tris[t.pos + 1].selectedForTrail && !tris[t.pos + 1].opened) {
                            return {
                                tri: tris[t.pos + 1],
                                openDir: "side",
                                closeDir: "top"
                            };
                        } else if (!t.isLeft && t.col != 0 && !tris[t.pos - 1].selectedForTrail && !tris[t.pos - 1].opened) {
                            return {
                                tri: tris[t.pos - 1],
                                openDir: "side",
                                closeDir: "top"
                            };
                        }
                    }
                }
                return null;
            };

            const draw = () => {
                c.clearRect(0, 0, C.width, C.height);
                for (let i = 0; i < tris.length; i++) {
                    tris[i].draw();
                }
            };

            const handleResize = () => {
                viewWidth = C.width = C.scrollWidth;
                viewHeight = C.height = C.scrollHeight;
                start();
            };

            const initParams = () => {
                cols = Math.floor(viewWidth / triW);
                cols = (cols % 2) ? cols : cols - 1; // => keep it odd 
                rows = Math.floor(viewHeight / triH) * 2;
                tris = [];
            };

            const initGrid = () => {
                for (let j = 0; j < rows; j++) {
                    for (let i = 0; i < cols; i++) {
                        const pos = i + (j * cols);
                        const triangle = new Triangle(pos, i, j);
                        tris.push(triangle);
                        triangle.draw();
                    }
                }
            };

            const start = () => {
                if (interval) clearInterval(interval);
                initParams();
                initGrid();
                interval = setInterval(createTrail, trailIntervalCreation);
                createTrail();
            };

            const pause = () => {
                if (interval) clearInterval(interval);
                for (let i = 0; i < tris.length; i++) {
                    if (tris[i].tweenClose) tris[i].tweenClose.kill();
                }
            };

            const closeAll = () => {
                let count = 0;
                if (interval) clearInterval(interval);
                for (let i = 0; i < tris.length; i++) {
                    if (tris[i].tweenOpen) tris[i].tweenOpen.kill();
                    if (tris[i].opened || tris[i].opening) {
                        count++;
                        tris[i].close("top", .8, .2 + .0015 * count);
                    }
                }
            };

            const kill = () => {
                if (interval) clearInterval(interval);
                for (let i = 0; i < tris.length; i++) {
                    gsap.killTweensOf(tris[i]);
                    tris[i].alpha = 0;
                }
            };

            initCanvas('myCanvas');
            start();

            window.addEventListener("resize", handleResize);
            gsap.ticker.add(draw);
        };

        if (backgroundRef.current) {
            const canvas = document.createElement('canvas');
            canvas.id = 'myCanvas';
            backgroundRef.current.appendChild(canvas);
            initCanvas('myCanvas');
        }
    }, []);

    return (
        <>
            <div ref={backgroundRef} className="background"></div>
            <div className="content">
                {children}
            </div>
            <style jsx>{`
                @import url(https://fonts.googleapis.com/css?family=Open+Sans:800);

                body {
                    background-color: #000;
                }
                #myCanvas {
                    position: absolute;
                    margin: auto;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background-color: #000;
                }
                #credits {
                    position: absolute;
                    width: 100%;
                    margin: auto;
                    bottom: 0;
                    margin-bottom: 20px;
                    font-family: 'Open Sans', sans-serif;
                    color: #0561a6;
                    font-size: 0.7em;
                    text-transform: uppercase;
                    text-align: center;
                }
                #credits a {
                    color: #0561a6;
                }
                .content {
                    position: relative;
                    z-index: 1;
                }
            `}</style>
        </>
    );
};

export default GeometryBackground;