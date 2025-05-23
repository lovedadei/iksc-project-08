
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface LungsModelProps {
  pledgeCount: number;
  fillLevel: number;
  shouldAnimate: boolean;
}

// Bottle component that contains the lungs
function Bottle({ fillLevel }: { fillLevel: number }) {
  const bottleRef = useRef<THREE.Group>(null);
  
  // Create bottle shape
  const bottleHeight = 5;
  const bottleRadius = 2;
  
  // Water level based on fill percentage
  const waterHeight = fillLevel * bottleHeight;
  
  return (
    <group ref={bottleRef}>
      {/* Bottle glass - more transparent cylinder */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[bottleRadius, bottleRadius, bottleHeight, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent={true}
          opacity={0.15}
          thickness={0.2}
          roughness={0}
          metalness={0}
          transmission={0.98}
        />
      </mesh>
      
      {/* Bottle cap */}
      <mesh position={[0, bottleHeight/2 + 0.3, 0]}>
        <cylinderGeometry args={[bottleRadius * 0.7, bottleRadius * 0.7, 0.6, 32]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      
      {/* Green water inside bottle */}
      <mesh position={[0, -bottleHeight/2 + waterHeight/2, 0]}>
        <cylinderGeometry args={[bottleRadius * 0.95, bottleRadius * 0.95, waterHeight, 32]} />
        <meshStandardMaterial
          color="#10b981"
          transparent={true}
          opacity={0.4}
          emissive="#10b981"
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
}

function LungsModel({ pledgeCount, fillLevel, shouldAnimate }: LungsModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const fillRef = useRef<THREE.Mesh>(null);
  const [animationScale, setAnimationScale] = useState(1);
  
  // Load GLB file
  const { scene } = useGLTF('/realistic_human_lungs.glb');
  
  // Breathing animation with blooming effect
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const breatheScale = 1.2 + Math.sin(time * 0.5) * 0.03;
      
      // Apply blooming animation when shouldAnimate is true
      const bloomScale = shouldAnimate ? 1 + Math.sin(time * 8) * 0.2 : 1;
      
      meshRef.current.scale.setScalar(breatheScale * bloomScale * animationScale);
      meshRef.current.rotation.y = Math.sin(time * 0.2) * 0.05;
    }
    
    // Animate fill with blooming effect
    if (fillRef.current && shouldAnimate) {
      const time = state.clock.getElapsedTime();
      const bloomPulse = 1 + Math.sin(time * 6) * 0.3;
      fillRef.current.scale.set(bloomPulse, 1, bloomPulse);
    } else if (fillRef.current) {
      fillRef.current.scale.set(1, 1, 1);
    }
  });

  // Trigger blooming animation
  useEffect(() => {
    if (shouldAnimate) {
      setAnimationScale(1.3);
      const timer = setTimeout(() => {
        setAnimationScale(1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [shouldAnimate]);

  // Apply material changes to GLB model - make lungs greener and more visible
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material && mesh.material instanceof THREE.MeshStandardMaterial) {
            const material = mesh.material;
            // Make lungs bright green and more visible
            const greenIntensity = 0.5 + fillLevel * 0.5;
            material.color = new THREE.Color(0.2, 0.8, 0.4); // Bright green color
            material.opacity = 0.9; // More opaque
            material.transparent = true;
            material.metalness = 0.2;
            material.roughness = 0.3;
            material.emissive = new THREE.Color("#10b981");
            material.emissiveIntensity = fillLevel * 0.4 + 0.2; // Always some glow
          }
        }
      });
    }
  }, [fillLevel, scene]);

  return (
    <group ref={meshRef} position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
      {/* Render GLB model with scaled size - positioned to be clearly visible */}
      <primitive object={scene.clone()} position={[0, 0, 0]} />
      
      {/* Add blooming particle effect when animating */}
      {shouldAnimate && (
        <>
          {[...Array(6)].map((_, i) => (
            <mesh key={i} position={[
              Math.cos(i * Math.PI / 3) * 1.5,
              Math.sin(i * Math.PI / 3) * 1.2,
              Math.sin(i * Math.PI / 3) * 0.5
            ]}>
              <sphereGeometry args={[0.1]} />
              <meshStandardMaterial 
                color="#10b981"
                emissive="#10b981"
                emissiveIntensity={0.8}
                transparent
                opacity={0.7}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

interface LungsModel3DProps {
  pledgeCount: number;
  shouldAnimate?: boolean;
}

const LungsModel3D: React.FC<LungsModel3DProps> = ({ pledgeCount, shouldAnimate = false }) => {
  // Adjusted fill level calculation: 100 pledges = 50%, 200 pledges = 100%
  const fillLevel = pledgeCount < 100 ? (pledgeCount / 100) * 0.5 : 0.5 + ((pledgeCount - 100) / 100) * 0.5;
  const cappedFillLevel = Math.min(fillLevel, 1);
  const fillPercentage = Math.round(cappedFillLevel * 100);
  
  // Health comparison levels
  const getHealthStatus = (level: number) => {
    if (level < 0.25) return { label: "At Risk", color: "text-red-800 bg-red-100 border-red-200" };
    if (level < 0.5) return { label: "Good", color: "text-yellow-800 bg-yellow-100 border-yellow-200" };
    if (level < 0.75) return { label: "Better", color: "text-orange-800 bg-orange-100 border-orange-200" };
    if (level < 1) return { label: "Excellent", color: "text-green-800 bg-green-100 border-green-200" };
    return { label: "Maximum Health", color: "text-emerald-800 bg-emerald-100 border-emerald-200" };
  };
  
  const healthStatus = getHealthStatus(cappedFillLevel);
  
  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-sky-50 to-green-50 rounded-2xl overflow-hidden shadow-xl">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        className="w-full h-full"
        style={{ zIndex: 10 }}
        shadows
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
        <pointLight position={[-5, -5, -5]} intensity={1.2} color="#10b981" />
        <spotLight position={[0, 10, 0]} intensity={1.5} color="#ffffff" />
        
        <Environment preset="studio" />
        
        {/* Bottle containing the lungs */}
        <Bottle fillLevel={cappedFillLevel} />
        
        {/* Lungs model - positioned to be clearly visible inside bottle */}
        <group position={[0, -0.5, 0]}>
          <LungsModel pledgeCount={pledgeCount} fillLevel={cappedFillLevel} shouldAnimate={shouldAnimate} />
        </group>
        
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          autoRotate={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.2}
          minDistance={4}
          maxDistance={12}
          zoomSpeed={1.2}
        />
      </Canvas>
      
      {/* Health status comparison indicator */}
      <div className="absolute top-1/2 right-6 transform -translate-y-1/2 z-20 space-y-2">
        <div className={`px-4 py-2 rounded-lg text-sm ${fillLevel >= 1 ? "animate-pulse" : ""} ${fillLevel >= 1 ? "bg-emerald-100 border-2 border-emerald-200 text-emerald-800" : "bg-white/50 border border-gray-200 text-gray-400"}`}>
          Maximum Health
        </div>
        <div className={`px-4 py-2 rounded-lg text-sm ${fillLevel >= 0.75 && fillLevel < 1 ? "animate-pulse" : ""} ${fillLevel >= 0.75 ? "bg-green-100 border-2 border-green-200 text-green-800" : "bg-white/50 border border-gray-200 text-gray-400"}`}>
          Excellent
        </div>
        <div className={`px-4 py-2 rounded-lg text-sm ${fillLevel >= 0.5 && fillLevel < 0.75 ? "animate-pulse" : ""} ${fillLevel >= 0.5 ? "bg-orange-100 border-2 border-orange-200 text-orange-800" : "bg-white/50 border border-gray-200 text-gray-400"}`}>
          Better
        </div>
        <div className={`px-4 py-2 rounded-lg text-sm ${fillLevel >= 0.25 && fillLevel < 0.5 ? "animate-pulse" : ""} ${fillLevel >= 0.25 ? "bg-yellow-100 border-2 border-yellow-200 text-yellow-800" : "bg-white/50 border border-gray-200 text-gray-400"}`}>
          Good
        </div>
        <div className={`px-4 py-2 rounded-lg text-sm ${fillLevel < 0.25 ? "animate-pulse" : ""} ${fillLevel < 0.25 ? "bg-red-100 border-2 border-red-200 text-red-800" : "bg-white/50 border border-gray-200 text-gray-400"}`}>
          At Risk
        </div>
      </div>
      
      {/* Pledge count and percentage */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center z-20 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border">
        <p className="text-2xl font-bold text-gray-800">{pledgeCount} Pledges</p>
        <p className="text-lg text-gray-600">{fillPercentage}% Filled</p>
        <div className="w-48 bg-gray-200 rounded-full h-3 mt-2">
          <div 
            className="h-3 rounded-full transition-all duration-1000 ease-out bg-green-500"
            style={{ width: `${fillPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Current health status indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-20">
        <div className={`px-6 py-3 rounded-full text-sm font-medium ${healthStatus.color} border-2 animate-pulse shadow-lg`}>
          {`🫁 Current Status: ${healthStatus.label}`}
        </div>
      </div>
    </div>
  );
};

export default LungsModel3D;
