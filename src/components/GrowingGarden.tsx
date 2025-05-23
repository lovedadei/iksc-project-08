
import React, { useEffect, useState } from 'react';

interface GrowingGardenProps {
  pledgeCount: number;
}

const GrowingGarden: React.FC<GrowingGardenProps> = ({ pledgeCount }) => {
  const [visibleBlooms, setVisibleBlooms] = useState<number[]>([]);
  const [breatheAnimation, setBreatheAnimation] = useState(false);

  useEffect(() => {
    // Animate blooms appearing one by one
    const timer = setTimeout(() => {
      if (visibleBlooms.length < pledgeCount) {
        setVisibleBlooms(prev => [...prev, prev.length]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [pledgeCount, visibleBlooms.length]);

  useEffect(() => {
    // Start breathe animation cycle
    const breatheInterval = setInterval(() => {
      setBreatheAnimation(prev => !prev);
    }, 4000);

    return () => clearInterval(breatheInterval);
  }, []);

  const generateBloomPosition = (index: number) => {
    // Create a more natural, organic arrangement
    const positions = [
      { left: '10%', top: '20%' },
      { left: '30%', top: '60%' },
      { left: '70%', top: '30%' },
      { left: '50%', top: '80%' },
      { left: '80%', top: '70%' },
      { left: '20%', top: '70%' },
      { left: '60%', top: '15%' },
      { left: '90%', top: '40%' },
      { left: '40%', top: '40%' },
      { left: '15%', top: '45%' },
    ];
    
    return positions[index % positions.length] || { left: '50%', top: '50%' };
  };

  const bloomColors = [
    'text-pink-400',
    'text-purple-400', 
    'text-rose-400',
    'text-fuchsia-400',
    'text-pink-300',
    'text-purple-300'
  ];

  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-sky-100 to-green-100 rounded-2xl overflow-hidden shadow-lg">
      {/* Background grass/ground */}
      <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-green-200 to-green-100"></div>
      
      {/* Lungs Visualization */}
      <div className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ${breatheAnimation ? 'scale-110' : 'scale-100'} transition-transform duration-4000 ease-in-out z-0 opacity-20`}>
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left Lung */}
          <path 
            d="M40 50C40 50 30 60 30 80C30 100 25 120 25 140C25 160 30 170 40 175C50 180 60 175 65 165C70 155 70 130 70 110C70 90 70 70 65 60C60 50 50 50 40 50Z" 
            className={`${breatheAnimation ? 'fill-green-300' : 'fill-green-200'} transition-colors duration-4000 ease-in-out`} 
            stroke="#475569" 
            strokeWidth="2"
          />
          
          {/* Right Lung */}
          <path 
            d="M160 50C160 50 170 60 170 80C170 100 175 120 175 140C175 160 170 170 160 175C150 180 140 175 135 165C130 155 130 130 130 110C130 90 130 70 135 60C140 50 150 50 160 50Z" 
            className={`${breatheAnimation ? 'fill-green-300' : 'fill-green-200'} transition-colors duration-4000 ease-in-out`} 
            stroke="#475569" 
            strokeWidth="2"
          />
          
          {/* Trachea */}
          <path 
            d="M100 30L100 70M70 70L130 70" 
            stroke="#475569" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
          
          {/* Bronchi */}
          <path 
            d="M100 70C100 70 80 70 65 80M100 70C100 70 120 70 135 80" 
            stroke="#475569" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
        </svg>
      </div>
      
      {/* Garden title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center z-10">
        <h3 className="text-2xl font-bold text-gray-800">Healthy Lungs Garden</h3>
        <p className="text-gray-600 text-sm mt-1">
          {pledgeCount} {pledgeCount === 1 ? 'bloom' : 'blooms'} and growing! 🌱
        </p>
      </div>

      {/* Animated blooms */}
      {visibleBlooms.map((bloomIndex) => {
        const position = generateBloomPosition(bloomIndex);
        const colorClass = bloomColors[bloomIndex % bloomColors.length];
        
        return (
          <div
            key={bloomIndex}
            className={`absolute bloom-animation gentle-sway ${colorClass} z-10`}
            style={{ 
              left: position.left, 
              top: position.top,
              animationDelay: `${bloomIndex * 0.2}s`
            }}
          >
            <div className="text-4xl drop-shadow-lg">🌸</div>
          </div>
        );
      })}

      {/* Decorative elements */}
      <div className="absolute bottom-5 left-5 text-2xl gentle-sway z-10">🌿</div>
      <div className="absolute bottom-8 right-8 text-2xl gentle-sway z-10" style={{ animationDelay: '1s' }}>🌿</div>
      <div className="absolute top-1/2 left-2 text-xl gentle-sway z-10" style={{ animationDelay: '2s' }}>🍃</div>
      <div className="absolute top-1/3 right-4 text-xl gentle-sway z-10" style={{ animationDelay: '1.5s' }}>🍃</div>

      {/* Floating particles for atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60 pulse-grow"
            style={{
              left: `${20 + (i * 15)}%`,
              top: `${10 + (i * 8)}%`,
              animationDelay: `${i * 0.7}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default GrowingGarden;
