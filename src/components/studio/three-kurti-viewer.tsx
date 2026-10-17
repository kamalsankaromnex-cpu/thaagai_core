"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { CustomFabric } from "@/server/services/fabric-service";
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  RefreshCw,
  Sliders,
  Layers,
} from "lucide-react";

export type SilhouetteStyle = "STRAIGHT_CUT" | "KALIDAR_ANARKALI";
export type NecklineStyle = "ROUND" | "SWEETHEART";
export type SleeveStyle = "THREE_QUARTER" | "SLEEVELESS";
export type BottomWearStyle = "NONE" | "CHURIDAR_GATHERED" | "CIGARETTE_PANTS";

interface ThreeKurtiViewerProps {
  fabric: CustomFabric;
  silhouette?: SilhouetteStyle;
  neckline: NecklineStyle;
  sleeves: SleeveStyle;
  bottomWear?: BottomWearStyle;
  autoRotate?: boolean;
  className?: string;
}

export function ThreeKurtiViewer({
  fabric,
  silhouette = "STRAIGHT_CUT",
  neckline,
  sleeves,
  bottomWear = "NONE",
  autoRotate: initialAutoRotate = false,
  className = "",
}: ThreeKurtiViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const kurtiGroupRef = useRef<THREE.Group | null>(null);

  // Mesh & Group references
  const straightKurtiGroupRef = useRef<THREE.Group | null>(null);
  const anarkaliGroupRef = useRef<THREE.Group | null>(null);
  const roundNeckGroupRef = useRef<THREE.Group | null>(null);
  const sweetheartNeckGroupRef = useRef<THREE.Group | null>(null);
  const sleeves34GroupRef = useRef<THREE.Group | null>(null);
  const sleevesNoneGroupRef = useRef<THREE.Group | null>(null);
  const bottomChuridarGroupRef = useRef<THREE.Group | null>(null);
  const bottomCigaretteGroupRef = useRef<THREE.Group | null>(null);

  // Materials
  const garmentMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const borderMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const bumpTextureRef = useRef<THREE.Texture | null>(null);

  // Textures cache
  const textureCache = useRef<Map<string, THREE.Texture>>(new Map());

  // Interaction State
  const [isRotating, setIsRotating] = useState(initialAutoRotate);
  const [isLoadingTexture, setIsLoadingTexture] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activePreset, setActivePreset] = useState<"FULL" | "NECK" | "BORDER" | "BACK">("FULL");

  // Drag interaction state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.1, y: 0 });
  const targetCameraPosRef = useRef({ x: 0, y: 0.35, z: 3.35 });

  // ---------------------------------------------------------------------------
  // 1. Texture Loader with Metric UV Calibration & Placement Mode
  // ---------------------------------------------------------------------------
  const applyFabricTexture = useCallback(
    (currentFabric: CustomFabric) => {
      if (!garmentMaterialRef.current) return;

      setIsLoadingTexture(true);

      const loader = new THREE.TextureLoader();
      const url = currentFabric.textureUrl;

      // Load micro cloth bump texture if not loaded
      if (!bumpTextureRef.current) {
        loader.load("/fabrics/cloth-bump.svg", (bTex) => {
          bTex.wrapS = THREE.RepeatWrapping;
          bTex.wrapT = THREE.RepeatWrapping;
          bTex.repeat.set(16, 16);
          bumpTextureRef.current = bTex;
          if (garmentMaterialRef.current) {
            garmentMaterialRef.current.bumpMap = bTex;
            garmentMaterialRef.current.bumpScale = 0.012;
            garmentMaterialRef.current.needsUpdate = true;
          }
        });
      }

      const setupTexture = (tex: THREE.Texture) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;

        // Metric Calibration: Base garment UV space represents ~100cm height x ~60cm width
        const repX = Math.max(1, Math.round(60 / (currentFabric.repeatWidthCm || 15)));
        const repY = Math.max(1, Math.round(100 / (currentFabric.repeatHeightCm || 15)));

        tex.repeat.set(repX, repY);
        tex.needsUpdate = true;

        if (garmentMaterialRef.current) {
          garmentMaterialRef.current.map = tex;
          garmentMaterialRef.current.roughness = currentFabric.roughness ?? 0.85;
          garmentMaterialRef.current.metalness = currentFabric.metalness ?? 0.0;
          if (bumpTextureRef.current) {
            garmentMaterialRef.current.bumpMap = bumpTextureRef.current;
            garmentMaterialRef.current.bumpScale = 0.012;
          }
          garmentMaterialRef.current.needsUpdate = true;
        }

        // For border hem placement mode, calibrate border material
        if (borderMaterialRef.current && currentFabric.placementMode === "BORDER_HEM") {
          const borderTex = tex.clone();
          borderTex.wrapS = THREE.RepeatWrapping;
          borderTex.wrapT = THREE.ClampToEdgeWrapping;
          borderTex.repeat.set(repX * 1.5, 1);
          borderTex.offset.set(0, 0.82); // Focus on the bottom zari temple border zone
          borderTex.needsUpdate = true;

          borderMaterialRef.current.map = borderTex;
          borderMaterialRef.current.roughness = Math.min(currentFabric.roughness, 0.4);
          borderMaterialRef.current.metalness = Math.max(currentFabric.metalness, 0.25);
          borderMaterialRef.current.needsUpdate = true;
        } else if (borderMaterialRef.current) {
          borderMaterialRef.current.map = tex;
          borderMaterialRef.current.needsUpdate = true;
        }

        setIsLoadingTexture(false);
      };

      if (textureCache.current.has(url)) {
        setupTexture(textureCache.current.get(url)!);
      } else {
        loader.load(
          url,
          (loadedTex) => {
            textureCache.current.set(url, loadedTex);
            setupTexture(loadedTex);
          },
          undefined,
          (err) => {
            console.error("Failed to load fabric texture:", err);
            setIsLoadingTexture(false);
          }
        );
      }
    },
    []
  );

  // ---------------------------------------------------------------------------
  // 2. Initialize Three.js Scene, Studio Lighting & Upgraded Garment Model
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 540;

    // SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.35, 3.35);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // STUDIO LIGHTING SETUP
    // 1. Warm Ambient Base
    const ambientLight = new THREE.AmbientLight(0xfff7ee, 1.3);
    scene.add(ambientLight);

    // 2. Key Studio Light (Upper Right)
    const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.9);
    keyLight.position.set(3.5, 4.5, 3.5);
    scene.add(keyLight);

    // 3. Fill Studio Light (Upper Left Soft Blue-White)
    const fillLight = new THREE.DirectionalLight(0xe8f0fe, 1.1);
    fillLight.position.set(-3.5, 2.5, 2.5);
    scene.add(fillLight);

    // 4. Rim / Silhouette Backlight (Warm Gold)
    const rimLight = new THREE.DirectionalLight(0xffecd2, 1.5);
    rimLight.position.set(0, 3.2, -3.2);
    scene.add(rimLight);

    // ROOT GARMENT GROUP
    const kurtiGroup = new THREE.Group();
    scene.add(kurtiGroup);
    kurtiGroupRef.current = kurtiGroup;

    // -------------------------------------------------------------------------
    // HAUTE COUTURE ATELIER MANNEQUIN STAND
    // -------------------------------------------------------------------------
    const standMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f1917, // Espresso walnut
      roughness: 0.35,
      metalness: 0.15,
    });
    const brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Polished brass
      roughness: 0.22,
      metalness: 0.88,
    });
    const linenMaterial = new THREE.MeshStandardMaterial({
      color: 0xe6decb, // French atelier linen
      roughness: 0.9,
      metalness: 0.0,
    });

    // Base plate with bevel
    const basePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.045, 36), standMaterial);
    basePlate.position.y = -1.42;
    kurtiGroup.add(basePlate);

    // Brass collar ring on base
    const collarRing = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 24), brassMaterial);
    collarRing.position.y = -1.39;
    kurtiGroup.add(collarRing);

    // Vertical central rod
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.9, 16), brassMaterial);
    rod.position.y = -0.45;
    kurtiGroup.add(rod);

    // Upper brass neck finial
    const neckFinial = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.082, 0.2, 24), brassMaterial);
    neckFinial.position.y = 0.98;
    kurtiGroup.add(neckFinial);

    // Mannequin neck topper dome
    const neckDome = new THREE.Mesh(new THREE.SphereGeometry(0.065, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), brassMaterial);
    neckDome.position.y = 1.08;
    kurtiGroup.add(neckDome);

    // Mannequin Linen Dress Form Torso (Visible through neck and side slits)
    const mannequinPoints: THREE.Vector2[] = [
      new THREE.Vector2(0.09, 0.92),
      new THREE.Vector2(0.22, 0.82),
      new THREE.Vector2(0.24, 0.58),
      new THREE.Vector2(0.19, 0.28),
      new THREE.Vector2(0.26, -0.05),
      new THREE.Vector2(0.28, -0.45),
    ];
    const mannequinGeo = new THREE.LatheGeometry(mannequinPoints, 36);
    mannequinGeo.scale(0.96, 0.98, 0.62);
    const mannequinMesh = new THREE.Mesh(mannequinGeo, linenMaterial);
    kurtiGroup.add(mannequinMesh);

    // SOFT CONTACT GROUND SHADOW
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.14,
    });
    const shadowDisc = new THREE.Mesh(new THREE.CircleGeometry(0.65, 36), shadowMat);
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = -1.43;
    scene.add(shadowDisc);

    // -------------------------------------------------------------------------
    // 3. PBR FABRIC MATERIALS
    // -------------------------------------------------------------------------
    const garmentMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.85,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
    garmentMaterialRef.current = garmentMat;

    const borderMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.45,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    borderMaterialRef.current = borderMat;

    // -------------------------------------------------------------------------
    // 4. SILHOUETTE A: AUTHENTIC STRAIGHT-CUT KURTI WITH VISIBLE SIDE SLITS
    // -------------------------------------------------------------------------
    const straightKurtiGroup = new THREE.Group();
    kurtiGroup.add(straightKurtiGroup);
    straightKurtiGroupRef.current = straightKurtiGroup;

    // Front Panel with authentic side slit separation
    const frontPoints: THREE.Vector2[] = [
      new THREE.Vector2(0.12, 0.88),  // Neck base
      new THREE.Vector2(0.24, 0.80),  // Shoulder
      new THREE.Vector2(0.26, 0.56),  // Bust fullness
      new THREE.Vector2(0.21, 0.28),  // Waist suppression
      new THREE.Vector2(0.27, -0.05), // High hip
      new THREE.Vector2(0.31, -0.25), // Side slit origin
      new THREE.Vector2(0.33, -0.65), // Lower slit
      new THREE.Vector2(0.35, -0.98), // Hemline
    ];

    // Front half (0 to PI radians)
    const frontGeo = new THREE.LatheGeometry(frontPoints, 32, -Math.PI * 0.45, Math.PI * 0.9);
    frontGeo.scale(1.0, 1.0, 0.65);

    // Natural vertical drape folds below bustline
    const frontPos = frontGeo.attributes.position;
    for (let i = 0; i < frontPos.count; i++) {
      const y = frontPos.getY(i);
      const x = frontPos.getX(i);
      const z = frontPos.getZ(i);
      if (y < 0.45 && y > -0.98) {
        const drapeWave = Math.sin(x * 14) * 0.007 * (0.45 - y);
        frontPos.setZ(i, z + drapeWave);
      }
    }
    frontGeo.computeVertexNormals();
    const frontMesh = new THREE.Mesh(frontGeo, garmentMat);
    straightKurtiGroup.add(frontMesh);

    // Back half (PI to 2*PI radians) with distinct slit gap
    const backGeo = new THREE.LatheGeometry(frontPoints, 32, Math.PI * 0.55, Math.PI * 0.9);
    backGeo.scale(1.0, 1.0, 0.65);
    const backPos = backGeo.attributes.position;
    for (let i = 0; i < backPos.count; i++) {
      const y = backPos.getY(i);
      const x = backPos.getX(i);
      const z = backPos.getZ(i);
      if (y < 0.45 && y > -0.98) {
        const drapeWave = Math.sin(x * 14) * 0.005 * (0.45 - y);
        backPos.setZ(i, z - drapeWave);
      }
    }
    backGeo.computeVertexNormals();
    const backMesh = new THREE.Mesh(backGeo, garmentMat);
    straightKurtiGroup.add(backMesh);

    // Contrast Hem Border (Bottom 12cm band for straight cut)
    const straightHemGeo = new THREE.CylinderGeometry(0.352, 0.354, 0.14, 48, 1, true);
    straightHemGeo.scale(1.0, 1.0, 0.65);
    const straightHemMesh = new THREE.Mesh(straightHemGeo, borderMat);
    straightHemMesh.position.y = -0.91;
    straightKurtiGroup.add(straightHemMesh);

    // Contrast bias binding tape along the side slits
    const slitTapeMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Gold piping tape
      roughness: 0.3,
      metalness: 0.6,
    });
    [-0.32, 0.32].forEach((xPos) => {
      const tape = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.72, 8), slitTapeMat);
      tape.position.set(xPos, -0.62, 0);
      straightKurtiGroup.add(tape);
    });

    // -------------------------------------------------------------------------
    // 5. SILHOUETTE B: KALIDAR FLARED ANARKALI WITH ORGANIC DRAPE FOLDS
    // -------------------------------------------------------------------------
    const anarkaliGroup = new THREE.Group();
    kurtiGroup.add(anarkaliGroup);
    anarkaliGroup.visible = false;
    anarkaliGroupRef.current = anarkaliGroup;

    // Fitted Empire Bodice
    const anarkaliBodicePoints: THREE.Vector2[] = [
      new THREE.Vector2(0.12, 0.88),
      new THREE.Vector2(0.24, 0.80),
      new THREE.Vector2(0.26, 0.56),
      new THREE.Vector2(0.21, 0.28),
      new THREE.Vector2(0.23, 0.15), // Empire waist seam
    ];
    const anarkaliBodiceGeo = new THREE.LatheGeometry(anarkaliBodicePoints, 48, 0, Math.PI * 2);
    anarkaliBodiceGeo.scale(1.0, 1.0, 0.66);

    // Calibrate 360-degree bodice UV to match physical straight cut scale
    const bodiceUv = anarkaliBodiceGeo.attributes.uv;
    for (let i = 0; i < bodiceUv.count; i++) {
      bodiceUv.setX(i, bodiceUv.getX(i) * 2.0);
    }
    bodiceUv.needsUpdate = true;

    const anarkaliBodiceMesh = new THREE.Mesh(anarkaliBodiceGeo, garmentMat);
    anarkaliGroup.add(anarkaliBodiceMesh);

    // Empire waist golden zari belt / piping
    const empireBeltGeo = new THREE.TorusGeometry(0.22, 0.012, 16, 48);
    empireBeltGeo.rotateX(Math.PI / 2);
    empireBeltGeo.scale(1.0, 0.66, 1.0);
    const empireBelt = new THREE.Mesh(empireBeltGeo, brassMaterial);
    empireBelt.position.y = 0.15;
    anarkaliGroup.add(empireBelt);

    // 16-Kali Flared Skirt with mathematical wave ripple
    const kaliPoints: THREE.Vector2[] = [
      new THREE.Vector2(0.23, 0.15),
      new THREE.Vector2(0.32, -0.15),
      new THREE.Vector2(0.42, -0.45),
      new THREE.Vector2(0.53, -0.75),
      new THREE.Vector2(0.64, -1.05),
    ];
    const anarkaliSkirtGeo = new THREE.LatheGeometry(kaliPoints, 64, 0, Math.PI * 2);
    anarkaliSkirtGeo.scale(1.0, 1.0, 0.72);

    // Calibrate 360-degree flare UVs to preserve 1:1 physical repeat scale
    const skirtUv = anarkaliSkirtGeo.attributes.uv;
    for (let i = 0; i < skirtUv.count; i++) {
      skirtUv.setX(i, skirtUv.getX(i) * 2.0);
    }
    skirtUv.needsUpdate = true;

    // Apply natural undulating kali drape ripple to vertices
    const posAttr = anarkaliSkirtGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);

      if (vy < 0.15) {
        const theta = Math.atan2(vz, vx);
        const depth = (0.15 - vy) / 1.2; // Increase ripple towards hem
        const ripple = Math.cos(16 * theta) * 0.024 * depth;
        posAttr.setX(i, vx + Math.cos(theta) * ripple);
        posAttr.setZ(i, vz + Math.sin(theta) * ripple);
      }
    }
    anarkaliSkirtGeo.computeVertexNormals();

    const anarkaliSkirtMesh = new THREE.Mesh(anarkaliSkirtGeo, garmentMat);
    anarkaliGroup.add(anarkaliSkirtMesh);

    // Wide Royal Border on Anarkali Hem
    const anarkaliHemGeo = new THREE.CylinderGeometry(0.645, 0.655, 0.18, 64, 1, true);
    anarkaliHemGeo.scale(1.0, 1.0, 0.72);
    const anarkaliHemMesh = new THREE.Mesh(anarkaliHemGeo, borderMat);
    anarkaliHemMesh.position.y = -0.96;
    anarkaliGroup.add(anarkaliHemMesh);

    // -------------------------------------------------------------------------
    // 6. MODULAR NECKLINES (Round vs Sweetheart)
    // -------------------------------------------------------------------------
    // 1. Round Scoop Neckline
    const roundNeckGroup = new THREE.Group();
    const roundTorus = new THREE.TorusGeometry(0.128, 0.014, 16, 32, Math.PI * 1.35);
    roundTorus.rotateX(Math.PI / 2.3);
    roundTorus.rotateZ(Math.PI * 0.825);
    const roundMesh = new THREE.Mesh(roundTorus, brassMaterial);
    roundMesh.position.set(0, 0.77, 0.075);
    roundNeckGroup.add(roundMesh);
    kurtiGroup.add(roundNeckGroup);
    roundNeckGroupRef.current = roundNeckGroup;

    // 2. Sweetheart Plunge Neckline
    const sweetheartGroup = new THREE.Group();
    const sweetCurve = new THREE.CurvePath<THREE.Vector3>();
    const swL = new THREE.LineCurve3(new THREE.Vector3(-0.13, 0.83, 0.08), new THREE.Vector3(0, 0.66, 0.12));
    const swR = new THREE.LineCurve3(new THREE.Vector3(0, 0.66, 0.12), new THREE.Vector3(0.13, 0.83, 0.08));
    sweetCurve.add(swL);
    sweetCurve.add(swR);
    const sweetMesh = new THREE.Mesh(new THREE.TubeGeometry(sweetCurve, 32, 0.015, 12, false), brassMaterial);
    sweetheartGroup.add(sweetMesh);
    sweetheartGroup.visible = false;
    kurtiGroup.add(sweetheartGroup);
    sweetheartNeckGroupRef.current = sweetheartGroup;

    // -------------------------------------------------------------------------
    // 7. MODULAR SLEEVES (3/4th Gathered vs Sleeveless)
    // -------------------------------------------------------------------------
    // 1. 3/4th Gathered Sleeves (Left & Right)
    const sleeves34Group = new THREE.Group();
    const sleeveCurveL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.25, 0.74, 0),
      new THREE.Vector3(-0.35, 0.54, 0.02),
      new THREE.Vector3(-0.39, 0.22, 0.05),
    ]);
    const sleeveCurveR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.25, 0.74, 0),
      new THREE.Vector3(0.35, 0.54, 0.02),
      new THREE.Vector3(0.39, 0.22, 0.05),
    ]);

    const sleeveGeoL = new THREE.TubeGeometry(sleeveCurveL, 32, 0.066, 20, false);
    const sleeveGeoR = new THREE.TubeGeometry(sleeveCurveR, 32, 0.066, 20, false);

    // Scale sleeve UV coordinates for natural motif scale
    [sleeveGeoL, sleeveGeoR].forEach((geo) => {
      const uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setX(i, uv.getX(i) * 0.4);
        uv.setY(i, uv.getY(i) * 0.5);
      }
      uv.needsUpdate = true;
    });

    const sleeveMeshL = new THREE.Mesh(sleeveGeoL, garmentMat);
    const sleeveMeshR = new THREE.Mesh(sleeveGeoR, garmentMat);
    sleeves34Group.add(sleeveMeshL);
    sleeves34Group.add(sleeveMeshR);

    // Zari border cuffs on sleeves
    const cuffGeoL = new THREE.CylinderGeometry(0.07, 0.07, 0.055, 20);
    cuffGeoL.rotateZ(0.2);
    const cuffMeshL = new THREE.Mesh(cuffGeoL, borderMat);
    cuffMeshL.position.set(-0.39, 0.22, 0.05);
    sleeves34Group.add(cuffMeshL);

    const cuffGeoR = new THREE.CylinderGeometry(0.07, 0.07, 0.055, 20);
    cuffGeoR.rotateZ(-0.2);
    const cuffMeshR = new THREE.Mesh(cuffGeoR, borderMat);
    cuffMeshR.position.set(0.39, 0.22, 0.05);
    sleeves34Group.add(cuffMeshR);

    kurtiGroup.add(sleeves34Group);
    sleeves34GroupRef.current = sleeves34Group;

    // 2. Sleeveless Armhole Piped Trim (Left & Right)
    const sleevesNoneGroup = new THREE.Group();
    const armTrimGeo = new THREE.TorusGeometry(0.092, 0.014, 16, 32);
    armTrimGeo.rotateY(Math.PI / 2);
    armTrimGeo.scale(0.8, 1.25, 1);

    const armTrimL = new THREE.Mesh(armTrimGeo, borderMat);
    armTrimL.position.set(-0.24, 0.67, 0);
    sleevesNoneGroup.add(armTrimL);

    const armTrimR = new THREE.Mesh(armTrimGeo, borderMat);
    armTrimR.position.set(0.24, 0.67, 0);
    sleevesNoneGroup.add(armTrimR);

    sleevesNoneGroup.visible = false;
    kurtiGroup.add(sleevesNoneGroup);
    sleevesNoneGroupRef.current = sleevesNoneGroup;

    // -------------------------------------------------------------------------
    // 8. MATCHING BOTTOM TROUSERS PREVIEW (Churidar vs Cigarette Pants)
    // -------------------------------------------------------------------------
    const trouserMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f0e6, // Ivory / Raw silk cream
      roughness: 0.8,
      metalness: 0.0,
    });

    // 1. Gathered Churidar Bottoms (Gathered fabric ankle rings)
    const churidarGroup = new THREE.Group();
    [-0.12, 0.12].forEach((legX) => {
      // Upper leg
      const legCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(legX, -0.4, 0),
        new THREE.Vector3(legX * 0.95, -0.85, 0.01),
        new THREE.Vector3(legX * 0.9, -1.35, 0.02),
      ]);
      const legMesh = new THREE.Mesh(new THREE.TubeGeometry(legCurve, 32, 0.055, 16, false), trouserMaterial);
      churidarGroup.add(legMesh);

      // Stack of 6 gathered ankle fabric rings (churidars)
      for (let r = 0; r < 6; r++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.012, 12, 24), trouserMaterial);
        ring.rotateX(Math.PI / 2);
        ring.position.set(legX * 0.9, -1.18 - r * 0.028, 0.02);
        churidarGroup.add(ring);
      }
    });
    churidarGroup.visible = false;
    kurtiGroup.add(churidarGroup);
    bottomChuridarGroupRef.current = churidarGroup;

    // 2. Cigarette Trousers (Tailored narrow straight trousers with side ankle slit)
    const cigaretteGroup = new THREE.Group();
    [-0.13, 0.13].forEach((legX) => {
      const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.052, 0.95, 24), trouserMaterial);
      legMesh.position.set(legX, -0.88, 0);
      cigaretteGroup.add(legMesh);

      // Ankle gold button
      const button = new THREE.Mesh(new THREE.SphereGeometry(0.008, 12, 12), brassMaterial);
      button.position.set(legX * 1.35, -1.3, 0);
      cigaretteGroup.add(button);
    });
    cigaretteGroup.visible = false;
    kurtiGroup.add(cigaretteGroup);
    bottomCigaretteGroupRef.current = cigaretteGroup;

    // Initial Texture Load
    applyFabricTexture(fabric);

    // -------------------------------------------------------------------------
    // 9. ANIMATION LOOP & RESIZE OBSERVER
    // -------------------------------------------------------------------------
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (kurtiGroupRef.current) {
        if (isRotating && !isDraggingRef.current) {
          targetRotationRef.current.y += 0.006;
        }

        kurtiGroupRef.current.rotation.y +=
          (targetRotationRef.current.y - kurtiGroupRef.current.rotation.y) * 0.1;
        kurtiGroupRef.current.rotation.x +=
          (targetRotationRef.current.x - kurtiGroupRef.current.rotation.x) * 0.1;
      }

      if (cameraRef.current) {
        cameraRef.current.position.x +=
          (targetCameraPosRef.current.x - cameraRef.current.position.x) * 0.08;
        cameraRef.current.position.y +=
          (targetCameraPosRef.current.y - cameraRef.current.position.y) * 0.08;
        cameraRef.current.position.z +=
          (targetCameraPosRef.current.z - cameraRef.current.position.z) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 540;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [applyFabricTexture]);

  // ---------------------------------------------------------------------------
  // 10. REACTIVE UPDATES (Fabric, Silhouette, Neckline, Sleeves, Bottoms)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    applyFabricTexture(fabric);
  }, [fabric, applyFabricTexture]);

  useEffect(() => {
    if (straightKurtiGroupRef.current && anarkaliGroupRef.current) {
      straightKurtiGroupRef.current.visible = silhouette === "STRAIGHT_CUT";
      anarkaliGroupRef.current.visible = silhouette === "KALIDAR_ANARKALI";
    }
  }, [silhouette]);

  useEffect(() => {
    if (roundNeckGroupRef.current && sweetheartNeckGroupRef.current) {
      roundNeckGroupRef.current.visible = neckline === "ROUND";
      sweetheartNeckGroupRef.current.visible = neckline === "SWEETHEART";
    }
  }, [neckline]);

  useEffect(() => {
    if (sleeves34GroupRef.current && sleevesNoneGroupRef.current) {
      sleeves34GroupRef.current.visible = sleeves === "THREE_QUARTER";
      sleevesNoneGroupRef.current.visible = sleeves === "SLEEVELESS";
    }
  }, [sleeves]);

  useEffect(() => {
    if (bottomChuridarGroupRef.current && bottomCigaretteGroupRef.current) {
      bottomChuridarGroupRef.current.visible = bottomWear === "CHURIDAR_GATHERED";
      bottomCigaretteGroupRef.current.visible = bottomWear === "CIGARETTE_PANTS";
    }
  }, [bottomWear]);

  // Pointer interactions
  const handlePointerDown = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const deltaX = clientX - prevMousePosRef.current.x;
    const deltaY = clientY - prevMousePosRef.current.y;

    targetRotationRef.current.y += deltaX * 0.008;
    targetRotationRef.current.x = Math.max(
      -0.25,
      Math.min(0.45, targetRotationRef.current.x + deltaY * 0.005)
    );

    prevMousePosRef.current = { x: clientX, y: clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleSelectPreset = (preset: "FULL" | "NECK" | "BORDER" | "BACK") => {
    setActivePreset(preset);
    setIsRotating(false);
    if (preset === "FULL") {
      targetCameraPosRef.current = { x: 0, y: 0.35, z: 3.35 };
      targetRotationRef.current = { x: 0.1, y: 0 };
    } else if (preset === "NECK") {
      targetCameraPosRef.current = { x: 0, y: 0.72, z: 2.05 };
      targetRotationRef.current = { x: 0.04, y: 0 };
    } else if (preset === "BORDER") {
      targetCameraPosRef.current = { x: 0, y: -0.65, z: 2.15 };
      targetRotationRef.current = { x: 0.12, y: 0.25 };
    } else if (preset === "BACK") {
      targetCameraPosRef.current = { x: 0, y: 0.35, z: 3.35 };
      targetRotationRef.current = { x: 0.1, y: Math.PI };
    }
  };

  const handleZoom = (direction: "in" | "out") => {
    const step = direction === "in" ? -0.35 : 0.35;
    const newZ = Math.max(1.7, Math.min(4.3, targetCameraPosRef.current.z + step));
    targetCameraPosRef.current.z = newZ;
    setZoomLevel(Math.round((3.35 / newZ) * 100) / 100);
  };

  const handleResetCamera = () => {
    targetCameraPosRef.current = { x: 0, y: 0.35, z: 3.35 };
    targetRotationRef.current = { x: 0.1, y: 0 };
    setActivePreset("FULL");
    setZoomLevel(1);
  };

  return (
    <div
      className={`relative w-full h-[480px] sm:h-[600px] lg:h-[660px] select-none overflow-hidden rounded-2xl bg-gradient-to-b from-[#FAF7F2] via-[#F5EFE6] to-[#ECE3D4] border border-stone-200/80 shadow-inner ${className}`}
      onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
      onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={(e) => {
        if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchMove={(e) => {
        if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onTouchEnd={handlePointerUp}
    >
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: Active Fabric Badge & Loading Indicator */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md border border-stone-200/70">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A4A38]">
              THAAGAI 3D ENGINE
            </p>
            <p className="text-xs font-serif font-semibold text-stone-900 line-clamp-1">
              {fabric.name} ({fabric.fabricId})
            </p>
          </div>
        </div>

        {isLoadingTexture && (
          <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/90 text-white px-2.5 py-1 text-xs font-medium backdrop-blur-xs shadow-xs animate-fadeIn">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span className="text-[11px]">Draping Fabric...</span>
          </div>
        )}
      </div>

      {/* Bottom Center: Drag Hint */}
      <div className="pointer-events-none absolute bottom-3 sm:bottom-4 inset-x-0 z-10 flex justify-center animate-float">
        <span className="rounded-full bg-stone-900/75 px-4 py-1.5 text-[11px] font-medium text-white/95 backdrop-blur-md shadow-md border border-white/10 animate-pulse">
          Drag to rotate 360° • Pinch to zoom weave
        </span>
      </div>

      {/* Bottom Left Camera Presets Bar */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 flex items-center gap-1 rounded-xl bg-white/95 p-1 shadow-md backdrop-blur-md border border-stone-200/80 text-[11px] font-semibold text-stone-700 animate-scale-in">
        <button
          type="button"
          onClick={() => handleSelectPreset("FULL")}
          className={`tap-bounce rounded-lg px-2.5 py-1 transition-all duration-200 active:scale-95 ${
            activePreset === "FULL"
              ? "bg-[#8A4A38] text-white shadow-2xs scale-[1.02]"
              : "hover:bg-stone-100 text-stone-700"
          }`}
        >
          Full View
        </button>
        <button
          type="button"
          onClick={() => handleSelectPreset("NECK")}
          className={`tap-bounce rounded-lg px-2.5 py-1 transition-all duration-200 active:scale-95 ${
            activePreset === "NECK"
              ? "bg-[#8A4A38] text-white shadow-2xs scale-[1.02]"
              : "hover:bg-stone-100 text-stone-700"
          }`}
        >
          Neckline
        </button>
        <button
          type="button"
          onClick={() => handleSelectPreset("BORDER")}
          className={`tap-bounce rounded-lg px-2.5 py-1 transition-all duration-200 active:scale-95 ${
            activePreset === "BORDER"
              ? "bg-[#8A4A38] text-white shadow-2xs scale-[1.02]"
              : "hover:bg-stone-100 text-stone-700"
          }`}
        >
          Hem Border
        </button>
        <button
          type="button"
          onClick={() => handleSelectPreset("BACK")}
          className={`tap-bounce rounded-lg px-2.5 py-1 transition-all duration-200 active:scale-95 ${
            activePreset === "BACK"
              ? "bg-[#8A4A38] text-white shadow-2xs scale-[1.02]"
              : "hover:bg-stone-100 text-stone-700"
          }`}
        >
          Back
        </button>
      </div>

      {/* Right Floating Quick Tools */}
      <div className="absolute right-3 top-3 sm:right-4 sm:top-4 z-10 flex flex-col gap-2 animate-scale-in">
        {/* Auto Rotate Toggle */}
        <button
          type="button"
          onClick={() => setIsRotating((prev) => !prev)}
          title={isRotating ? "Pause rotation" : "Auto rotate"}
          aria-label="Toggle auto rotation"
          className={`tap-bounce flex h-9 w-9 items-center justify-center rounded-lg shadow-sm backdrop-blur-md border transition-all duration-200 hover:scale-105 active:scale-95 ${
            isRotating
              ? "bg-[#8A4A38] text-white border-[#8A4A38] shadow-md"
              : "bg-white/90 text-stone-700 hover:text-stone-900 border-stone-200"
          }`}
        >
          <RotateCw className={`h-4 w-4 transition-transform ${isRotating ? "animate-spin" : ""}`} />
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={() => handleZoom("in")}
          title="Zoom In"
          aria-label="Zoom in"
          className="tap-bounce flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-stone-700 hover:text-stone-900 border border-stone-200 shadow-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={() => handleZoom("out")}
          title="Zoom Out"
          aria-label="Zoom out"
          className="tap-bounce flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-stone-700 hover:text-stone-900 border border-stone-200 shadow-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        {/* Reset Camera View */}
        <button
          type="button"
          onClick={handleResetCamera}
          title="Reset View"
          aria-label="Reset 3D camera view"
          className="tap-bounce flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-stone-700 hover:text-stone-900 border border-stone-200 shadow-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
