import React, { useEffect, useRef } from "react";

export default function HomeDashboard(): React.ReactElement {
  const planetCanvasRef = useRef<HTMLCanvasElement>(null);
  const waterfallRef = useRef<HTMLCanvasElement>(null);
  const oscilloscopeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = planetCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let angle = 0;
    let animId = 0;

    const draw = (): void => {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = 45;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "#161a0e";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#ffb000";
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      angle += 0.006;
      const offset = (angle * 40) % 80;

      ctx.strokeStyle = "#aa7500";
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.ellipse(cx + i * 20 + offset - 30, cy, 30, r * 0.95, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = "#3a2800";
      ctx.beginPath();
      ctx.arc(cx + 10, cy - 8, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx - 18, cy + 12, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      ctx.strokeStyle = "#ffb000";
      ctx.lineWidth = 0.75;
      ctx.strokeRect(cx - r - 6, cy - r - 6, 8, 8);
      ctx.strokeRect(cx + r - 2, cy + r - 2, 8, 8);

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    const osc = oscilloscopeRef.current;
    const wf = waterfallRef.current;
    if (!osc || !wf) return;
    const oCtx = osc.getContext("2d");
    const wCtx = wf.getContext("2d");
    if (!oCtx || !wCtx) return;

    let wavePhase = 0;
    let animId = 0;

    osc.width = osc.parentElement?.clientWidth || 250;
    osc.height = osc.parentElement?.clientHeight || 65;
    wf.width = wf.parentElement?.clientWidth || 250;
    wf.height = wf.parentElement?.clientHeight || 65;

    const drawWaves = (): void => {
      oCtx.clearRect(0, 0, osc.width, osc.height);
      oCtx.strokeStyle = "#ffb000";
      oCtx.lineWidth = 1;
      oCtx.beginPath();
      wavePhase += 0.15;
      for (let x = 0; x < osc.width; x++) {
        const y =
          osc.height / 2 +
          Math.sin(x * 0.05 + wavePhase) * 12 +
          Math.sin(x * 0.12 - wavePhase * 1.5) * 4;
        if (x === 0) oCtx.moveTo(x, y);
        else oCtx.lineTo(x, y);
      }
      oCtx.stroke();

      wCtx.clearRect(0, 0, wf.width, wf.height);
      wCtx.fillStyle = "#ffb000";
      const barWidth = 4;
      const gap = 2;
      const count = Math.floor(wf.width / (barWidth + gap));

      for (let i = 0; i < count; i++) {
        const height =
          Math.abs(
            Math.sin(i * 0.2 + wavePhase) * Math.cos(i * 0.05 + wavePhase * 0.8)
          ) *
          (wf.height - 10);
        wCtx.fillRect(i * (barWidth + gap), wf.height - height, barWidth, height);
      }

      animId = requestAnimationFrame(drawWaves);
    };
    drawWaves();
    return () => cancelAnimationFrame(animId);
  }, []);

  const logs = [
    "PID  USER    MEM%  TIME+    Command",
    "051  root20  0.20  0:00.00  tail -n +0 -F /logs",
    "052  root27  0.50  0:00.21  /tools/shell/MFE_LOAD",
    "053  root20  0.26  0:00.19  /usr/bin/web-audio-init",
    "056  root28  0.23  0:00.00  /node/packages/pets/tick",
    "057  root20  0.80  0:00.05  /bin/shikaku-solver-v1",
  ];

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
        <div className="border border-cozy-border p-2 flex gap-3 items-center bg-black relative">
          <div className="flex flex-col justify-between h-full font-mono text-[9px]">
            <div>
              <div className="text-[7px] text-cozy-muted uppercase">
                Planet Designation
              </div>
              <div className="text-cozy-text font-bold font-press text-[9px] mb-1">
                BYRIA-RR9
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div>MASS: 6.39 x 10^23 kg</div>
              <div>GRAVITY: 3.721 m/s²</div>
              <div>RADIUS: 3,389.5 km</div>
            </div>
          </div>
          <div className="flex-1 flex justify-center items-center">
            <canvas
              ref={planetCanvasRef}
              width={110}
              height={110}
              className="max-w-full"
            />
          </div>
        </div>

        <div className="border border-cozy-border p-2 bg-black flex flex-col">
          <div className="text-[9px] font-press text-cozy-accent border-b border-cozy-border pb-1 mb-1.5 flex justify-between">
            <span>SYSTEM_BOOT_LOGS</span>
            <span className="text-cozy-text text-[8px] animate-pulse">● ONLINE</span>
          </div>
          <div className="font-mono text-[9px] text-cozy-text leading-tight overflow-hidden whitespace-pre">
            {logs.join("\n")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border border-cozy-border p-2 bg-black flex flex-col h-[100px]">
          <div className="text-[8px] font-mono text-cozy-accent border-b border-cozy-border pb-1 mb-1 flex justify-between">
            <span>Transmissions Scanning</span>
            <span className="text-cozy-text font-bold">1285 kHz</span>
          </div>
          <div className="flex-1 min-h-0 relative">
            <canvas ref={waterfallRef} className="w-full h-full block bg-black/40" />
          </div>
        </div>

        <div className="border border-cozy-border p-2 bg-black flex flex-col h-[100px]">
          <div className="text-[8px] font-mono text-cozy-accent border-b border-cozy-border pb-1 mb-1 flex justify-between">
            <span>Incoming Signal Wave</span>
            <span className="text-cozy-text font-bold">Channel: 98</span>
          </div>
          <div className="flex-1 min-h-0 relative">
            <canvas ref={oscilloscopeRef} className="w-full h-full block bg-black/40" />
          </div>
        </div>

        <div className="border border-cozy-border p-2 bg-black flex flex-col justify-between h-[100px] font-mono text-[9px]">
          <div className="text-[8px] font-press text-cozy-accent border-b border-cozy-border pb-1 mb-1">
            BROADCAST_TOWERS
          </div>
          <div className="flex flex-col gap-1 text-[8px]">
            <a
              href="https://github.com/prxxie"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex justify-between"
            >
              <span>BRT-743-T (GITHUB)</span>
              <span className="text-cozy-text">ONLINE</span>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex justify-between"
            >
              <span>AEW-DYM-Y (TWITTER)</span>
              <span className="text-cozy-text">STABLE</span>
            </a>
            <div className="flex justify-between text-cozy-muted">
              <span>RT-GPT-05 (LOCAL)</span>
              <span>RSSI: -83dBm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
