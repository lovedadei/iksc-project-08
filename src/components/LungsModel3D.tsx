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
  
  // Load GLB file - try the realistic_human_lungs.glb file that's in public
  const { scene } = useGLTF('/realistic_human_lungs.glb');
  
  // Breathing animation with larger scale
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const breatheScale = 1.5 + Math.sin(time * 0.5) * 0.15; // Increased base scale and breathing amplitude
      meshRef.current.scale.setScalar(breatheScale);
      meshRef.current.rotation.y = Math.sin(time * 0.2) * 0.1;
    }
  });

  // Apply material changes to GLB model with improved visibility
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          const material = child.material;
          if (material.color) {
            // Enhanced color progression from red (unhealthy) to vibrant green (healthy)
            const hue = fillLevel < 0.25 ? 0 : 120 * fillLevel; // Red to green progression
            const saturation = 70 + fillLevel * 30; // Increase saturation with health
            const lightness = 35 + fillLevel * 30; // Increase brightness with health
            material.color = new THREE.Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
            material.opacity = 0.85 + fillLevel * 0.15;
            material.transparent = true;
            material.metalness = 0.1;
            material.roughness = 0.3;
          }
        }
      });
    }
  }, [fillLevel, scene]);
  
  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* Render GLB model with larger scale */}
      <primitive object={scene.clone()} scale={[2, 2, 2]} />
      
      {/* Enhanced fill level indicator particles */}
      {Array.from({ length: Math.floor(fillLevel * 80) }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 2.5,
            (Math.random() - 0.5) * 1
          ]}
        >
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial 
            color={new THREE.Color(fillLevel < 0.25 ? "#ef4444" : "#10b981")} 
            emissive={new THREE.Color(fillLevel < 0.25 ? "#7f1d1d" : "#065f46")}
            emissiveIntensity={fillLevel * 0.8}
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
  // Adjusted fill level calculation: 5 pledges = 50%, 200 pledges = 100%
  const fillLevel = pledgeCount < 5 ? (pledgeCount / 5) * 0.5 : 0.5 + ((pledgeCount - 5) / 195) * 0.5;
  const cappedFillLevel = Math.min(fillLevel, 1);
  const fillPercentage = Math.round(cappedFillLevel * 100);
  
  return (
    <div className="relative w-full h-[500px] bg-gradient-to-b from-sky-100 to-green-100 rounded-2xl overflow-hidden shadow-lg">
      {/* Logos positioned side by side at the top */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <img 
          src="/lovable-uploads/fbdff461-1ffb-485c-8e93-3141b2515bc0.png" 
          alt="IKSC Logo" 
          className="h-16 w-auto object-contain"
        />
        <img 
          src="/lovable-uploads/9c57fcd0-54f8-4f2a-8ff5-70b9175a0fb4.png" 
          alt="KARE Logo" 
          className="h-16 w-auto object-contain"
        />
      </div>

      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -5, -5]} intensity={0.6} color="#4ade80" />
        <spotLight position={[0, 10, 0]} intensity={0.8} color="#ffffff" />
        
        <Environment preset="studio" />
        
        <LungsModel pledgeCount={pledgeCount} fillLevel={cappedFillLevel} />
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.3}
          minDistance={3}
          maxDistance={8}
        />
      </Canvas>
      
      {/* Chapter name and progress information */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center z-10 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
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
      
      {/* Enhanced status messages */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-10">
        {fillLevel < 0.25 && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm border-2 border-red-200">
            🚨 Critical: Lungs need immediate care!
          </div>
        )}
        {fillLevel >= 0.25 && fillLevel < 0.5 && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm border-2 border-yellow-200">
            ⚠️ Improving: Keep up the good work!
          </div>
        )}
        {fillLevel >= 0.5 && fillLevel < 0.75 && (
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm border-2 border-orange-200">
            🌟 Halfway there! Great progress!
          </div>
        )}
        {fillLevel >= 0.75 && fillLevel < 1 && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm border-2 border-green-200">
            🚀 Excellent! Almost at maximum health!
          </div>
        )}
        {fillLevel >= 1 && (
          <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm animate-pulse border-2 border-emerald-200">
            🎉 Perfect Health! Mission Accomplished!
          </div>
        )}
      </div>
      
      {/* Enhanced floating health particles */}
      <div className="absolute inset-0 pointer-events-none z-5">
        {Array.from({ length: Math.floor(cappedFillLevel * 15) }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 rounded-full opacity-70 animate-pulse ${
              cappedFillLevel < 0.25 ? 'bg-red-400' : 
              cappedFillLevel < 0.5 ? 'bg-yellow-400' : 
              cappedFillLevel < 0.75 ? 'bg-orange-400' : 'bg-green-400'
            }`}
            style={{
              left: `${5 + (i * 6)}%`,
              top: `${20 + (i * 4)}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${1.5 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LungsModel3D;
