
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface LungsModelProps {
  pledgeCount: number;
  fillLevel: number;
}

function LungsModel({ pledgeCount, fillLevel }: LungsModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const fillRef = useRef<THREE.Mesh>(null);
  
  // Load GLB file
  const { scene } = useGLTF('/realistic_human_lungs.glb');
  
  // Breathing animation with larger scale
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const breatheScale = 2.0 + Math.sin(time * 0.5) * 0.1; // Larger base scale with subtle breathing
      meshRef.current.scale.setScalar(breatheScale);
      meshRef.current.rotation.y = Math.sin(time * 0.2) * 0.05; // Reduced rotation for better visibility
    }
  });

  // Apply material changes to GLB model
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material && mesh.material instanceof THREE.MeshStandardMaterial) {
            const material = mesh.material;
            if (material.color) {
              // Enhanced color progression from red (unhealthy) to vibrant green (healthy)
              const hue = fillLevel < 0.25 ? 0 : 120 * fillLevel;
              const saturation = 70 + fillLevel * 30;
              const lightness = 35 + fillLevel * 30;
              material.color = new THREE.Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
              material.opacity = 0.7 + fillLevel * 0.3; // More transparent to show fill effect
              material.transparent = true;
              material.metalness = 0.1;
              material.roughness = 0.4;
            }
          }
        }
      });
    }
  }, [fillLevel, scene]);

  // Create water bottle-like fill effect
  const fillHeight = fillLevel * 3; // Scale fill height
  const fillColor = fillLevel < 0.25 ? "#ef4444" : fillLevel < 0.5 ? "#f59e0b" : fillLevel < 0.75 ? "#f97316" : "#10b981";
  
  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* Render GLB model with larger scale */}
      <primitive object={scene.clone()} scale={[3, 3, 3]} />
      
      {/* Water bottle-like fill effect - positioned to fill from bottom */}
      <mesh 
        ref={fillRef}
        position={[0, -1.5 + fillHeight/2, 0]} // Position fill from bottom up
      >
        <boxGeometry args={[2.5, fillHeight, 1.5]} />
        <meshStandardMaterial 
          color={fillColor}
          transparent
          opacity={0.6}
          emissive={new THREE.Color(fillColor)}
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

interface LungsModel3DProps {
  pledgeCount: number;
}

const LungsModel3D: React.FC<LungsModel3DProps> = ({ pledgeCount }) => {
  // Adjusted fill level calculation: 100 pledges = 50%, 200 pledges = 100%
  const fillLevel = pledgeCount < 100 ? (pledgeCount / 100) * 0.5 : 0.5 + ((pledgeCount - 100) / 100) * 0.5;
  const cappedFillLevel = Math.min(fillLevel, 1);
  const fillPercentage = Math.round(cappedFillLevel * 100);
  
  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-sky-50 to-green-50 rounded-2xl overflow-hidden shadow-xl">
      {/* Logos positioned side by side at the top with higher z-index */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-30">
        <img 
          src="/lovable-uploads/fbdff461-1ffb-485c-8e93-3141b2515bc0.png" 
          alt="IKSC Logo" 
          className="h-16 w-auto object-contain drop-shadow-lg"
        />
        <img 
          src="/lovable-uploads/9c57fcd0-54f8-4f2a-8ff5-70b9175a0fb4.png" 
          alt="KARE Logo" 
          className="h-16 w-auto object-contain drop-shadow-lg"
        />
      </div>

      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        className="w-full h-full"
        style={{ zIndex: 10 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[-5, -5, -5]} intensity={0.8} color="#4ade80" />
        <spotLight position={[0, 10, 0]} intensity={1.0} color="#ffffff" />
        
        <Environment preset="studio" />
        
        <LungsModel pledgeCount={pledgeCount} fillLevel={cappedFillLevel} />
        
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          autoRotate={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.2}
          minDistance={4}
          maxDistance={12}
          zoomSpeed={0.8}
        />
      </Canvas>
      
      {/* Chapter name and progress information with higher z-index */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center z-20 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border">
        <h3 className="text-2xl font-bold text-gray-800">IKSC KARE</h3>
        <p className="text-lg font-semibold text-blue-600">Healthy Lungs Progress</p>
        <p className="text-gray-600 text-sm mt-1">
          {pledgeCount} / 200 pledges ({fillPercentage}% filled)
        </p>
        <div className="w-48 bg-gray-200 rounded-full h-3 mt-2">
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ease-out ${
              fillLevel < 0.25 ? 'bg-red-500' : 
              fillLevel < 0.5 ? 'bg-yellow-500' : 
              fillLevel < 0.75 ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${fillPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Enhanced status messages with higher z-index */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-20">
        {fillLevel < 0.25 && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm border-2 border-red-200 shadow-lg">
            🚨 Critical: Lungs need immediate care!
          </div>
        )}
        {fillLevel >= 0.25 && fillLevel < 0.5 && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm border-2 border-yellow-200 shadow-lg">
            ⚠️ Improving: Keep up the good work!
          </div>
        )}
        {fillLevel >= 0.5 && fillLevel < 0.75 && (
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm border-2 border-orange-200 shadow-lg">
            🌟 Halfway there! Great progress!
          </div>
        )}
        {fillLevel >= 0.75 && fillLevel < 1 && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm border-2 border-green-200 shadow-lg">
            🚀 Excellent! Almost at maximum health!
          </div>
        )}
        {fillLevel >= 1 && (
          <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm animate-pulse border-2 border-emerald-200 shadow-lg">
            🎉 Perfect Health! Mission Accomplished!
          </div>
        )}
      </div>
    </div>
  );
};

export default LungsModel3D;
