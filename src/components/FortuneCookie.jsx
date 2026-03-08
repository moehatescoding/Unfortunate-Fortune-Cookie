import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * FortuneCookieModel
 * Procedurally generates a realistic fortune cookie mesh.
 */
export const FortuneCookieModel = ({
    width = 1.2,
    foldDepth = 0.9,
    pinch = 1.4,
    thickness = 0.05,
    toastIntensity = 1.0,
    ...props
}) => {
    const meshRef = useRef();
    const paperRef = useRef();

    // Create a more intense procedural noise texture for cracks and pores
    const noiseTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 512, 512);

        // Add pores (tiny dots)
        for (let i = 0; i < 15000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const r = Math.random() * 0.5 + 0.2;
            ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add "baked cracks"
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 40; i++) {
            ctx.beginPath();
            let px = Math.random() * 512;
            let py = Math.random() * 512;
            ctx.moveTo(px, py);
            for (let j = 0; j < 5; j++) {
                px += (Math.random() - 0.5) * 30;
                py += (Math.random() - 0.5) * 30;
                ctx.lineTo(px, py);
            }
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        return texture;
    }, []);

    // Create the geometry
    const geometry = useMemo(() => {
        const segmentsU = 100;
        const segmentsV = 50;
        const vertices = [];
        const uvs = [];
        const colors = [];
        const indices = [];

        // Helper to get point for the cookie shell
        const getPoint = (u, v) => {
            // angle from 0 to 2PI, radius from 0 to 1
            const angle = u;
            const radius = v;

            // The reference cookie is more triangular than a disk
            // We'll modulate the radius to make it slightly squarish/triangular
            const radialMod = 1.0 + Math.pow(Math.abs(Math.sin(angle * 2)), 3) * 0.1;
            const r = radius * radialMod;

            let x = r * Math.cos(angle);
            let z = r * Math.sin(angle);

            // Stage 1: The sharp Taco Fold (crease along X)
            // Increasing the exponent makes the fold "sharper" at the center
            let y = Math.pow(Math.abs(Math.sin(angle)), 0.5) * r * foldDepth;

            // Stage 2: The Pinch
            const bendFactor = pinch;
            const bendAngle = x * bendFactor;

            // Reference cookie has a very tight pinch and thick wings
            const bendRadius = 0.95 - y * 0.4 + Math.pow(Math.abs(x), 1.5) * 0.2;

            let fx = bendRadius * Math.sin(bendAngle);
            let fz = bendRadius * Math.cos(bendAngle) + y * 0.3;
            let fy = y;

            // Add "Handmade" warping and edge wobbles
            const wobble = Math.sin(angle * 12) * Math.cos(radius * 15) * 0.025;
            const asymmetricVal = Math.sin(angle * 3) * 0.02; // One side larger

            fx += Math.cos(angle) * (wobble + asymmetricVal);
            fy += wobble;
            fz += Math.sin(angle) * (wobble + asymmetricVal);

            // Pronounced Rim effect: we thicken the edges specifically
            const edgeRim = Math.pow(radius, 10) * 0.08;
            const rimOffset = edgeRim * thickness * 10;

            // Rough normal for extrusion
            const nx = Math.sin(bendAngle);
            const ny = 0.8;
            const nz = Math.cos(bendAngle);

            return new THREE.Vector3(
                fx * width + nx * rimOffset,
                fy * width + ny * rimOffset,
                fz * width + nz * rimOffset
            );
        };

        // Generate shell vertices
        for (let j = 0; j <= segmentsV; j++) {
            const v = j / segmentsV;
            for (let i = 0; i <= segmentsU; i++) {
                const u = (i / segmentsU) * Math.PI * 2;

                const p = getPoint(u, v);
                vertices.push(p.x, p.y, p.z);

                // Color matching reference image:
                // Pale yellow center, Dark brown edges
                const edgeToasting = Math.pow(v, 4) * 0.45;
                const creaseToasting = Math.pow(1 - Math.abs(Math.sin(u)), 6) * 0.3;
                const totalToast = (edgeToasting + creaseToasting) * toastIntensity;

                // Base color: #F8E3B6 (pale golden)
                const baseR = 0.97, baseG = 0.89, baseB = 0.71;
                // Toast color: #6B4423 (dark brown)
                const toastR = 0.42, toastG = 0.27, toastB = 0.14;

                const mix = Math.min(1.0, totalToast);
                const r = baseR * (1 - mix) + toastR * mix;
                const g = baseG * (1 - mix) + toastG * mix;
                const b = baseB * (1 - mix) + toastB * mix;

                // Add random "baked" darkening speckles
                const speckle = 1.0 - (Math.random() > 0.98 ? 0.15 : 0);

                colors.push(r * speckle, g * speckle, b * speckle);
                uvs.push(i / segmentsU, j / segmentsV);
            }
        }

        // Indices
        for (let j = 0; j < segmentsV; j++) {
            for (let i = 0; i < segmentsU; i++) {
                const a = j * (segmentsU + 1) + i;
                const b = j * (segmentsU + 1) + i + 1;
                const c = (j + 1) * (segmentsU + 1) + i;
                const d = (j + 1) * (segmentsU + 1) + i + 1;

                indices.push(a, b, d);
                indices.push(a, d, c);
            }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geo.setIndex(indices);
        geo.computeVertexNormals();

        return geo;
    }, [width, foldDepth, pinch, thickness, toastIntensity]);

    // Paper slip geometry (slightly more curled)
    const paperGeometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(0.32, 0.8, 15, 15);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            const x = pos.getX(i);
            // More natural curl and weight
            const curl = Math.pow(y + 0.4, 2) * 0.2 + Math.sin(y * 5) * 0.05;
            pos.setZ(i, curl + Math.sin(x * 12) * 0.01);
        }
        geo.computeVertexNormals();
        return geo;
    }, []);

    // Idle Animation
    useFrame((state) => {
        if (meshRef.current) {
            const t = state.clock.getElapsedTime();
            meshRef.current.rotation.y = t * 0.12; // Slower, more premium
            meshRef.current.position.y = Math.sin(t * 0.6) * 0.04;
            meshRef.current.rotation.z = Math.sin(t * 0.3) * 0.05;
        }
    });

    return (
        <group {...props}>
            <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
                <meshPhysicalMaterial
                    vertexColors
                    roughness={0.92}
                    metalness={0}
                    roughnessMap={noiseTexture}
                    bumpMap={noiseTexture}
                    bumpScale={0.004} // Crunchier texture
                    clearcoat={0.02}
                    clearcoatRoughness={0.8}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Paper Fortune peeking out */}
            <mesh
                ref={paperRef}
                geometry={paperGeometry}
                position={[0.08, 0.45, -0.4]}
                rotation={[0.4, 0.6, 0.05]}
                castShadow
            >
                <meshPhysicalMaterial
                    color="#fffef5"
                    roughness={1}
                    metalness={0}
                    side={THREE.DoubleSide}
                    opacity={0.96}
                    transparent
                />
            </mesh>
        </group>
    );
};
