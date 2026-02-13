import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ZoomIn, ZoomOut, Maximize, Minimize, ChevronLeft, ChevronRight,
    Play, Pause, Volume2, VolumeX, RotateCw, Info
} from 'lucide-react';
import { Button } from './ui/button';
import toast from 'react-hot-toast';

/**
 * VirtualTourViewer Component
 * Immersive 360° image and video viewer with pan, zoom, and touch controls
 * Supports multiple 360° images and single 360° video
 */
const VirtualTourViewer = ({ projectId, virtualTourData, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showInfo, setShowInfo] = useState(true);
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [viewAngle, setViewAngle] = useState({ yaw: 0, pitch: 0 });

    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const videoRef = useRef(null);

    const { type, images360, video360, enabled } = virtualTourData || {};
    const currentMedia = type === '360_image' ? images360?.[currentIndex] : video360;

    useEffect(() => {
        // Auto-hide info after 5 seconds
        const timer = setTimeout(() => setShowInfo(false), 5000);
        return () => clearTimeout(timer);
    }, [currentIndex]);

    useEffect(() => {
        // Handle fullscreen changes
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        setViewAngle(prev => ({
            yaw: prev.yaw + deltaX * 0.1,
            pitch: Math.max(-90, Math.min(90, prev.pitch - deltaY * 0.1))
        }));

        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        }
    };

    const handleTouchMove = (e) => {
        if (!isDragging || e.touches.length !== 1) return;

        const deltaX = e.touches[0].clientX - dragStart.x;
        const deltaY = e.touches[0].clientY - dragStart.y;

        setViewAngle(prev => ({
            yaw: prev.yaw + deltaX * 0.1,
            pitch: Math.max(-90, Math.min(90, prev.pitch - deltaY * 0.1))
        }));

        setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(200, prev + 10));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(50, prev - 10));
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            try {
                await containerRef.current?.requestFullscreen();
            } catch (error) {
                toast.error('Fullscreen not supported');
            }
        } else {
            document.exitFullscreen();
        }
    };

    const handlePrevious = () => {
        if (type === '360_image' && images360?.length > 1) {
            setCurrentIndex(prev => (prev - 1 + images360.length) % images360.length);
            setViewAngle({ yaw: 0, pitch: 0 });
        }
    };

    const handleNext = () => {
        if (type === '360_image' && images360?.length > 1) {
            setCurrentIndex(prev => (prev + 1) % images360.length);
            setViewAngle({ yaw: 0, pitch: 0 });
        }
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const resetView = () => {
        setViewAngle({ yaw: 0, pitch: 0 });
        setZoom(100);
        setRotation(0);
        toast.success('View reset');
    };

    if (!enabled || !currentMedia) {
        return null;
    }

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Close Button */}
            <Button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12 p-0"
            >
                <X className="h-6 w-6" />
            </Button>

            {/* Info Overlay */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-4 left-4 z-40 bg-black/70 backdrop-blur-md text-white p-4 rounded-lg max-w-md"
                    >
                        <h3 className="font-bold text-lg mb-1">{currentMedia.title}</h3>
                        {currentMedia.description && (
                            <p className="text-sm text-gray-300">{currentMedia.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                            Drag to look around • Scroll to zoom • {type === '360_image' && images360?.length > 1 ? 'Use arrows to navigate' : ''}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Viewer */}
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
                {type === '360_image' && (
                    <div
                        ref={imageRef}
                        className="relative w-full h-full cursor-grab active:cursor-grabbing"
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        style={{
                            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                            transition: isDragging ? 'none' : 'transform 0.3s ease'
                        }}
                    >
                        <img
                            src={currentMedia.url}
                            alt={currentMedia.title}
                            className="w-full h-full object-cover"
                            style={{
                                transform: `rotateY(${viewAngle.yaw}deg) rotateX(${viewAngle.pitch}deg)`,
                                transformStyle: 'preserve-3d'
                            }}
                            draggable={false}
                        />
                    </div>
                )}

                {type === '360_video' && (
                    <video
                        ref={videoRef}
                        src={currentMedia.url}
                        className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        style={{
                            transform: `scale(${zoom / 100}) rotateY(${viewAngle.yaw}deg) rotateX(${viewAngle.pitch}deg)`,
                            transformStyle: 'preserve-3d',
                            transition: isDragging ? 'none' : 'transform 0.3s ease'
                        }}
                        loop
                        playsInline
                    />
                )}
            </div>

            {/* Navigation Controls (for multiple images) */}
            {type === '360_image' && images360?.length > 1 && (
                <>
                    <Button
                        onClick={handlePrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white rounded-full h-14 w-14 p-0"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </Button>
                    <Button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white rounded-full h-14 w-14 p-0"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </Button>

                    {/* Image Counter */}
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm">
                        {currentIndex + 1} / {images360.length}
                    </div>
                </>
            )}

            {/* Control Bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-black/70 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-3">
                {/* Zoom Controls */}
                <Button
                    onClick={handleZoomOut}
                    className="bg-transparent hover:bg-white/10 text-white h-10 w-10 p-0 rounded-full"
                    title="Zoom Out"
                >
                    <ZoomOut className="h-5 w-5" />
                </Button>
                <span className="text-white text-sm font-medium w-12 text-center">{zoom}%</span>
                <Button
                    onClick={handleZoomIn}
                    className="bg-transparent hover:bg-white/10 text-white h-10 w-10 p-0 rounded-full"
                    title="Zoom In"
                >
                    <ZoomIn className="h-5 w-5" />
                </Button>

                <div className="w-px h-6 bg-white/30 mx-2" />

                {/* Video Controls */}
                {type === '360_video' && (
                    <>
                        <Button
                            onClick={togglePlayPause}
                            className="bg-transparent hover:bg-white/10 text-white h-10 w-10 p-0 rounded-full"
                            title={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </Button>
                        <Button
                            onClick={toggleMute}
                            className="bg-transparent hover:bg-white/10 text-white h-10 w-10 p-0 rounded-full"
                            title={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                        <div className="w-px h-6 bg-white/30 mx-2" />
                    </>
                )}

                {/* Reset View */}
                <Button
                    onClick={resetView}
                    className="bg-transparent hover:bg-white/10 text-white h-10 w-10 p-0 rounded-full"
                    title="Reset View"
                >
                    <RotateCw className="h-5 w-5" />
                </Button>

                {/* Info Toggle */}
                <Button
                    onClick={() => setShowInfo(!showInfo)}
                    className="bg-transparent hover:bg-white/10 text-white h-10 w-10 p-0 rounded-full"
                    title="Toggle Info"
                >
                    <Info className="h-5 w-5" />
                </Button>

                {/* Fullscreen */}
                <Button
                    onClick={toggleFullscreen}
                    className="bg-transparent hover:bg-white/10 text-white h-10 w-10 p-0 rounded-full"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </Button>
            </div>

            {/* Thumbnail Strip (for multiple images) */}
            {type === '360_image' && images360?.length > 1 && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 flex gap-2 bg-black/70 backdrop-blur-md p-2 rounded-lg max-w-[90vw] overflow-x-auto">
                    {images360.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrentIndex(index);
                                setViewAngle({ yaw: 0, pitch: 0 });
                            }}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex
                                ? 'border-white scale-110'
                                : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                        >
                            <img
                                src={img.url}
                                alt={img.title}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default VirtualTourViewer;
