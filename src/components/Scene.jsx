import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
    OrbitControls,
    ContactShadows,
    Environment,
} from '@react-three/drei';
import { FortuneCookieModel } from './FortuneCookie';

/**
 * Scene: cinematic 3-point lighting, soft shadow, orbit controls.
 */
export function Scene({ onCookieClick }) {
    return (
        <Canvas
            shadows
            dpr={[1, 1.5]}
            gl={{ antialias: true }}
            camera={{ position: [0, 0.4, 5], fov: 38, near: 0.1, far: 100 }}
        >
            {/* Studio-warm off-white background */}
            <color attach="background" args={['#f5f3ee']} />

            {/* ── Lighting ── */}
            {/* Ambient – fill the whole scene lightly */}
            <ambientLight intensity={1.2} color="#fff8f0" />

            {/* Key light – warm, from above-left */}
            <directionalLight
                position={[4, 8, 5]}
                intensity={3}
                color="#ffe8c0"
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-near={0.1}
                shadow-camera-far={20}
                shadow-camera-left={-5}
                shadow-camera-right={5}
                shadow-camera-top={5}
                shadow-camera-bottom={-5}
                shadow-bias={-0.001}
            />

            {/* Fill light – cooler, from the right */}
            <directionalLight position={[-5, 3, 2]} intensity={1.2} color="#e8f4ff" />

            {/* Rim light – highlights cookie edge from behind */}
            <pointLight position={[0, 2, -6]} intensity={2} color="#fff5e0" />

            {/* ── Cookie ── */}
            <Suspense fallback={null}>
                <FortuneCookieModel
                    position={[0, 0, 0]}
                    width={1.8}
                    foldDepth={1.1}
                    pinch={1.7}
                    thickness={0.055}
                    toastIntensity={1.1}
                    onPointerDown={onCookieClick}
                />

                {/* Soft contact shadow on "floor" */}
                <ContactShadows
                    position={[0, -1.4, 0]}
                    opacity={0.35}
                    scale={8}
                    blur={2}
                    far={2.5}
                    resolution={512}
                    color="#4a3018"
                />

                {/* HDR environment for PBR reflections */}
                <Environment preset="apartment" />
            </Suspense>

            {/* ── Orbit Controls ── */}
            <OrbitControls
                makeDefault
                enablePan={false}
                minDistance={3}
                maxDistance={9}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 1.8}
                target={[0, 0, 0]}
                enableDamping
                dampingFactor={0.08}
            />
        </Canvas>
    );
}
