import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from './useReducedMotion';

/**
 * Check whether WebGL is supported by the current browser/device
 */
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Fallback procedural CSS/SVG Orb for environments without WebGL
 */
const FallbackOrb = ({ size = 120 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 35%, #3b82f6 0%, #1e3a8a 45%, #090e1a 80%)',
      boxShadow: '0 0 24px rgba(37, 99, 235, 0.35), inset 0 0 12px rgba(96, 165, 250, 0.4)',
      position: 'relative',
      display: 'inline-block'
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: '-6px',
        borderRadius: '50%',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        animation: 'spin 12s linear infinite'
      }}
    />
  </div>
);

export const NexusOrb = ({
  size = 120,
  interactive = true,
  showRings = true,
  showParticles = true,
  className = ''
}) => {
  const mountRef = useRef(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const { prefersReducedMotion, isTouchDevice } = useReducedMotion();

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setHasWebGL(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });

    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.5);
    scene.add(ambientLight);

    const blueRimLight = new THREE.PointLight(0x3b82f6, 3.5, 10);
    blueRimLight.position.set(2.5, 2, 2.5);
    scene.add(blueRimLight);

    const cyanCounterLight = new THREE.PointLight(0x60a5fa, 2.0, 10);
    cyanCounterLight.position.set(-2.5, -1.8, -1.5);
    scene.add(cyanCounterLight);

    // --- Central Dark Metallic Core Sphere ---
    const coreGeometry = new THREE.SphereGeometry(1.05, 32, 32);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a1128,
      metalness: 0.85,
      roughness: 0.18,
      emissive: 0x050c1e,
      emissiveIntensity: 0.4
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // --- Subtle Inner Wireframe Shell ---
    const shellGeometry = new THREE.IcosahedronGeometry(1.08, 2);
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    const shellMesh = new THREE.Mesh(shellGeometry, shellMaterial);
    scene.add(shellMesh);

    // --- Geometric Orbit Rings ---
    let ring1, ring2;
    if (showRings) {
      const ring1Geo = new THREE.TorusGeometry(1.52, 0.012, 16, 80);
      const ring1Mat = new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        emissive: 0x2563eb,
        emissiveIntensity: 0.8,
        roughness: 0.2
      });
      ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
      ring1.rotation.x = Math.PI / 3;
      ring1.rotation.y = Math.PI / 6;
      scene.add(ring1);

      const ring2Geo = new THREE.TorusGeometry(1.7, 0.008, 16, 80);
      const ring2Mat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.45
      });
      ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
      ring2.rotation.x = -Math.PI / 4;
      ring2.rotation.z = Math.PI / 4;
      scene.add(ring2);
    }

    // --- Floating Particle Constellation ---
    let particleSystem;
    if (showParticles && !isTouchDevice) {
      const particleCount = 40;
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const radius = 1.35 + Math.random() * 0.9;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const particleMaterial = new THREE.PointsMaterial({
        color: 0x93c5fd,
        size: 0.035,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });

      particleSystem = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particleSystem);
    }

    // --- Mouse Interaction ---
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e) => {
      if (!interactive || prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = x * 0.45;
      targetRotationX = y * 0.35;
    };

    const handleMouseLeave = () => {
      targetRotationX = 0;
      targetRotationY = 0;
    };

    if (interactive && !isTouchDevice) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    // --- Animation Loop ---
    let animationFrameId;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = (performance.now() - startTime) * 0.001;

      if (!prefersReducedMotion) {
        // Slow majestic rotation
        coreMesh.rotation.y += 0.0035;
        coreMesh.rotation.x += 0.0015;

        shellMesh.rotation.y += 0.005;
        shellMesh.rotation.z -= 0.003;

        if (ring1) {
          ring1.rotation.z += 0.006;
          ring1.rotation.y += 0.002;
        }

        if (ring2) {
          ring2.rotation.z -= 0.004;
          ring2.rotation.x += 0.003;
        }

        if (particleSystem) {
          particleSystem.rotation.y += 0.002;
        }

        // Gentle floating pulsation
        const floatOffset = Math.sin(elapsedTime * 1.2) * 0.06;
        coreMesh.position.y = floatOffset;
        shellMesh.position.y = floatOffset;
        if (ring1) ring1.position.y = floatOffset;
        if (ring2) ring2.position.y = floatOffset;

        // Smooth interactive tilting
        scene.rotation.y += (targetRotationY - scene.rotation.y) * 0.06;
        scene.rotation.x += (targetRotationX - scene.rotation.x) * 0.06;
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup on Unmount ---
    return () => {
      cancelAnimationFrame(animationFrameId);

      if (interactive && !isTouchDevice) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }

      coreGeometry.dispose();
      coreMaterial.dispose();
      shellGeometry.dispose();
      shellMaterial.dispose();

      if (ring1) {
        ring1.geometry.dispose();
        ring1.material.dispose();
      }
      if (ring2) {
        ring2.geometry.dispose();
        ring2.material.dispose();
      }
      if (particleSystem) {
        particleSystem.geometry.dispose();
        particleSystem.material.dispose();
      }

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, interactive, showRings, showParticles, prefersReducedMotion, isTouchDevice]);

  if (!hasWebGL) {
    return <FallbackOrb size={size} />;
  }

  return (
    <div
      ref={mountRef}
      className={`nexus-orb-3d-wrap ${className}`}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        overflow: 'hidden',
        verticalAlign: 'middle'
      }}
      aria-hidden="true"
    />
  );
};
