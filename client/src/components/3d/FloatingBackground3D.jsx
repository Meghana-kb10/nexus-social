import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from './useReducedMotion';

export const FloatingBackground3D = () => {
  const mountRef = useRef(null);
  const { prefersReducedMotion, isTouchDevice } = useReducedMotion();

  useEffect(() => {
    // If reduced motion is requested or touch device with low specs, skip background 3D
    if (prefersReducedMotion || isTouchDevice) return;

    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 15;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'low-power'
      });
    } catch {
      return; // WebGL not available
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(1); // Keep at 1 for background performance
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Subtle ambient lighting
    const ambientLight = new THREE.AmbientLight(0x1e3a8a, 0.8);
    scene.add(ambientLight);

    // Group of floating geometric objects
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    // Create 4 subtle wireframe floating polyhedra
    const geometries = [
      new THREE.IcosahedronGeometry(1.6, 1),
      new THREE.TorusGeometry(2.2, 0.04, 12, 48),
      new THREE.OctahedronGeometry(1.8, 0),
      new THREE.TorusGeometry(1.4, 0.03, 12, 40)
    ];

    const material = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.05
    });

    const floatingMeshes = [];
    const positions = [
      { x: -12, y: 6, z: -4 },
      { x: 13, y: 8, z: -6 },
      { x: -14, y: -8, z: -5 },
      { x: 14, y: -7, z: -3 }
    ];

    geometries.forEach((geo, idx) => {
      const mesh = new THREE.Mesh(geo, material);
      const pos = positions[idx];
      mesh.position.set(pos.x, pos.y, pos.z);
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      objectsGroup.add(mesh);
      floatingMeshes.push({
        mesh,
        rotSpeedX: 0.0008 + Math.random() * 0.0006,
        rotSpeedY: 0.001 + Math.random() * 0.0008,
        floatSpeed: 0.4 + Math.random() * 0.3,
        initialY: pos.y
      });
    });

    // Gentle star/dust particles in background
    const particleCount = 60;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 36;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.05,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });

    const dustParticles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(dustParticles);

    // Resize handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop with tab-visibility pause
    let animationFrameId;
    const startTime = performance.now();

    const animate = () => {
      if (!document.hidden) {
        const elapsed = (performance.now() - startTime) * 0.001;

        floatingMeshes.forEach((item) => {
          item.mesh.rotation.x += item.rotSpeedX;
          item.mesh.rotation.y += item.rotSpeedY;
          item.mesh.position.y = item.initialY + Math.sin(elapsed * item.floatSpeed) * 0.4;
        });

        dustParticles.rotation.y += 0.0003;

        renderer.render(scene, camera);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);

      geometries.forEach((geo) => geo.dispose());
      material.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [prefersReducedMotion, isTouchDevice]);

  if (prefersReducedMotion || isTouchDevice) {
    return null;
  }

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85,
        overflow: 'hidden'
      }}
      aria-hidden="true"
    />
  );
};
