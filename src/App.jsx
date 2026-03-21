import { useEffect, useRef, useState } from "react";
import { certifications, issuerLogos, projects, techCategories, techSkillsWithLogos } from "./data";

function SectionHeading({ eyebrow }) {
  return (
    <div className="section-heading reveal">
      <p className="eyebrow">{eyebrow}</p>
    </div>
  );
}

function TechSphere() {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ angleX: 0.3, angleY: 0 });
  const velRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");

    const RADIUS = 200;
    const LOGO_SIZE = 38;
    const N = techSkillsWithLogos.length;

    // Build point list with spherical coords
    const points = techSkillsWithLogos.map((skill, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / N);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const img = new Image();
      img.crossOrigin = "anonymous";
      const p = { ...skill, phi, theta, img: null, loaded: false };
      img.onload = () => { p.img = img; p.loaded = true; };
      img.onerror = () => { p.loaded = true; };
      img.src = skill.logo;
      return p;
    });

    function project(px, py, pz, cx, cy) {
      const fov = 700;
      const scale = fov / (fov + pz + RADIUS);
      return { sx: cx + px * scale, sy: cy + py * scale, scale, depth: pz };
    }

    function rotatePoint(phi, theta, aX, aY) {
      let x = RADIUS * Math.sin(phi) * Math.cos(theta);
      let y = RADIUS * Math.cos(phi);
      let z = RADIUS * Math.sin(phi) * Math.sin(theta);
      const cosY = Math.cos(aY), sinY = Math.sin(aY);
      const x1 = x * cosY + z * sinY; const z1 = -x * sinY + z * cosY;
      x = x1; z = z1;
      const cosX = Math.cos(aX), sinX = Math.sin(aX);
      const y1 = y * cosX - z * sinX; const z2 = y * sinX + z * cosX;
      return { x, y: y1, z: z2 };
    }

    // Mutable hover/mouse state — updated by event handlers, read in draw()
    let mouseX = -9999;
    let mouseY = -9999;
    let running = true;

    // Grab tooltip el synchronously — it's in the DOM at this point
    const wrap = canvas.parentElement;
    const tooltip = wrap ? wrap.querySelector(".tech-sphere-tooltip") : null;

    function showTooltip(name, sx, sy, size) {
      if (!tooltip) return;
      tooltip.textContent = name;
      tooltip.style.left = `${sx}px`;
      tooltip.style.top = `${sy - size * 0.5 - 38}px`;
      tooltip.style.opacity = "1";
      tooltip.style.transform = "translateX(-50%) scale(1)";
    }

    function hideTooltip() {
      if (!tooltip) return;
      tooltip.style.opacity = "0";
      tooltip.style.transform = "translateX(-50%) scale(0.92)";
    }

    function draw() {
      if (!running) return;

      const dpr = window.devicePixelRatio || 1;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;

      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;

      // Auto-rotate
      if (!isDraggingRef.current) {
        rotRef.current.angleY += 0.004;
        rotRef.current.angleX += velRef.current.x * 0.92;
        rotRef.current.angleY += velRef.current.y * 0.92;
        velRef.current.x *= 0.88;
        velRef.current.y *= 0.88;
      }

      const { angleX, angleY } = rotRef.current;

      // Project all points
      const projected = points.map((p) => {
        const { x, y, z } = rotatePoint(p.phi, p.theta, angleX, angleY);
        const { sx, sy, scale, depth } = project(x, y, z, cx, cy);
        return { p, sx, sy, scale, depth };
      });

      projected.sort((a, b) => a.depth - b.depth);

      // Hit-test: find which logo the mouse is over
      let hitItem = null;
      let hitSx = 0, hitSy = 0, hitSize = 0;
      let bestDist = Infinity;

      for (const item of projected) {
        const t = (item.depth + RADIUS) / (2 * RADIUS);
        const size = (LOGO_SIZE * 0.5 + LOGO_SIZE * 0.5 * t) * item.scale * 1.8;
        const hitR = size * 0.7;
        const d = Math.hypot(mouseX - item.sx, mouseY - item.sy);
        if (d < hitR && d < bestDist) {
          bestDist = d;
          hitItem = item.p;
          hitSx = item.sx;
          hitSy = item.sy;
          hitSize = size;
        }
      }

      if (hitItem) {
        showTooltip(hitItem.name, hitSx, hitSy, hitSize);
        canvas.style.cursor = "pointer";
      } else {
        hideTooltip();
        canvas.style.cursor = isDraggingRef.current ? "grabbing" : "grab";
      }

      // Draw
      for (const { p, sx, sy, scale, depth } of projected) {
        const t = (depth + RADIUS) / (2 * RADIUS);
        const alpha = 0.25 + t * 0.75;
        const size = (LOGO_SIZE * 0.5 + LOGO_SIZE * 0.5 * t) * scale * 1.8;
        const isHit = hitItem && hitItem.name === p.name;

        ctx.globalAlpha = isHit ? 1 : alpha;

        if (p.loaded && p.img) {
          const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 0.9);
          grd.addColorStop(0, `rgba(150,180,255,${isHit ? 0.22 : 0.06 * t})`);
          grd.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath();
          ctx.arc(sx, sy, size * 0.9, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();

          const drawSize = isHit ? size * 1.18 : size;
          ctx.drawImage(p.img, sx - drawSize / 2, sy - drawSize / 2, drawSize, drawSize);
        } else {
          ctx.beginPath();
          ctx.arc(sx, sy, 4 * scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,210,255,${alpha})`;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(draw);
    }

    draw();

    // ── Event listeners ──────────────────────────────────
    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      if (isDraggingRef.current) {
        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        velRef.current = { x: dy * 0.003, y: dx * 0.003 };
        rotRef.current.angleX += dy * 0.003;
        rotRef.current.angleY += dx * 0.003;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
      }
    }
    function onMouseLeave() { mouseX = -9999; mouseY = -9999; }
    function onMouseDown(e) {
      isDraggingRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      velRef.current = { x: 0, y: 0 };
    }
    function onMouseUp() { isDraggingRef.current = false; }

    function onTouchStart(e) {
      isDraggingRef.current = true;
      const t0 = e.touches[0];
      lastMouseRef.current = { x: t0.clientX, y: t0.clientY };
      velRef.current = { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      mouseX = t0.clientX - rect.left;
      mouseY = t0.clientY - rect.top;
    }
    function onTouchMove(e) {
      const t0 = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      mouseX = t0.clientX - rect.left;
      mouseY = t0.clientY - rect.top;
      if (!isDraggingRef.current) return;
      const dx = t0.clientX - lastMouseRef.current.x;
      const dy = t0.clientY - lastMouseRef.current.y;
      velRef.current = { x: dy * 0.003, y: dx * 0.003 };
      rotRef.current.angleX += dy * 0.003;
      rotRef.current.angleY += dx * 0.003;
      lastMouseRef.current = { x: t0.clientX, y: t0.clientY };
    }
    function onTouchEnd() {
      isDraggingRef.current = false;
      mouseX = -9999; mouseY = -9999;
    }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <div className="tech-sphere-wrap">
      <canvas ref={canvasRef} className="tech-sphere-canvas" aria-label="Interactive 3D tech stack sphere" />
      <div className="tech-sphere-tooltip" role="tooltip" />
      <p className="tech-sphere-hint">Hover or drag to explore</p>
    </div>
  );
}

function SplashScreen({ onComplete }) {
  const backCanvasRef  = useRef(null);
  const frontCanvasRef = useRef(null);
  const [btnFading, setBtnFading] = useState(false);
  const [exiting, setExiting]     = useState(false);
  const phaseRef      = useRef("idle"); // "idle" | "converging" | "done"
  const exitCalledRef = useRef(false);

  function handleWelcome() {
    if (phaseRef.current !== "idle") return;
    phaseRef.current = "converging";
    setBtnFading(true);
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleWelcome();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const bc = backCanvasRef.current;
    const fc = frontCanvasRef.current;
    if (!bc || !fc) return undefined;
    const bx = bc.getContext("2d");
    const fx = fc.getContext("2d");

    const TRAIL_LEN = 55;
    const FOV = 460;

    // 5 wide-orbit dots covering the full 3D space
    const dots = [
      { angle: 0.0,  speed: 0.0055, radius: 220, incl: 0.12, node: 0.0  }, // near-flat wide sweep
      { angle: 1.26, speed: -0.006, radius: 190, incl: 1.40, node: 1.1  }, // near-vertical
      { angle: 2.51, speed: 0.0048, radius: 255, incl: 0.60, node: 2.3  }, // wide diagonal
      { angle: 3.77, speed: -0.007, radius: 170, incl: 1.52, node: 3.5  }, // almost vertical
      { angle: 5.03, speed: 0.0058, radius: 200, incl: 0.88, node: 4.7  }, // medium tilt
    ].map(d => ({
      ...d,
      x: 0, y: 0, z: 0,
      spiralAngle: d.angle,
      spiralRadius: d.radius,
      trail: [],          // stores projected {sx, sy} for the tail
      done: false,
    }));

    // Convert orbital params → 3D world coords
    function get3D(angle, radius, incl, node) {
      const ox = radius * Math.cos(angle);
      const oz = radius * Math.sin(angle);
      const y  = -oz * Math.sin(incl);
      const z0 =  oz * Math.cos(incl);
      const x  = ox * Math.cos(node) + z0 * Math.sin(node);
      const z  = -ox * Math.sin(node) + z0 * Math.cos(node);
      return { x, y, z };
    }

    // Perspective projection → screen coords
    function proj(x, y, z, cx, cy) {
      const sc = FOV / (FOV + z + 200);
      return { sx: cx + x * sc, sy: cy + y * sc, scale: sc };
    }

    let running = true;

    function resize() {
      bc.width = fc.width = window.innerWidth;
      bc.height = fc.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      if (!running) return;
      bx.clearRect(0, 0, bc.width, bc.height);
      fx.clearRect(0, 0, fc.width, fc.height);

      const W = bc.width, H = bc.height;
      const cx = W / 2, cy = H / 2;
      const phase = phaseRef.current;

      for (const d of dots) {
        if (d.done) continue;

        // ── Update position ─────────────────────────────
        if (phase === "idle") {
          d.angle += d.speed;
          const p = get3D(d.angle, d.radius, d.incl, d.node);
          d.x = p.x; d.y = p.y; d.z = p.z;
          // Keep spiral in sync so it starts from current position
          d.spiralAngle  = d.angle;
          d.spiralRadius = d.radius;
        } else if (phase === "converging") {
          // Slower spin + gentler shrink = smooth comet vortex
          d.spiralAngle  += 0.07;
          d.spiralRadius *= 0.975;
          const p = get3D(d.spiralAngle, d.spiralRadius, d.incl, d.node);
          d.x = p.x; d.y = p.y; d.z = p.z;

          // Push projected point to tail
          const { sx, sy } = proj(d.x, d.y, d.z, cx, cy);
          d.trail.push({ sx, sy, z: d.z });
          if (d.trail.length > TRAIL_LEN) d.trail.shift();

          if (d.spiralRadius < 3) { d.done = true; continue; }
        }

        // ── Choose front or back canvas by z depth ──────
        const { sx, sy, scale } = proj(d.x, d.y, d.z, cx, cy);
        const isFront    = d.z >= 0;
        const ctx        = isFront ? fx : bx;
        const depthAlpha = isFront ? 1.0 : 0.42;

        // ── Draw comet tail ─────────────────────────────
        if (d.trail.length > 1) {
          for (let i = 1; i < d.trail.length; i++) {
            const prog = i / d.trail.length; // 0=tail 1=head
            const a = prog * prog * 0.55 * depthAlpha;
            const r = 1.0 + prog * 5.5;
            const tp = d.trail[i];
            const tCtx = tp.z >= 0 ? fx : bx;
            tCtx.beginPath();
            tCtx.arc(tp.sx, tp.sy, r, 0, Math.PI * 2);
            tCtx.fillStyle = `rgba(165, 198, 242, ${a})`;
            tCtx.fill();
          }
        }

        // ── Glow halo ───────────────────────────────────
        const gr = Math.max(42 * scale, 10);
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, gr);
        grd.addColorStop(0, `rgba(190, 215, 255, ${0.38 * depthAlpha})`);
        grd.addColorStop(1, "rgba(190, 215, 255, 0)");
        ctx.beginPath();
        ctx.arc(sx, sy, gr, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // ── Core dot ────────────────────────────────────
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(6.5 * scale, 3.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(218, 228, 255, ${depthAlpha})`;
        ctx.fill();
      }

      // All done → trigger exit
      if (phase === "converging" && dots.every(d => d.done) && !exitCalledRef.current) {
        exitCalledRef.current = true;
        phaseRef.current = "done";
        setExiting(true);
        setTimeout(onComplete, 1300);
      }

      requestAnimationFrame(draw);
    }

    draw();

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
    };
  }, [onComplete]);

  return (
    <div className={`splash${exiting ? " splash--exit" : ""}`}>
      {/* Back canvas — dots rendered BEHIND the button */}
      <canvas ref={backCanvasRef}  className="splash-canvas splash-canvas--back"  />
      {/* Button layer */}
      <div className="splash-center">
        <button
          className={`splash-enter-btn${btnFading ? " splash-enter-btn--fade" : ""}`}
          type="button"
          onClick={handleWelcome}
          aria-label="Enter portfolio"
        >
          {"WELCOME".split("").map((letter, i) => (
            <span key={i} className="splash-letter" style={{ animationDelay: `${0.8 + i * 0.12}s` }}>
              {letter}
            </span>
          ))}
        </button>
        <p className={`splash-hint${btnFading ? " splash-hint--fade" : ""}`}>click to enter</p>
      </div>
      {/* Front canvas — dots rendered IN FRONT OF the button (pointer-events:none so button still works) */}
      <canvas ref={frontCanvasRef} className="splash-canvas splash-canvas--front" />
    </div>
  );
}

function ProjectModal({ project, onClose }) {
  useEffect(() => {
    if (!project) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="project-modal" aria-hidden="false">
      <button className="project-modal__backdrop" onClick={onClose} aria-label="Close project details" />
      <div className="project-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="project-modal__close" type="button" onClick={onClose} aria-label="Close project details">
          &times;
        </button>
        <div className="project-modal__content">
          <div className="modal-layout">
            <div className="modal-hero">
              <img src={project.image} alt={project.title} loading="lazy" />
            </div>
            <div className="modal-copy">
              <h2 id="modal-title">{project.title}</h2>
              <p>{project.description}</p>
            </div>
            <div className="modal-meta">
              {project.tech.map((item) => <span className="project-tag" key={item}>{item}</span>)}
            </div>
            <ul className="modal-feature-list">
              {project.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <div className="modal-actions">
              <a className="button button--primary" href={project.github} target="_blank" rel="noreferrer">GitHub</a>
            </div>
            <div className="modal-gallery">
              {project.gallery.map((image, index) => (
                <figure className="macbook" key={image}>
                  <div className="macbook__screen">
                    <img src={image} alt={`${project.title} screenshot ${index + 1}`} loading="lazy" />
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [techCanScrollLeft, setTechCanScrollLeft] = useState(false);
  const [techCanScrollRight, setTechCanScrollRight] = useState(true);
  const [projectCanScrollLeft, setProjectCanScrollLeft] = useState(false);
  const [projectCanScrollRight, setProjectCanScrollRight] = useState(true);
  const techSliderRef = useRef(null);
  const projectSliderRef = useRef(null);

  const handleSplashComplete = () => {
    setSplashDone(true);
    document.body.classList.remove("splash-active");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  useEffect(() => {
    if (!splashDone) {
      document.body.classList.add("splash-active");
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, [splashDone]);

  useEffect(() => {
    document.body.classList.toggle("light-theme", theme === "light");
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  useEffect(() => {
    const nodes = document.querySelectorAll(".reveal, .pop-reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const slider = techSliderRef.current;
    if (!slider) return undefined;

    const updateTechButtons = () => {
      const item = slider.firstElementChild;
      const gap = Number.parseFloat(getComputedStyle(slider).gap || "0");
      const step = item ? item.getBoundingClientRect().width + gap : slider.clientWidth;
      const maxIndex = item ? slider.children.length - 1 : 0;
      const index = step > 0 ? Math.round(slider.scrollLeft / step) : 0;

      setTechCanScrollLeft(index > 0);
      setTechCanScrollRight(index < maxIndex);
    };

    updateTechButtons();
    slider.addEventListener("scroll", updateTechButtons, { passive: true });

    const resizeObserver = new ResizeObserver(updateTechButtons);
    resizeObserver.observe(slider);

    return () => {
      slider.removeEventListener("scroll", updateTechButtons);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const slider = projectSliderRef.current;
    if (!slider) return undefined;

    const updateProjectButtons = () => {
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      setProjectCanScrollLeft(slider.scrollLeft > 2);
      setProjectCanScrollRight(slider.scrollLeft < maxScroll - 2);
    };

    updateProjectButtons();
    slider.addEventListener("scroll", updateProjectButtons, { passive: true });

    const resizeObserver = new ResizeObserver(updateProjectButtons);
    resizeObserver.observe(slider);

    return () => {
      slider.removeEventListener("scroll", updateProjectButtons);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    let resizeTimer;
    const handleResize = () => {
      document.body.classList.add("resize-animation-stopper");
      if (window.innerWidth > 980) {
        setIsMobileMenuOpen(false);
      }
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        document.body.classList.remove("resize-animation-stopper");
      }, 400);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  const handleTechArrow = (direction) => {
    const slider = techSliderRef.current;
    if (!slider) return;

    const item = slider.firstElementChild;
    const gap = Number.parseFloat(getComputedStyle(slider).gap || "0");
    const step = item ? item.getBoundingClientRect().width + gap : slider.clientWidth;

    slider.scrollBy({
      left: direction * step,
      behavior: "smooth"
    });
  };

  const handleProjectArrow = (direction) => {
    const slider = projectSliderRef.current;
    if (!slider) return;

    const item = slider.firstElementChild;
    const gap = Number.parseFloat(getComputedStyle(slider).gap || "0");
    const step = item ? item.getBoundingClientRect().width + gap : slider.clientWidth;

    slider.scrollBy({
      left: direction * step,
      behavior: "smooth"
    });
  };

  return (
    <>
      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
      <header className={`topbar ${isMobileMenuOpen ? "is-open" : ""}`}>
        <div className="topbar__inner">
          <a className="brand" href="#hero">KP</a>
          
          <nav className={`topnav ${isMobileMenuOpen ? "is-open" : ""}`} aria-label="Primary">
            <a className="nav-link" href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</a>
            <a className="nav-link" href="#skills" onClick={() => setIsMobileMenuOpen(false)}>Skills</a>
            <a className="nav-link" href="#projects" onClick={() => setIsMobileMenuOpen(false)}>Projects</a>
            <a className="nav-link" href="#training" onClick={() => setIsMobileMenuOpen(false)}>Training</a>
            <a className="nav-link" href="#education" onClick={() => setIsMobileMenuOpen(false)}>Education</a>
            <a className="nav-link" href="#certifications" onClick={() => setIsMobileMenuOpen(false)}>Certifications</a>
            <a className="nav-link" href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
          </nav>

          <div className="topbar__controls">
            <button
              className="theme-toggle"
              type="button"
              aria-label="Toggle color theme"
              aria-pressed={theme === "light"}
              onClick={() => setTheme((value) => value === "light" ? "dark" : "light")}
            >
              <span className="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M12 3.75v1.75M12 18.5v1.75M5.46 5.46l1.24 1.24M17.3 17.3l1.24 1.24M3.75 12h1.75M18.5 12h1.75M5.46 18.54 6.7 17.3M17.3 6.7l1.24-1.24M15.5 12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" />
                </svg>
              </span>
              <span className="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M15.25 3.55A8.85 8.85 0 1 0 20.4 18.4 7.2 7.2 0 1 1 15.25 3.55Z" />
                </svg>
              </span>
            </button>
            <button
              className="mobile-menu-toggle"
              type="button"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="hamburger-line" aria-hidden="true"></span>
              <span className="hamburger-line" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </header>

      <div className="site-shell">
        <main>
          <section className="hero section" id="hero">
            <article className="hero-card reveal">
              <h1 className="hero-sequence hero-sequence--1">Krishna Pathak</h1>
              <p className="hero-role hero-sequence hero-sequence--2">DATA SCIENTIST / CSE STUDENT</p>
              <p className="hero__lead hero-sequence hero-sequence--3">
                Turning raw data into actionable insights. Passionate about data analytics, business intelligence, and building end-to-end data solutions.
              </p>
              <div className="hero__actions hero-sequence hero-sequence--4">
                {/* Social icon links */}
                <div className="hero-social-row">
                  <a className="hero-icon-btn" href="http://linkedin.com/in/krishnapathk" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a className="hero-icon-btn" href="https://github.com/pathakkrishna" target="_blank" rel="noreferrer" aria-label="GitHub">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                  </a>
                  <a className="hero-icon-btn" href="https://www.instagram.com/krishnpathak04?igsh=enBpaTZzdWhwMnlm" target="_blank" rel="noreferrer" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a className="hero-icon-btn" href="mailto:pathakkrishna281206@gmail.com" aria-label="Send email">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
                    </svg>
                  </a>
                </div>
                {/* CV download */}
                <a className="button button--secondary hero-cv-btn" href="/assets/Krishna-Pathak-Resume.txt" download>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download CV
                </a>
              </div>
            </article>
          </section>

          <section className="about section" id="about">
            <SectionHeading eyebrow="About Me" title="Who I Am" />
            <div className="about-layout">
              <figure className="about-portrait reveal pop-reveal" style={{ "--pop-delay": "0s" }}>
                <div className="about-portrait__frame">
                  <img src="/images/profile-placeholder.svg" alt="Portrait placeholder for Krishna Pathak" loading="lazy" />
                </div>
              </figure>
              <article className="about-copy content-card reveal pop-reveal" style={{ "--pop-delay": "0.08s" }}>
                <p>
                  I am a Computer Science and Engineering student focused on data analytics, business intelligence, and end-to-end reporting workflows.
                  I enjoy working with structured datasets, dashboard design, and turning complex metrics into clear decisions for teams.
                </p>
                <p>
                  My goal is to contribute in Data Scientist and Analyst roles where strong analytical thinking, clean execution, and practical business understanding matter.
                </p>
                <p>
                  I’m especially interested in building data products that combine analysis, reporting, and business context into interfaces that feel simple, useful, and decision-ready.
                </p>
              </article>
            </div>
          </section>

          <section className="skills section" id="skills">
            <SectionHeading eyebrow="Skills" title="Tech Stack" />
            <div className="tech-sphere-section reveal">
              <TechSphere />
            </div>
          </section>

          <section className="projects section" id="projects">
            <SectionHeading eyebrow="Projects" title="Featured Work" />
            <div className="project-showcase reveal">
              <div className="slider-header">
                <p>Project showcase</p>
              </div>
              <div className="project-slider" ref={projectSliderRef} tabIndex="0" aria-label="Project slider">
                {projects.map((project, index) => (
                  <article
                    className="project-card interactive-lift pop-reveal"
                    key={project.title}
                    style={{ "--pop-delay": `${index * 0.08}s` }}
                  >
                    <div className="project-card__media">
                      <img src={project.image} alt={project.title} loading="lazy" />
                    </div>
                    <div className="project-card__body">
                      <h3 className="project-card__title">{project.title}</h3>
                      <div className="project-card__tags">
                        {project.tech.map((item) => <span className="project-tag" key={item}>{item}</span>)}
                      </div>
                    </div>
                    <button className="project-card__plus" type="button" onClick={() => setSelectedProject(project)} aria-label={`Open details for ${project.title}`}>+</button>
                  </article>
                ))}
              </div>
              <div className="slider-controls slider-controls--bottom" aria-label="Project carousel controls">
                <button className={`slider-control slider-control--circle ${!projectCanScrollLeft ? "is-disabled" : ""}`} type="button" onClick={() => handleProjectArrow(-1)} disabled={!projectCanScrollLeft} aria-label="Previous project">&#8249;</button>
                <button className={`slider-control slider-control--circle ${!projectCanScrollRight ? "is-disabled" : ""}`} type="button" onClick={() => handleProjectArrow(1)} disabled={!projectCanScrollRight} aria-label="Next project">&#8250;</button>
              </div>
            </div>
          </section>

          <section className="training section" id="training">
            <SectionHeading eyebrow="Training" title="Training & Coursework" />
            <div className="training-intro reveal">
              <p>Focused skill development through structured practice.</p>
              <div className="training-divider" aria-hidden="true"></div>
            </div>
            <div className="timeline">
              <article className="timeline-card training-card reveal pop-reveal" style={{ "--pop-delay": "0.08s" }}>
                <div className="training-card__top">
                  <div className="training-org-wrap">
                    <span className="training-org-logo" aria-hidden="true">CS</span>
                    <span className="training-org">Cipher School</span>
                  </div>
                  <span className="training-date">July 2025</span>
                </div>
                <h3 className="training-title">Data Structures &amp; Algorithms Training</h3>
                <p className="training-description">
                  Intensive coursework focused on implementing core data structures and building strong algorithmic problem-solving fundamentals in Java.
                </p>
                <ul className="training-points">
                  <li>Implemented arrays, linked lists, stacks, queues, trees, and graphs</li>
                  <li>Solved sorting, searching, and recursion problems</li>
                  <li>Improved algorithm efficiency using time and space complexity analysis</li>
                </ul>
                <div className="training-learnings">
                  <span className="training-label">Key Learnings</span>
                  <div className="training-learning-list">
                    <span>Algorithm optimization</span>
                    <span>Problem-solving patterns</span>
                    <span>Data structure implementation</span>
                  </div>
                </div>
                <div className="training-tags">
                  <span className="training-tag">Java</span>
                  <span className="training-tag">OOP</span>
                  <span className="training-tag">Data Structures</span>
                  <span className="training-tag">Algorithms</span>
                </div>
              </article>
            </div>
          </section>

          <section className="education section" id="education">
            <SectionHeading eyebrow="Education" title="Academic background." />
            <div className="education-grid">
              <article className="timeline-card edu-card reveal pop-reveal" style={{ "--pop-delay": "0s" }}>
                <div className="edu-card__top">
                  <div className="edu-card__title-wrap">
                    <span className="edu-icon" aria-hidden="true">🎓</span>
                    <h3 className="edu-school">Lovely Professional University</h3>
                  </div>
                  <span className="current-badge">Current</span>
                </div>
                <div className="edu-divider" aria-hidden="true"></div>
                <p className="edu-degree">B.Tech - Computer Science &amp; Engineering</p>
                <p className="edu-detail"><strong>CGPA:</strong> 6.7</p>
                <div className="edu-meta">
                  <span>Aug 2023 - Present</span>
                  <span>Punjab, India</span>
                </div>
              </article>
              <article className="timeline-card edu-card reveal pop-reveal" style={{ "--pop-delay": "0.08s" }}>
                <div className="edu-card__title-wrap">
                  <span className="edu-icon" aria-hidden="true">📘</span>
                  <h3 className="edu-school">St. Francis Inter College</h3>
                </div>
                <div className="edu-divider" aria-hidden="true"></div>
                <p className="edu-degree">Intermediate</p>
                <p className="edu-detail"><strong>Score:</strong> 62%</p>
                <div className="edu-meta">
                  <span>2022 - 2023</span>
                  <span>Hathras, U.P.</span>
                </div>
              </article>
              <article className="timeline-card edu-card reveal pop-reveal" style={{ "--pop-delay": "0.16s" }}>
                <div className="edu-card__title-wrap">
                  <span className="edu-icon" aria-hidden="true">📗</span>
                  <h3 className="edu-school">St. Francis Inter College</h3>
                </div>
                <div className="edu-divider" aria-hidden="true"></div>
                <p className="edu-degree">Matriculation</p>
                <p className="edu-detail"><strong>Score:</strong> 84%</p>
                <div className="edu-meta">
                  <span>2020 - 2021</span>
                  <span>Hathras, U.P.</span>
                </div>
              </article>
            </div>
          </section>

          <section className="certifications section" id="certifications">
            <SectionHeading eyebrow="Certifications" title="Professional certifications across analytics and programming." />
            <div className="certification-grid">
              {certifications.map((item, index) => (
                <article
                  className="timeline-card certification-card interactive-lift reveal pop-reveal"
                  key={item.title}
                  style={{ "--pop-delay": `${index * 0.08}s` }}
                >
                  <div className="certification-card__meta">
                    <div className="certification-card__issuer-wrap">
                      <img className="certification-logo" src={issuerLogos[item.issuer]} alt="" aria-hidden="true" loading="lazy" />
                      <span className="certification-issuer">{item.issuer}</span>
                    </div>
                    <span className="certification-separator" aria-hidden="true"></span>
                    <span className="certification-date">{item.date}</span>
                  </div>
                  <h3 className="certification-title">{item.title}</h3>
                  <div className="certification-tags">
                    {item.tags.map((tag) => <span className="training-tag" key={tag}>{tag}</span>)}
                  </div>
                  <button className="project-card__plus certification-card__plus" type="button" onClick={() => setSelectedCertificate(item)} aria-label={`Open certificate details for ${item.title}`}>+</button>
                </article>
              ))}
            </div>
          </section>

          <section className="achievements section" id="achievements">
            <SectionHeading eyebrow="Achievements" title="Selected outcomes and learning milestones." />
            <div className="achievement-grid">
              <article className="timeline-card achievement-card reveal pop-reveal" style={{ "--pop-delay": "0s" }}>
                <div className="achievement-icon" aria-hidden="true">📊</div>
                <strong className="achievement-number">3+</strong>
                <h3 className="achievement-title">Projects Built</h3>
                <p className="achievement-desc">
                  Real-world analytics dashboards and business intelligence projects built using Python, Excel, and Power BI.
                </p>
              </article>
              <article className="timeline-card achievement-card reveal pop-reveal" style={{ "--pop-delay": "0.08s" }}>
                <div className="achievement-icon" aria-hidden="true">🎓</div>
                <strong className="achievement-number">5+</strong>
                <h3 className="achievement-title">Industry Certifications</h3>
                <p className="achievement-desc">
                  Certifications completed across Python, Java, networking, communication, and generative AI.
                </p>
              </article>
              <article className="timeline-card achievement-card reveal pop-reveal" style={{ "--pop-delay": "0.16s" }}>
                <div className="achievement-icon" aria-hidden="true">📈</div>
                <strong className="achievement-number">100K+</strong>
                <h3 className="achievement-title">Data Points Analyzed</h3>
                <p className="achievement-desc">
                  Processed and analyzed large datasets in analytics projects using Python, dashboards, and visual reporting tools.
                </p>
              </article>
            </div>
          </section>

          <section className="contact section minimal-contact" id="contact">
            <h2 className="contact-heading reveal">Get in Touch!</h2>
            <div className="contact-minimal-list reveal pop-reveal">
              <div className="contact-minimal-item">
                <svg className="contact-minimal-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span>Mathura, Uttar Pradesh, IN</span>
              </div>
              <div className="contact-minimal-item">
                <svg className="contact-minimal-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                <span>8126833601</span>
              </div>
              <div className="contact-minimal-item">
                <svg className="contact-minimal-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                <span>pathakkrishna281206@gmail.com</span>
              </div>
            </div>
            <div className="contact-minimal-actions reveal pop-reveal" style={{ "--pop-delay": "0.3s" }}>
              <a className="button button--primary" href="mailto:pathakkrishna281206@gmail.com">Send Message</a>
            </div>
          </section>
        </main>
        <footer className="site-footer reveal">
          <p>© 2026 <span className="highlight-underline">Krishna Pathak</span>. All rights reserved.</p>
        </footer>
      </div>
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      <CertificateModal certificate={selectedCertificate} onClose={() => setSelectedCertificate(null)} />
    </>
  );
}

function CertificateModal({ certificate, onClose }) {
  useEffect(() => {
    if (!certificate) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [certificate, onClose]);

  if (!certificate) return null;

  return (
    <div className="project-modal" aria-hidden="false">
      <button className="project-modal__backdrop" onClick={onClose} aria-label="Close certificate details" />
      <div className="project-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="certificate-modal-title">
        <button className="project-modal__close" type="button" onClick={onClose} aria-label="Close certificate details">
          &times;
        </button>
        <div className="project-modal__content">
          <div className="modal-layout">
            <div className="modal-copy">
              <h2 id="certificate-modal-title">{certificate.title}</h2>
              <p>{certificate.issuer}</p>
              <p>{certificate.date}</p>
            </div>
            <div className="modal-hero">
              <img src={certificate.image} alt={certificate.title} loading="lazy" />
            </div>
            <div className="modal-meta">
              {certificate.tags.map((item) => <span className="project-tag" key={item}>{item}</span>)}
            </div>
            <p className="certificate-description">{certificate.description}</p>
            <div className="modal-actions">
              <a className="button button--primary" href={certificate.viewLink} target="_blank" rel="noreferrer">View Certificate</a>
              {certificate.verifyLink ? (
                <a className="button button--secondary" href={certificate.verifyLink} target="_blank" rel="noreferrer">Verify Certificate</a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
