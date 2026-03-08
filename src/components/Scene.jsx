import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
    OrbitControls,
    PerspectiveCamera,
    ContactShadows,
    Environment,
    Center,
    Float
} from '@react-three/drei';
import { FortuneCookieModel } from './FortuneCookie';

/**
 * Scene component providing the environment, lighting, and camera.
 */
export const Scene = () => {
    return (
        <Canvas
            shadows
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
        >
            {/* Background Color */}
            <color attach="background" args={['#f8f6f2']} />

            {/* Cinematic Lighting Setup */}
            <ambientLight intensity={0.5} />

            {/* Key Light: Warm and directional */}
            <spotLight
                position={[5, 10, 5]}
                angle={0.25}
                penumbra={1}
                intensity={150}
                castShadow
                color="#fff4e0"
                shadow-mapSize={[1024, 1024]}
            />

            {/* Fill Light: Softer and cooler */}
            <pointLight position={[-5, 5, -5]} intensity={50} color="#e0f4ff" />

            {/* Rim Light: Highlights the edges */}
            <pointLight position={[0, 2, -10]} intensity={30} color="#ffffff" />

            {/* Camera */}
            <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={40} />

            {/* Realistic Shadow */}
            <ContactShadows
                position={[0, -1.2, 0]}
                opacity={0.4}
                scale={10}
                blur={2.5}
                far={2}
                resolution={512}
                color="#4b3621"
            />

            <Suspense fallback={null}>
                <Center top position={[0, -0.4, 0]}>
                    <Float
                        speed={1.5}
                        rotationIntensity={0.5}
                        floatIntensity={0.5}
                    >
                        <FortuneCookieModel
                            width={1.5}
                            foldDepth={0.8}
                            pinch={1.6}
                            thickness={0.06}
                            toastIntensity={1.2}
                        />
                    </Float>
                </Center>

                {/* Subtle environment map for material reflections */}
                <Environment preset="studio" />
            </Suspense>

            {/* Controls */}
            <OrbitControls
                enablePan={false}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 1.5}
                minDistance={3}
                maxDistance={8}
                autoRotate={false}
                makeDefault
            />
        </Canvas>
    );
};
