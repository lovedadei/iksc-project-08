
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface LungsModelProps {
  pledgeCount: number;
  fillLevel: number; // 0 to 1 based on pledge count
}

function LungsModel({ pledgeCount, fillLevel }: LungsModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [breathePhase, setBreathePhase] = useState(0);

  // Breathing animation
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const breatheScale = 1 + Math.sin(time * 0.5) * 0.1; // Slow breathing effect
      meshRef.current.scale.setScalar(breatheScale);
      
      // Gentle rotation
      meshRef.current.rotation.y = Math.sin(time * 0.2) * 0.1;
    }
  });

  // For now, we'll create a procedural lungs model since we don't have a GLB file
  // In production, you would replace this with: const { scene } = useGLTF('/path/to/lungs.glb');
  
  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* Left Lung */}
      <mesh position={[-0.8, 0, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial 
          color={`hsl(${120 + fillLevel * 60}, 70%, ${40 + fillLevel * 20}%)`}
          opacity={0.8 + fillLevel * 0.2}
          transparent
        />
      </mesh>
      
      {/* Right Lung */}
      <mesh position={[0.8, 0, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial 
          color={`hsl(${120 + fillLevel * 60}, 70%, ${40 + fillLevel * 20}%)`}
          opacity={0.8 + fillLevel * 0.2}
          transparent
        />
      </mesh>
      
      {/* Trachea */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      
      {/* Fill level indicator - particles/energy */}
      {Array.from({ length: Math.floor(fillLevel * 50) }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 0.5
          ]}
        >
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial 
            color="#10b981" 
            emissive="#065f46"
            emissiveIntensity={fillLevel}
          />
        </mesh>
      ))}
    </group>
  );
}

interface LungsModel3DProps {
  pledgeCount: number;
}

const LungsModel3D: React.FC<LungsModel3DProps> = ({ pledgeCount }) => {
  // Calculate fill level: 0 at 0 pledges, 0.5 at 100 pledges, 1.0 at 200 pledges
  const fillLevel = Math.min(pledgeCount / 200, 1);
  const fillPercentage = Math.round(fillLevel * 100);
  
  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-sky-100 to-green-100 rounded-2xl overflow-hidden shadow-lg">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        className="w-full h-full"
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.4} color="#4ade80" />
        
        {/* Environment for better lighting */}
        <Environment preset="studio" />
        
        {/* Lungs Model */}
        <LungsModel pledgeCount={pledgeCount} fillLevel={fillLevel} />
        
        {/* Camera Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
      
      {/* Overlay Information */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center z-10 bg-white/90 backdrop-blur-sm rounded-lg p-4">
        <h3 className="text-2xl font-bold text-gray-800">Healthy Lungs Progress</h3>
        <p className="text-gray-600 text-sm mt-1">
          {pledgeCount} / 200 pledges ({fillPercentage}% filled)
        </p>
        <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${fillPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Status Messages */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-10">
        {fillLevel < 0.25 && (
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm">
            🌱 Just getting started! Keep growing!
          </div>
        )}
        {fillLevel >= 0.25 && fillLevel < 0.5 && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm">
            💚 Great progress! Lungs are getting healthier!
          </div>
        )}
        {fillLevel >= 0.5 && fillLevel < 0.75 && (
          <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm">
            🌟 Halfway there! Amazing commitment!
          </div>
        )}
        {fillLevel >= 0.75 && fillLevel < 1 && (
          <div className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm">
            🚀 Almost at full capacity! Incredible!
          </div>
        )}
        {fillLevel >= 1 && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm animate-pulse">
            🎉 Maximum health achieved! Outstanding!
          </div>
        )}
      </div>
      
      {/* Floating health particles */}
      <div className="absolute inset-0 pointer-events-none z-5">
        {Array.from({ length: Math.floor(fillLevel * 10) }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-green-400 rounded-full opacity-60 animate-pulse"
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${15 + (i * 6)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LungsModel3D;
