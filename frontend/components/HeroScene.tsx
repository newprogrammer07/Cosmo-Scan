import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';


declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

const Earth = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {/* Earth is a sphere, not an icosahedron [cite: 32, 33] */}
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial 
        color="#4f86f7" 
        emissive="#1f3f7f" 
        roughness={0.7} 
        metalness={0.2} 
      />
    </mesh>
  );
};

interface AsteroidProps {
  index: number;
}


const Asteroid: React.FC<AsteroidProps> = ({ index }) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  const { radius, speed, eccentricity, inclination } = useMemo(() => {
    return {
      radius: 4 + Math.random() * 6,
      speed: 0.1 + Math.random() * 0.2,
      eccentricity: Math.random() * 0.3,
      inclination: (Math.random() - 0.5) * Math.PI * 0.2,
    };
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed + index * 10;
    const x = radius * (1 - eccentricity) * Math.cos(t);
    const z = radius * Math.sin(t);
    const y = Math.sin(t) * Math.tan(inclination) * radius * 0.5;
    meshRef.current.position.set(x, y, z);
  });

  const size = 0.1 + Math.random() * 0.2;

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[size, 0]} />
      <meshStandardMaterial color="#888888" roughness={0.9} metalness={0.5} />
    </mesh>
  );
};


const SceneContent = () => {
  const starsRef = useRef<THREE.Group>(null!);
  
  useFrame((state) => {
    const { mouse } = state;
    if (starsRef.current) {
      starsRef.current.position.x = THREE.MathUtils.lerp(starsRef.current.position.x, mouse.x * 2, 0.05);
      starsRef.current.position.y = THREE.MathUtils.lerp(starsRef.current.position.y, mouse.y * 2, 0.05);
    }
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, mouse.x * 0.5, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, mouse.y * 0.5, 0.05);
    state.camera.lookAt(new THREE.Vector3(0, 0, 0));
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2.5} color="#ffffff" />
      <group ref={starsRef}>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} />
      </group>
      <Earth />
      {Array.from({ length: 25 }).map((_, i) => (
        <Asteroid key={i} index={i} />
      ))}
    </>
  );
};


const HeroScene: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <SceneContent />
      </Canvas>
    </div>
  );
};

export default HeroScene;
