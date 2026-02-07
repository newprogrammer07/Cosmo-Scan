import React, { useRef, useEffect, useState } from 'react';
import { useTransform, useMotionValue, useSpring } from 'framer-motion';

const FRAME_COUNT = 240;
const IMAGES_BASE_PATH = '/sequence/ezgif-frame-';

const EarthScroll: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const scrollProgress = useMotionValue(0);
    const smoothProgress = useSpring(scrollProgress, { damping: 20, stiffness: 100 });
    const currentFrameIndex = useTransform(smoothProgress, [0, 1], [0, FRAME_COUNT - 1]);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight <= 0) {
                scrollProgress.set(0);
                return;
            }
            const progress = Math.min(Math.max(window.scrollY / totalHeight, 0), 1);
            scrollProgress.set(progress);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [scrollProgress]);

    useEffect(() => {
        const loadImages = async () => {
            const loadedImages: HTMLImageElement[] = [];
            const promises = [];

            for (let i = 1; i <= FRAME_COUNT; i++) {
                const img = new Image();
                const frameNumber = i.toString().padStart(3, '0');
                img.src = `${IMAGES_BASE_PATH}${frameNumber}.jpg`;

                promises.push(new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = (e) => {
                        console.error(`Failed to load frame ${i}`, e);
                        resolve();
                    };
                }));
                loadedImages.push(img);
            }

            await Promise.all(promises);
            setImages(loadedImages);
            setIsLoading(false);
        };

        loadImages();
    }, []);

    const renderFrame = (index: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || images.length === 0) return;

        const imgIndex = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(index)));
        const img = images[imgIndex];

        if (!img) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
            drawHeight = canvas.height;
            drawWidth = img.width * (canvas.height / img.height);
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        } else {
            drawWidth = canvas.width;
            drawHeight = img.height * (canvas.width / img.width);
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        }

        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    useEffect(() => {
        const unsubscribe = currentFrameIndex.on("change", (latest) => {
            if (!isLoading) {
                requestAnimationFrame(() => renderFrame(latest));
            }
        });
        return unsubscribe;
    }, [isLoading, currentFrameIndex, images]);

    useEffect(() => {
        if (!isLoading) {
            renderFrame(currentFrameIndex.get());
        }
    }, [isLoading]);

    useEffect(() => {
        const handleResize = () => {
            if (!isLoading) renderFrame(currentFrameIndex.get());
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isLoading]);

    return (
        <>
            <div className="fixed inset-0 -z-50 bg-[#050505] pointer-events-none">
                <canvas
                    ref={canvasRef}
                    className={`w-full h-full object-contain ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
                />
            </div>

            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-t-neon-cyan border-r-transparent border-b-electric-purple border-l-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm tracking-widest uppercase text-gray-400">Loading Sequence...</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default EarthScroll;