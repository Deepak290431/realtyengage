import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ZoomIn, ZoomOut, Maximize, Minimize, ChevronLeft, ChevronRight,
    Play, Pause, Volume2, VolumeX, RotateCw, Info, Image
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

    const { images360, video360 } = virtualTourData || {};
    const [selectedMode, setSelectedMode] = useState(null); // '360_image' or '360_video'

    const hasImages = images360?.length > 0;
    const hasVideo = !!video360?.url;

    useEffect(() => {
        // Auto-select if only one type exists
        if (hasImages && !hasVideo) setSelectedMode('360_image');
        else if (!hasImages && hasVideo) setSelectedMode('360_video');
    }, [hasImages, hasVideo]);

    const currentMedia = selectedMode === '360_image' ? images360?.[currentIndex] : video360;
    const type = selectedMode;

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

    if (!selectedMode && hasImages && hasVideo) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            >
                <Button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full h-12 w-12 p-0 border border-white/20"
                >
                    <X className="h-6 w-6" />
                </Button>

                <div className="max-w-2xl w-full text-center">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mb-12"
                    >
                        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Choose Your Experience</h2>
                        <p className="text-gray-400 text-lg">Select how you would like to explore this property</p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <motion.button
                            whileHover={{ scale: 1.05, translateY: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedMode('360_image')}
                            className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-2xl p-8 transition-all duration-300 text-left"
                        >
                            <div className="h-16 w-16 bg-blue-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                                <Image size={32} className="text-blue-500 group-hover:text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">360° Photos</h3>
                            <p className="text-gray-500 leading-relaxed">High-definition panoramic views of every room with manual exploration.</p>
                            <div className="mt-6 flex items-center text-blue-500 font-bold uppercase text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Launch Tour <ChevronRight className="h-4 w-4 ml-1" />
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05, translateY: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedMode('360_video')}
                            className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/50 rounded-2xl p-8 transition-all duration-300 text-left"
                        >
                            <div className="h-16 w-16 bg-pink-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-pink-600 transition-colors">
                                <Play size={32} className="text-pink-500 group-hover:text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">360° Video</h3>
                            <p className="text-gray-500 leading-relaxed">Immersive cinematic walkthrough of the entire property in 360 degrees.</p>
                            <div className="mt-6 flex items-center text-pink-500 font-bold uppercase text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Start Video <ChevronRight className="h-4 w-4 ml-1" />
                            </div>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (!currentMedia) {
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
