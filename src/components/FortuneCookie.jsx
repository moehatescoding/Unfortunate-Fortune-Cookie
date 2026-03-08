import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * FortuneCookieModel
 *
 * Procedural geometry inspired by the reference image:
 *   - Two curved wing lobes meeting at a tight central pinch
 *   - Darker toasted rim, pale golden center
 *   - Baked-pore bump texture
 *   - Paper slip peeking from the fold
 */
export function FortuneCookieModel({
    width = 1.8,
    foldDepth = 1.1,
    pinch = 1.7,
    thickness = 0.055,
    toastIntensity = 1.1,
    onPointerDown,
    ...props
}) {
    const groupRef = useRef();
    const isDragging = useRef(false);

    // ─── Procedural bump / roughness texture ──────────────────────────────────
    const noiseTexture = useMemo(() => {
        const sz = 512;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = sz;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, sz, sz);

        // pores
        for (let i = 0; i < 12000; i++) {
            const x = Math.random() * sz;
            const y = Math.random() * sz;
            const r = Math.random() * 0.7 + 0.1;
            ctx.fillStyle = `rgba(0,0,0,${(Math.random() * 0.25).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // hairline cracks
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 0.6;
        for (let i = 0; i < 35; i++) {
            let px = Math.random() * sz;
            let py = Math.random() * sz;
            ctx.beginPath();
            ctx.moveTo(px, py);
            for (let j = 0; j < 6; j++) {
                px += (Math.random() - 0.5) * 28;
                py += (Math.random() - 0.5) * 28;
                ctx.lineTo(px, py);
            }
            ctx.stroke();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(3, 3);
        return tex;
    }, []);

    // ─── Cookie shell geometry ─────────────────────────────────────────────────
    const cookieGeo = useMemo(() => {
        const SU = 96; // angular segments
        const SV = 48; // radial segments
        const positions = [];
        const colors = [];
        const uvCoords = [];
        const normals = [];
        const indices = [];

        /**
         * Maps polar-ish (u∈[0,2π], v∈[0,1]) to a 3-D fortune-cookie surface.
         *
         * Algorithm steps:
         * 1. Start from a disk in XZ.
         * 2. Lift wings with a "taco fold" — height proportional to sin(angle).
         * 3. Curl the edges inward with a cylindrical bend (the "pinch").
         * 4. Add rim thickening so the edge looks substantial.
         * 5. Light deterministic noise for handmade feel (no Math.random here —
         *    this runs inside useMemo so values must be stable).
         */
        const getPos = (u, v) => {
            const a = u;          // angle
            const rad = v;          // radius 0→1

            // ── 1. Disk ──
            let x = rad * Math.cos(a);
            let z = rad * Math.sin(a);

            // ── 2. Taco fold: wings lift in Y ──
            // sin(a) peaks at π/2 and 3π/2 (the two wing tips)
            const liftY = Math.pow(Math.abs(Math.sin(a)), 0.45) * rad * foldDepth;

            // ── 3. Cylindrical pinch: bend along X so wings curve toward viewer ──
            const bAngle = x * pinch;                             // bend angle
            const bRadius = 0.9 - liftY * 0.38 + Math.abs(x) * 0.18;

            let fx = bRadius * Math.sin(bAngle);
            let fy = liftY;
            let fz = bRadius * Math.cos(bAngle) + liftY * 0.28;

            // ── 4. Deterministic surface warping (stable imperfections) ──
            const wobble = Math.sin(a * 11) * Math.cos(rad * 14) * 0.022;
            const asym = Math.sin(a * 7 + 0.5) * 0.018;
            fx += Math.cos(a) * (wobble + asym);
            fy += wobble * 0.5;
            fz += Math.sin(a) * (wobble + asym);

            // ── 5. Rim thickening ──
            const rimPow = Math.pow(rad, 8) * 0.09;
            const nBase = new THREE.Vector3(Math.sin(bAngle), 0.7, Math.cos(bAngle)).normalize();
            fx += nBase.x * rimPow;
            fy += nBase.y * rimPow;
            fz += nBase.z * rimPow;

            return new THREE.Vector3(fx * width, fy * width, fz * width);
        };

        // ── Generate vertices ──
        for (let j = 0; j <= SV; j++) {
            const v = j / SV;
            for (let i = 0; i <= SU; i++) {
                const u = (i / SU) * Math.PI * 2;
                const p = getPos(u, v);
                positions.push(p.x, p.y, p.z);
                uvCoords.push(i / SU, j / SV);

                // Vertex colour: pale golden center → dark brown toasted rim
                const edgeDark = Math.pow(v, 3.5) * 0.5;
                const creaseDark = Math.pow(1 - Math.abs(Math.sin(u)), 7) * 0.28;
                const total = Math.min(1, (edgeDark + creaseDark) * toastIntensity);

                // base: warm pale gold  →  toast: dark brown
                const r = 0.97 * (1 - total) + 0.38 * total;
                const g = 0.88 * (1 - total) + 0.24 * total;
                const b = 0.70 * (1 - total) + 0.12 * total;

                // tiny deterministic speckle using sin hash
                const speckle = 1 - (Math.sin(u * 57 + v * 131) > 0.96 ? 0.12 : 0);
                colors.push(r * speckle, g * speckle, b * speckle);
            }
        }

        // ── Face indices ──
        for (let j = 0; j < SV; j++) {
            for (let i = 0; i < SU; i++) {
                const a = j * (SU + 1) + i;
                const b = a + 1;
                const c = (j + 1) * (SU + 1) + i;
                const d = c + 1;
                indices.push(a, b, d, a, d, c);
            }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvCoords, 2));
        geo.setIndex(indices);
        geo.computeVertexNormals();
        geo.computeBoundingSphere();
        return geo;
    }, [width, foldDepth, pinch, toastIntensity]);

    // ─── Paper fortune slip geometry ───────────────────────────────────────────
    const paperGeo = useMemo(() => {
        const geo = new THREE.PlaneGeometry(0.28, 0.75, 12, 12);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            const x = pos.getX(i);
            // Simulate a slightly curled paper strip
            pos.setZ(i, Math.pow(y + 0.38, 2) * 0.18 + Math.sin(x * 14) * 0.008);
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
        return geo;
    }, []);

    // ─── Idle animation ────────────────────────────────────────────────────────
    useFrame(({ clock }) => {
        if (!groupRef.current || isDragging.current) return;
        const t = clock.getElapsedTime();
        groupRef.current.rotation.y = t * 0.14;
        groupRef.current.position.y = Math.sin(t * 0.55) * 0.06;
        groupRef.current.rotation.z = Math.sin(t * 0.28) * 0.04;
    });

    return (
        <group
            ref={groupRef}
            {...props}
            onPointerDown={(e) => { isDragging.current = true; onPointerDown?.(e); }}
            onPointerUp={() => { isDragging.current = false; }}
        >
            {/* ── Cookie shell ── */}
            <mesh geometry={cookieGeo} castShadow receiveShadow>
                <meshPhysicalMaterial
                    vertexColors
                    roughness={0.88}
                    metalness={0}
                    roughnessMap={noiseTexture}
                    bumpMap={noiseTexture}
                    bumpScale={0.003}
                    clearcoat={0.0}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* ── Paper slip ── */}
            <mesh
                geometry={paperGeo}
                position={[0.06, 0.52, -0.44]}
                rotation={[0.38, 0.55, 0.04]}
                castShadow
            >
                <meshPhysicalMaterial
                    color="#fffeee"
                    roughness={1}
                    metalness={0}
                    side={THREE.DoubleSide}
                    transparent
                    opacity={0.97}
                />
            </mesh>
        </group>
    );
}
