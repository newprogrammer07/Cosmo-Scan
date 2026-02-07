

import React, { Suspense, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMedia';


const Starfield: React.FC<{ count: number }> = React.memo(({ count }) => {
  return <Stars radius={150} depth={50} count={count} factor={5} saturation={0} fade speed={0.5} />;
});


const Earth: React.FC = React.memo(() => {
    const meshRef = useRef<THREE.Mesh>(null!);
    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.05;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0]} scale={1.5}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="#4f86f7" emissive="#1f3f7f" roughness={0.8} metalness={0.1} />
        </mesh>
    );
});


const AsteroidBelt: React.FC = React.memo(() => {
  const count = 100;
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
        const t = Math.random() * 100;
        const speed = (0.05 + Math.random() / 20) * (Math.random() > 0.5 ? 1 : -1);
        const radius = 2.5 + Math.random() * 1.5;
        const x = radius * Math.cos(t);
        const z = radius * Math.sin(t);
        const y = (Math.random() - 0.5) * 0.4;
        temp.push({ t, speed, x, z, y, radius });
    }
    return temp;
  }, []);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, speed, radius } = particle;
      particle.t += speed * 0.05;
      const x = radius * Math.cos(particle.t);
      const z = radius * Math.sin(particle.t);
      dummy.position.set(x, particle.y, z);
      dummy.updateMatrix();
      instancedMeshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (instancedMeshRef.current) {
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[0.03, 0]} />
      <meshStandardMaterial color="#555" roughness={1} />
    </instancedMesh>
  );
});


const SceneContent: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  
  const starCount = isMobile || prefersReducedMotion ? 1000 : 5000;
  const isDashboard = location.pathname === '/dashboard';
  const isDetail = location.pathname.startsWith('/object/');

  useFrame((state) => {
    
    if (!prefersReducedMotion) {
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.mouse.x / 4, 0.05);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.mouse.y / 4, 0.05);
      state.camera.lookAt(0, 0, 0);
    }
  });

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <Starfield count={starCount} />

      {/* Landing page gets a cinematic nebula cloud */}
      {location.pathname === '/' && !isMobile && (
        <>
          <Cloud
            position={[-4, -2, -25]}
            speed={0.2}
            opacity={0.15}
            color="#BF00FF"
          />
          <Cloud
            position={[4, 2, -30]}
            speed={0.18}
            opacity={0.1}
            color="#00FFFF"
          />
        </>
      )}
      
      {/* Dashboard gets Earth and an asteroid belt */}
      {isDashboard && <Earth />}
      {isDashboard && !isMobile && !prefersReducedMotion && <AsteroidBelt />}

      {/* Detail page gets a scientific "data visualization" feel with sparkles */}
      {isDetail && !isMobile && (
         <Sparkles count={50} scale={15} size={20} speed={0.3} color="#00FFFF" opacity={0.5} />
      )}
    </>
  );
};


const ThreeBackground: React.FC = () => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none', background: '#000' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <Suspense fallback={null}>
                <SceneContent />
            </Suspense>
        </Canvas>
    </div>
  );
};

export default ThreeBackground;
