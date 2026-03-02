import React, { useEffect, useRef } from 'react';

const QuantumBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        // ─── Color palette ───────────────────────────────────────────────
        const BG = '#0f111a';
        const VIOLET = { r: 110, g: 60, b: 220 };
        const INDIGO = { r: 72, g: 52, b: 185 };
        const PURPLE = { r: 155, g: 80, b: 255 };
        const ELECTRIC = { r: 190, g: 100, b: 255 };
        const NEBULA = { r: 100, g: 120, b: 255 };

        const rgba = (c, a) => `rgba(${c.r},${c.g},${c.b},${a})`;

        // ─── Grid ─────────────────────────────────────────────────────────
        const drawGrid = () => {
            const W = canvas.width, H = canvas.height;
            const STEP = 64;

            const mask = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.05, W * 0.5, H * 0.5, H * 0.85);
            mask.addColorStop(0, 'rgba(255,255,255,0.045)');
            mask.addColorStop(0.5, 'rgba(255,255,255,0.018)');
            mask.addColorStop(1, 'rgba(255,255,255,0.0)');

            ctx.save();
            ctx.strokeStyle = mask;
            ctx.lineWidth = 0.6;

            for (let x = 0; x <= W; x += STEP) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H);
                ctx.stroke();
            }
            for (let y = 0; y <= H; y += STEP) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y);
                ctx.stroke();
            }
            ctx.restore();
        };

        // ─── Nebula light source ───────────────────────────────
        const drawNebula = () => {
            const W = canvas.width, H = canvas.height;

            const nb1 = ctx.createRadialGradient(-W * 0.05, -H * 0.05, 0, -W * 0.05, -H * 0.05, W * 0.85);
            nb1.addColorStop(0, 'rgba(80,100,255,0.18)');
            nb1.addColorStop(0.25, 'rgba(90,60,200,0.10)');
            nb1.addColorStop(0.55, 'rgba(60,40,160,0.04)');
            nb1.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = nb1;
            ctx.fillRect(0, 0, W, H);

            const nb2 = ctx.createRadialGradient(W * 1.05, H * 0.7, 0, W * 1.05, H * 0.7, W * 0.7);
            nb2.addColorStop(0, 'rgba(140,50,200,0.09)');
            nb2.addColorStop(0.4, 'rgba(80,30,150,0.04)');
            nb2.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = nb2;
            ctx.fillRect(0, 0, W, H);

            const nb3 = ctx.createRadialGradient(W * 0.5, H * 1.1, 0, W * 0.5, H * 1.1, W * 0.6);
            nb3.addColorStop(0, 'rgba(60,40,180,0.07)');
            nb3.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = nb3;
            ctx.fillRect(0, 0, W, H);
        };

        // ─── Glass sphere helper ──────────────────────────────────────────
        const drawSphere = (x, y, r, col, alpha, blur) => {
            ctx.save();
            ctx.globalAlpha = alpha;
            if (blur > 0) ctx.filter = `blur(${blur}px)`;

            const glow = ctx.createRadialGradient(x, y, r * 0.1, x, y, r * 1.8);
            glow.addColorStop(0, rgba(col, 0.18));
            glow.addColorStop(0.5, rgba(col, 0.06));
            glow.addColorStop(1, rgba(col, 0));
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(x, y, r * 1.8, 0, Math.PI * 2); ctx.fill();

            const body = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.05, x, y, r);
            body.addColorStop(0, rgba({ r: 255, g: 255, b: 255 }, 0.22));
            body.addColorStop(0.2, rgba(col, 0.40));
            body.addColorStop(0.6, rgba(col, 0.18));
            body.addColorStop(1, rgba({ r: 0, g: 0, b: 0 }, 0.45));
            ctx.fillStyle = body;
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

            const spec = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, 0, x - r * 0.3, y - r * 0.35, r * 0.55);
            spec.addColorStop(0, 'rgba(255,255,255,0.55)');
            spec.addColorStop(0.4, 'rgba(255,255,255,0.10)');
            spec.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = spec;
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

            const rim = ctx.createRadialGradient(x + r * 0.4, y + r * 0.4, r * 0.5, x, y, r);
            rim.addColorStop(0, rgba(ELECTRIC, 0));
            rim.addColorStop(0.75, rgba(ELECTRIC, 0.12));
            rim.addColorStop(1, rgba(ELECTRIC, 0.35));
            ctx.fillStyle = rim;
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

            ctx.restore();
        };

        // ─── Floating geometric data node ────────────────────────────────
        const drawNode = (x, y, size, col, alpha, rotation, shape) => {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(x, y);
            ctx.rotate(rotation);

            const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 2.5);
            halo.addColorStop(0, rgba(col, 0.15));
            halo.addColorStop(1, rgba(col, 0));
            ctx.fillStyle = halo;
            ctx.beginPath(); ctx.arc(0, 0, size * 2.5, 0, Math.PI * 2); ctx.fill();

            if (shape === 'diamond') {
                ctx.beginPath();
                ctx.moveTo(0, -size); ctx.lineTo(size * 0.6, 0);
                ctx.lineTo(0, size); ctx.lineTo(-size * 0.6, 0);
                ctx.closePath();
                const gd = ctx.createLinearGradient(-size, -size, size, size);
                gd.addColorStop(0, rgba(col, 0.50));
                gd.addColorStop(1, rgba(col, 0.08));
                ctx.fillStyle = gd;
                ctx.fill();
                ctx.strokeStyle = rgba(col, 0.6);
                ctx.lineWidth = 0.8;
                ctx.stroke();
            } else if (shape === 'hexagon') {
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const a = (Math.PI / 3) * i - Math.PI / 6;
                    i === 0 ? ctx.moveTo(Math.cos(a) * size, Math.sin(a) * size)
                        : ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
                }
                ctx.closePath();
                const gh = ctx.createLinearGradient(-size, -size, size, size);
                gh.addColorStop(0, rgba(col, 0.35));
                gh.addColorStop(1, rgba(col, 0.06));
                ctx.fillStyle = gh;
                ctx.fill();
                ctx.strokeStyle = rgba(col, 0.55);
                ctx.lineWidth = 0.7;
                ctx.stroke();
            } else {
                ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2);
                const gc = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
                gc.addColorStop(0, rgba(col, 0.6));
                gc.addColorStop(1, rgba(col, 0.05));
                ctx.fillStyle = gc;
                ctx.fill();
                ctx.strokeStyle = rgba(col, 0.8);
                ctx.lineWidth = 0.6;
                ctx.stroke();
            }

            ctx.restore();
        };

        // ─── Connector lines between nodes ───────────────────────────────
        const drawConnectors = (nodes) => {
            nodes.forEach((a, i) => {
                nodes.slice(i + 1).forEach(b => {
                    const dist = Math.hypot(a.x - b.x, a.y - b.y);
                    if (dist < 280) {
                        const alpha = (1 - dist / 280) * 0.07;
                        ctx.save();
                        ctx.strokeStyle = `rgba(130,90,255,${alpha})`;
                        ctx.lineWidth = 0.6;
                        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                        ctx.restore();
                    }
                });
            });
        };

        // ─── Scene composition ────────────────────────────────────────────
        const buildScene = (W, H) => {
            const spheres = [
                { x: W * -0.02, y: H * 0.05, r: W * 0.22, col: INDIGO, a: 0.55, blur: 22 },
                { x: W * 0.82, y: H * 0.72, r: W * 0.18, col: VIOLET, a: 0.45, blur: 28 },
                { x: W * 0.55, y: H * -0.05, r: W * 0.13, col: PURPLE, a: 0.35, blur: 18 },
                { x: W * 0.25, y: H * 0.88, r: W * 0.10, col: ELECTRIC, a: 0.28, blur: 20 },
                { x: W * 0.92, y: H * 0.18, r: W * 0.08, col: INDIGO, a: 0.30, blur: 14 },
            ];

            const shapes = ['diamond', 'hexagon', 'dot'];
            const cols = [VIOLET, INDIGO, PURPLE, ELECTRIC, NEBULA];
            const nodes = [];

            const positions = [
                [0.72, 0.18], [0.18, 0.30], [0.62, 0.42], [0.38, 0.62],
                [0.84, 0.55], [0.10, 0.72], [0.50, 0.22], [0.78, 0.80],
                [0.28, 0.45], [0.90, 0.38], [0.44, 0.80], [0.15, 0.15],
                [0.65, 0.68], [0.35, 0.88], [0.56, 0.10],
            ];

            positions.forEach(([fx, fy], i) => {
                nodes.push({
                    x: W * fx, y: H * fy,
                    size: 4 + (i % 5) * 3.5,
                    col: cols[i % cols.length],
                    alpha: 0.18 + (i % 3) * 0.06,
                    rotation: (i * 0.42) % (Math.PI * 2),
                    shape: shapes[i % shapes.length],
                });
            });

            return { spheres, nodes };
        };

        // ─── Vignette ─────────────────────────────────────────────────────
        const drawVignette = () => {
            const W = canvas.width, H = canvas.height;
            const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.9);
            v.addColorStop(0, 'rgba(0,0,0,0)');
            v.addColorStop(1, 'rgba(0,0,0,0.65)');
            ctx.fillStyle = v;
            ctx.fillRect(0, 0, W, H);
        };

        let t = 0;
        const animate = () => {
            const W = canvas.width, H = canvas.height;
            t += 0.0008;

            ctx.fillStyle = BG;
            ctx.fillRect(0, 0, W, H);
            drawNebula();
            drawGrid();

            const { spheres, nodes } = buildScene(W, H);

            spheres.forEach((s, i) => {
                const pulse = 1 + Math.sin(t * 0.7 + i * 1.3) * 0.03;
                drawSphere(s.x, s.y, s.r * pulse, s.col, s.a, s.blur);
            });

            const animated = nodes.map((n, i) => ({
                ...n,
                x: n.x + Math.sin(t + i * 0.8) * 8,
                y: n.y + Math.cos(t * 0.9 + i * 0.6) * 6,
                rotation: n.rotation + t * (0.1 + (i % 3) * 0.05),
            }));

            drawConnectors(animated);
            animated.forEach(n => drawNode(n.x, n.y, n.size, n.col, n.alpha, n.rotation, n.shape));
            drawVignette();

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ display: 'block' }}
        />
    );
};

export default QuantumBackground;
