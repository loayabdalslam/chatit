import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, X } from 'lucide-react';

interface VoiceAssistant3DProps {
  isListening: boolean;
  isSpeaking: boolean;
  isVoiceMode: boolean;
  onToggleVoiceMode: () => void;
  className?: string;
}

export const VoiceAssistant3D: React.FC<VoiceAssistant3DProps> = ({
  isListening,
  isSpeaking,
  isVoiceMode,
  onToggleVoiceMode,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(8).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Set up 3D perspective
      const centerX = width / 2;
      const centerY = height / 2;
      const time = Date.now() * 0.001;
      
      // Draw 3D sphere with voice visualization
      drawVoiceAssistant3D(ctx, centerX, centerY, time, isListening, isSpeaking);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, isSpeaking]);

  const drawVoiceAssistant3D = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    time: number,
    listening: boolean,
    speaking: boolean
  ) => {
    const baseRadius = 60;
    const pulseRadius = listening ? baseRadius + Math.sin(time * 8) * 8 : 
                     speaking ? baseRadius + Math.sin(time * 12) * 12 : baseRadius;
    
    // Create gradient for 3D effect
    const gradient = ctx.createRadialGradient(
      centerX - 20, centerY - 20, 0,
      centerX, centerY, pulseRadius * 1.5
    );
    
    if (listening) {
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, '#87ceeb');
      gradient.addColorStop(0.7, '#4682b4');
      gradient.addColorStop(1, '#1e3a8a');
    } else if (speaking) {
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, '#60a5fa');
      gradient.addColorStop(0.7, '#3b82f6');
      gradient.addColorStop(1, '#1d4ed8');
    } else {
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(0.3, '#e2e8f0');
      gradient.addColorStop(0.7, '#94a3b8');
      gradient.addColorStop(1, '#475569');
    }
    
    // Draw main sphere
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add highlight for 3D effect
    const highlightGradient = ctx.createRadialGradient(
      centerX - 15, centerY - 15, 0,
      centerX - 15, centerY - 15, 25
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.beginPath();
    ctx.arc(centerX - 15, centerY - 15, 25, 0, Math.PI * 2);
    ctx.fillStyle = highlightGradient;
    ctx.fill();
    
    // Draw voice visualization rings
    if (listening || speaking) {
      for (let i = 0; i < 3; i++) {
        const ringRadius = pulseRadius + (i + 1) * 20 + Math.sin(time * 4 + i) * 5;
        const opacity = listening ? 0.3 - i * 0.1 : speaking ? 0.4 - i * 0.1 : 0;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(135, 206, 235, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    
    // Draw audio level bars when speaking
    if (speaking) {
      const barCount = 8;
      const barWidth = 3;
      const barSpacing = 6;
      const maxBarHeight = 30;
      
      for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2;
        const barRadius = pulseRadius + 25;
        const barX = centerX + Math.cos(angle) * barRadius;
        const barY = centerY + Math.sin(angle) * barRadius;
        
        const level = Math.sin(time * 10 + i) * 0.5 + 0.5;
        const barHeight = level * maxBarHeight;
        
        ctx.beginPath();
        ctx.rect(barX - barWidth / 2, barY - barHeight / 2, barWidth, barHeight);
        ctx.fillStyle = '#60a5fa';
        ctx.fill();
      }
    }
    
    // Draw microphone icon when listening
    if (listening) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎤', centerX, centerY);
    }
    
    // Draw speaker icon when speaking
    if (speaking) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔊', centerX, centerY);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          className="w-full h-full"
        />
        
        {/* Voice mode toggle */}
        <motion.button
          onClick={onToggleVoiceMode}
          className={`absolute bottom-2 right-2 p-2 rounded-full shadow-lg transition-all duration-300 ${
            isVoiceMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isVoiceMode ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </motion.button>
        
        {/* Status indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-2">
          {isListening && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs"
            >
              <Mic className="w-3 h-3" />
              <span>Listening</span>
            </motion.div>
          )}
          
          {isSpeaking && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs"
            >
              <Volume2 className="w-3 h-3" />
              <span>Speaking</span>
            </motion.div>
          )}
        </div>
        
        {/* Close button */}
        <motion.button
          onClick={() => {
            // Close voice assistant
            if (typeof onToggleVoiceMode === 'function') {
              onToggleVoiceMode();
            }
          }}
          className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-full shadow-sm transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Close voice assistant"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      </motion.div>
    </div>
  );
};