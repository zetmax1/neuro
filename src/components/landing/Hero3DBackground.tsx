import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

const Rectangle = ({ position, rotation, speed }: { position: [number, number, number], rotation: [number, number, number], speed: number }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((state, delta) => {
    mesh.current.rotation.x += speed * delta;
    mesh.current.rotation.y += speed * delta;
    mesh.current.position.y += Math.sin(state.clock.elapsedTime * speed) * 0.01;
  });

  return (
    <mesh position={position} rotation={rotation} ref={mesh}>
      <boxGeometry args={[1.5, 1.5, 0.1]} />
      <meshStandardMaterial color="#8b5cf6" transparent opacity={0.15} roughness={0.1} metalness={0.5} />
    </mesh>
  );
};

const Rectangles = () => {
  const rects = useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20 - 10
      ] as [number, number, number],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
      speed: Math.random() * 0.15 + 0.05,
    }));
  }, []);

  return (
    <>
      {rects.map((props, i) => (
        <Rectangle key={i} {...props} />
      ))}
    </>
  );
};

export const Hero3DBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Grid Pattern Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 mix-blend-screen opacity-70">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Rectangles />
        </Canvas>
      </div>

      {/* Fade out edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50" />
    </div>
  );
};
