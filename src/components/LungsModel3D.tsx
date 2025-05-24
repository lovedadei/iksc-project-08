
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface LungsModelProps {
  pledgeCount: number;
  fillLevel: number;
  shouldAnimate: boolean;
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
      const breatheScale = 1.2 + Math.sin(time * 0.5) * 0.05;
      
      // Apply blooming animation when shouldAnimate is true
      const bloomScale = shouldAnimate ? 1 + Math.sin(time * 8) * 0.3 : 1;
      
      meshRef.current.scale.setScalar(breatheScale * bloomScale * animationScale);
      meshRef.current.rotation.y = Math.sin(time * 0.2) * 0.1;
    }
    
    // Animate fill with blooming effect
    if (fillRef.current && shouldAnimate) {
      const time = state.clock.getElapsedTime();
      const bloomPulse = 1 + Math.sin(time * 6) * 0.4;
      fillRef.current.scale.set(bloomPulse, 1, bloomPulse);
    } else if (fillRef.current) {
      fillRef.current.scale.set(1, 1, 1);
    }
  });

  // Trigger blooming animation
  useEffect(() => {
    if (shouldAnimate) {
      setAnimationScale(1.5);
      const timer = setTimeout(() => {
        setAnimationScale(1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [shouldAnimate]);

  // Apply material changes to GLB model - make lungs very bright and visible
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material && mesh.material instanceof THREE.MeshStandardMaterial) {
            const material = mesh.material;
            // Make lungs extremely bright green and visible
            material.color = new THREE.Color(0.0, 1.0, 0.2); // Very bright green
            material.opacity = 1.0; // Fully opaque
            material.transparent = false;
            material.metalness = 0.0;
            material.roughness = 0.1;
            material.emissive = new THREE.Color("#00ff44");
            material.emissiveIntensity = fillLevel * 0.8 + 0.5; // Very strong glow
          }
        }
      });
    }
  }, [fillLevel, scene]);

  return (
    <group ref={meshRef} position={[0, 0, 0]} scale={[3.0, 3.0, 3.0]}>
      {/* Render GLB model with much larger size */}
      <primitive object={scene.clone()} position={[0, 0, 0]} />
      
      {/* Add blooming particle effect when animating */}
      {shouldAnimate && (
        <>
          {[...Array(8)].map((_, i) => (
            <mesh key={i} position={[
              Math.cos(i * Math.PI / 4) * 2.0,
              Math.sin(i * Math.PI / 4) * 1.5,
              Math.sin(i * Math.PI / 4) * 0.8
            ]}>
              <sphereGeometry args={[0.15]} />
              <meshStandardMaterial 
                color="#00ff44"
                emissive="#00ff44"
                emissiveIntensity={1.0}
                transparent
                opacity={0.8}
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
  const [activeHealth, setActiveHealth] = useState<string | null>(null);
  
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

  const handleHealthClick = (healthType: string) => {
    setActiveHealth(healthType);
    setTimeout(() => {
      setActiveHealth(null);
    }, 1000); // Show for 1 second
  };
  
  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-sky-50 to-green-50 rounded-2xl overflow-hidden shadow-xl">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        className="w-full h-full"
        style={{ zIndex: 10 }}
        shadows
      >
        <ambientLight intensity={2.0} />
        <directionalLight position={[5, 5, 5]} intensity={3.0} castShadow />
        <pointLight position={[-5, -5, -5]} intensity={2.0} color="#00ff44" />
        <pointLight position={[5, -5, 5]} intensity={2.0} color="#00ff44" />
        <spotLight position={[0, 10, 0]} intensity={3.0} color="#ffffff" />
        
        <Environment preset="studio" />
        
        {/* Lungs model - much larger and more visible */}
        <group position={[0, 0, 0]}>
          <LungsModel pledgeCount={pledgeCount} fillLevel={cappedFillLevel} shouldAnimate={shouldAnimate} />
        </group>
        
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          autoRotate={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.2}
          minDistance={6}
          maxDistance={15}
          zoomSpeed={1.2}
        />
      </Canvas>
      
      {/* Interactive health status comparison indicators */}
      <div className="absolute top-1/2 right-6 transform -translate-y-1/2 z-20 space-y-2">
        <button
          onClick={() => handleHealthClick('maximum')}
          className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
            activeHealth === 'maximum' ? 'scale-110 shadow-lg' : ''
          } ${
            fillLevel >= 1 || activeHealth === 'maximum' 
              ? "bg-emerald-100 border-2 border-emerald-200 text-emerald-800 animate-pulse" 
              : "bg-white/50 border border-gray-200 text-gray-400 hover:bg-white/70"
          }`}
        >
          Maximum Health
        </button>
        <button
          onClick={() => handleHealthClick('excellent')}
          className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
            activeHealth === 'excellent' ? 'scale-110 shadow-lg' : ''
          } ${
            (fillLevel >= 0.75 && fillLevel < 1) || activeHealth === 'excellent'
              ? "bg-green-100 border-2 border-green-200 text-green-800 animate-pulse" 
              : "bg-white/50 border border-gray-200 text-gray-400 hover:bg-white/70"
          }`}
        >
          Excellent
        </button>
        <button
          onClick={() => handleHealthClick('better')}
          className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
            activeHealth === 'better' ? 'scale-110 shadow-lg' : ''
          } ${
            (fillLevel >= 0.5 && fillLevel < 0.75) || activeHealth === 'better'
              ? "bg-orange-100 border-2 border-orange-200 text-orange-800 animate-pulse" 
              : "bg-white/50 border border-gray-200 text-gray-400 hover:bg-white/70"
          }`}
        >
          Better
        </button>
        <button
          onClick={() => handleHealthClick('good')}
          className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
            activeHealth === 'good' ? 'scale-110 shadow-lg' : ''
          } ${
            (fillLevel >= 0.25 && fillLevel < 0.5) || activeHealth === 'good'
              ? "bg-yellow-100 border-2 border-yellow-200 text-yellow-800 animate-pulse" 
              : "bg-white/50 border border-gray-200 text-gray-400 hover:bg-white/70"
          }`}
        >
          Good
        </button>
        <button
          onClick={() => handleHealthClick('atrisk')}
          className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
            activeHealth === 'atrisk' ? 'scale-110 shadow-lg' : ''
          } ${
            fillLevel < 0.25 || activeHealth === 'atrisk'
              ? "bg-red-100 border-2 border-red-200 text-red-800 animate-pulse" 
              : "bg-white/50 border border-gray-200 text-gray-400 hover:bg-white/70"
          }`}
        >
          At Risk
        </button>
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
