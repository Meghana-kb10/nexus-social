import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from './useReducedMotion';

export const NexusSpinner3D = ({ size = 36, label = '' }) => {
  const mountRef = useRef(null);
  const [useFallback, setUseFallback] = useState(false);
  const { prefersReducedMotion } = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setUseFallback(true);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      setUseFallback(true);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
    camera.position.z = 3.2;

    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Inner glowing sphere
    const sphereGeo = new THREE.SphereGeometry(0.38, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // Outer rotating orbital ring
    const ringGeo = new THREE.TorusGeometry(0.85, 0.045, 12, 36);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, wireframe: true });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    let animationId;
    const animate = () => {
      ring.rotation.z += 0.045;
      ring.rotation.y += 0.025;
      sphere.scale.setScalar(0.9 + Math.sin(Date.now() * 0.005) * 0.1);
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      sphereGeo.dispose();
      sphereMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, prefersReducedMotion]);

  if (useFallback) {
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div className="auth-spinner" style={{ width: size, height: size }} />
        {label && <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{label}</span>}
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div ref={mountRef} style={{ width: size, height: size }} aria-hidden="true" />
      {label && <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{label}</span>}
    </div>
  );
};
