import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CoffeeHero3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 370;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    // Perspective Camera: Slightly higher angle (36° FOV) for an appetizing view into the latte art
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 60);
    camera.position.set(0, 2.7, 5.0);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    containerRef.current.appendChild(renderer.domElement);

    // 2. Artisanal Warm Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.6);
    scene.add(ambientLight);

    // Warm key light from top-front
    const keyLight = new THREE.DirectionalLight(0xffeed6, 3.0);
    keyLight.position.set(3.5, 6, 4.5);
    scene.add(keyLight);

    // Warm terracotta rim light for rich silhouette contour
    const rimLight = new THREE.PointLight(0xc86d3b, 4.5, 12);
    rimLight.position.set(-3.2, 2.8, -2.5);
    scene.add(rimLight);

    // Soft warm gold bounce fill light from below
    const bounceLight = new THREE.DirectionalLight(0xd4af37, 1.1);
    bounceLight.position.set(0, -2.5, 2.5);
    scene.add(bounceLight);

    // 3. Materials
    // Warm Ivory Glazed Ceramic Porcelain
    const ceramicMat = new THREE.MeshPhysicalMaterial({
      color: 0xfcf9f4,
      roughness: 0.15,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.85
    });

    // Metallic Gold Accent Material for subtle luxury rim
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xdeb852,
      metalness: 0.9,
      roughness: 0.22
    });

    // High-Resolution Procedural Latte Art Canvas (512x512)
    const latteCanvas = document.createElement("canvas");
    latteCanvas.width = 512;
    latteCanvas.height = 512;
    const ctx = latteCanvas.getContext("2d");
    if (ctx) {
      // Golden Crema Espresso Base Gradient
      const cremaGrad = ctx.createRadialGradient(256, 256, 15, 256, 256, 256);
      cremaGrad.addColorStop(0, "#C98751");   // Golden hazelnut center
      cremaGrad.addColorStop(0.35, "#A25F2D"); // Rich roasted crema
      cremaGrad.addColorStop(0.7, "#693616");  // Deep espresso ring
      cremaGrad.addColorStop(0.92, "#3D1D0D"); // Dark crema halo
      cremaGrad.addColorStop(1, "#261007");    // Rich rim
      ctx.fillStyle = cremaGrad;
      ctx.fillRect(0, 0, 512, 512);

      // Microfoam crema flecks for organic texture
      ctx.fillStyle = "rgba(225, 170, 115, 0.25)";
      for (let i = 0; i < 90; i++) {
        const rx = 100 + Math.random() * 312;
        const ry = 100 + Math.random() * 312;
        const rr = 1.5 + Math.random() * 3.5;
        ctx.beginPath();
        ctx.arc(rx, ry, rr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Barista Rosette & Tulip Milk Foam Art
      ctx.save();
      ctx.translate(256, 240);

      // Helper function for milk foam petals
      const drawPetal = (y, w, h, opacity = 0.95) => {
        ctx.fillStyle = `rgba(254, 251, 246, ${opacity})`;
        ctx.beginPath();
        ctx.ellipse(0, y, w, h, 0, 0, Math.PI * 2);
        ctx.fill();

        // Subtle warm crema halo around petals
        ctx.strokeStyle = "rgba(168, 102, 50, 0.35)";
        ctx.lineWidth = 3;
        ctx.stroke();
      };

      // Bottom wide petal tier
      drawPetal(75, 78, 38, 0.92);
      drawPetal(42, 68, 34, 0.94);
      drawPetal(12, 58, 30, 0.95);
      drawPetal(-18, 48, 26, 0.96);

      // Top heart tier
      ctx.fillStyle = "rgba(254, 251, 246, 0.98)";
      ctx.beginPath();
      ctx.arc(-16, -46, 18, 0, Math.PI * 2);
      ctx.arc(16, -46, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-32, -42);
      ctx.lineTo(0, -16);
      ctx.lineTo(32, -42);
      ctx.fill();

      // Delicate espresso draw-through stream line
      ctx.strokeStyle = "rgba(110, 56, 22, 0.75)";
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(0, -75);
      ctx.lineTo(0, 105);
      ctx.stroke();

      ctx.restore();
    }

    const latteTexture = new THREE.CanvasTexture(latteCanvas);
    const coffeeLiquidMat = new THREE.MeshStandardMaterial({
      map: latteTexture,
      roughness: 0.22,
      metalness: 0.04
    });

    // Dark Roasted Coffee Bean Material
    const beanMat = new THREE.MeshStandardMaterial({
      color: 0x361d12,
      roughness: 0.45,
      metalness: 0.08
    });

    // 4. Main Coffee Cup Group (Delicate, Compact Proportions)
    const cupGroup = new THREE.Group();

    // Sculpted Barista Flat White Cup Profile
    const cupPoints = [
      new THREE.Vector2(0.68, 0),      // Base bottom
      new THREE.Vector2(0.85, 0.08),   // Lower rounded chamfer
      new THREE.Vector2(1.12, 0.55),   // Graceful waist
      new THREE.Vector2(1.28, 1.25),   // Upper belly
      new THREE.Vector2(1.24, 1.28),   // Smooth top rounded rim
      new THREE.Vector2(1.18, 1.28),   // Lip thickness
      new THREE.Vector2(1.08, 0.58),   // Interior smooth curve
      new THREE.Vector2(0.82, 0.12),   // Interior bottom
      new THREE.Vector2(0, 0.12)        // Center bottom
    ];

    const cupMesh = new THREE.Mesh(new THREE.LatheGeometry(cupPoints, 64), ceramicMat);
    cupGroup.add(cupMesh);

    // Luxury Gold Rim Ring on Cup Lip
    const goldRim = new THREE.Mesh(
      new THREE.TorusGeometry(1.23, 0.022, 16, 64),
      goldMat
    );
    goldRim.rotation.x = Math.PI / 2;
    goldRim.position.y = 1.275;
    cupGroup.add(goldRim);

    // Latte Liquid Surface inside cup
    const liquidMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.18, 1.12, 0.06, 64),
      coffeeLiquidMat
    );
    liquidMesh.position.y = 1.16;
    cupGroup.add(liquidMesh);

    // Sleek Ergonomic Porcelain Handle
    const handleMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.44, 0.095, 20, 36, Math.PI * 1.18),
      ceramicMat
    );
    handleMesh.rotation.z = -Math.PI / 2.25;
    handleMesh.position.set(1.24, 0.68, 0);
    cupGroup.add(handleMesh);

    // Sculpted Matching Saucer Plate
    const saucerPoints = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.95, 0),       // Cup indent foot
      new THREE.Vector2(1.48, 0.06),    // Gentle slope
      new THREE.Vector2(1.92, 0.26),    // Raised rim lip
      new THREE.Vector2(1.86, 0.28),    // Rounded edge
      new THREE.Vector2(1.42, 0.1),     // Inner depression
      new THREE.Vector2(0.85, 0.04),    // Cup well seat
      new THREE.Vector2(0, 0.04)
    ];

    const saucerMesh = new THREE.Mesh(new THREE.LatheGeometry(saucerPoints, 64), ceramicMat);
    saucerMesh.position.y = -0.05;
    cupGroup.add(saucerMesh);

    // Scale entire cup to a refined, aesthetic compact size (~0.76 scale)
    cupGroup.scale.set(0.76, 0.76, 0.76);
    scene.add(cupGroup);

    // 5. Soft Grounding Contact Shadow
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sctx = shadowCanvas.getContext("2d");
    if (sctx) {
      const sgrad = sctx.createRadialGradient(128, 128, 20, 128, 128, 120);
      sgrad.addColorStop(0, "rgba(22, 12, 7, 0.42)");
      sgrad.addColorStop(0.5, "rgba(22, 12, 7, 0.18)");
      sgrad.addColorStop(1, "rgba(22, 12, 7, 0)");
      sctx.fillStyle = sgrad;
      sctx.fillRect(0, 0, 256, 256);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 3.6),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.65,
        depthWrite: false
      })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.06;
    scene.add(shadowMesh);

    // 6. Compact Orbiting Coffee Beans (6 Beans, Intimate Delicate Halo)
    const beanCount = 6;
    const beans = [];
    const beanGeo = new THREE.SphereGeometry(0.13, 20, 20);
    beanGeo.scale(1.42, 0.88, 0.64);

    for (let i = 0; i < beanCount; i++) {
      const beanMesh = new THREE.Mesh(beanGeo, beanMat);
      const angle = (i / beanCount) * Math.PI * 2;
      const radius = 1.85 + (i % 2) * 0.35; // Closer, tighter orbit around cup
      const height = 0.45 + Math.sin(i * 1.6) * 0.8;

      beanMesh.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      beanMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      scene.add(beanMesh);
      beans.push({
        mesh: beanMesh,
        angle,
        radius,
        orbitSpeed: 0.006 + (i % 3) * 0.002,
        rotSpeedX: 0.008 + (i % 2) * 0.005,
        rotSpeedY: 0.01 + (i % 2) * 0.004
      });
    }

    // 7. Delicate Rising Steam Vapor (Subtle & Aromatic)
    const steamCount = 24;
    const steamPositions = new Float32Array(steamCount * 3);
    const steamData = [];

    for (let i = 0; i < steamCount; i++) {
      steamPositions[i * 3] = (Math.random() - 0.5) * 0.45;
      steamPositions[i * 3 + 1] = 0.95 + Math.random() * 1.8;
      steamPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.45;
      steamData.push({
        speedY: 0.008 + Math.random() * 0.01,
        drift: (Math.random() - 0.5) * 0.002
      });
    }

    const steamGeo = new THREE.BufferGeometry();
    steamGeo.setAttribute("position", new THREE.BufferAttribute(steamPositions, 3));

    const steamMat = new THREE.PointsMaterial({
      color: 0xffeedb,
      size: 0.14,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending
    });

    const steamMesh = new THREE.Points(steamGeo, steamMat);
    scene.add(steamMesh);

    // 8. Smooth Damped Interactive Tilt & Physics
    let targetRotY = 0;
    let targetRotX = 0;

    const handleMouseMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const my = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = mx * 0.45; // Gentle tilt angle
      targetRotX = my * 0.18;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 9. Fluid Render Loop with Gentle Breathing Levitation
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Silky Smooth Damped Tilt with gentle natural oscillation
      cupGroup.rotation.y += (targetRotY + Math.sin(elapsed * 0.35) * 0.1 - cupGroup.rotation.y) * 0.045;
      cupGroup.rotation.x += (targetRotX - cupGroup.rotation.x) * 0.045;

      // Subtle levitation breath
      const breath = Math.sin(elapsed * 1.5) * 0.045;
      cupGroup.position.y = breath;

      // Contact shadow subtly pulses with the breath height
      shadowMesh.scale.set(1 - breath * 0.5, 1 - breath * 0.5, 1);
      shadowMesh.material.opacity = 0.65 - breath * 0.8;

      // Orbiting coffee beans
      beans.forEach((b) => {
        b.angle += b.orbitSpeed;
        b.mesh.position.x = Math.cos(b.angle) * b.radius;
        b.mesh.position.z = Math.sin(b.angle) * b.radius;
        b.mesh.position.y += Math.sin(elapsed * 1.8 + b.angle) * 0.003;
        b.mesh.rotation.x += b.rotSpeedX;
        b.mesh.rotation.y += b.rotSpeedY;
      });

      // Animated rising steam vapor
      const pos = steamMesh.geometry.attributes.position.array;
      for (let i = 0; i < steamCount; i++) {
        pos[i * 3 + 1] += steamData[i].speedY;
        pos[i * 3] += steamData[i].drift;

        if (pos[i * 3 + 1] > 3.0) {
          pos[i * 3 + 1] = 0.95;
          pos[i * 3] = (Math.random() - 0.5) * 0.45;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 0.45;
        }
      }
      steamMesh.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Responsive Canvas Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 370;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: "460px",
        height: "370px",
        margin: "0 auto",
        position: "relative",
        cursor: "grab",
        touchAction: "none"
      }}
    />
  );
}
