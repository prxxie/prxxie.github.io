import React, { useState } from "react";
import { PixelFolderIcon, PixelBackIcon, PixelBioIcon } from "./Icons";

interface Skill {
  name: string;
  level: number;
}

type FolderName = "bio" | "skills" | null;

export default function AboutApp(): React.ReactElement {
  const [openFolder, setOpenFolder] = useState<FolderName>(null);

  const skills: Skill[] = [
    { name: "React", level: 9 },
    { name: "Tailwind CSS", level: 8 },
    { name: "Zustand / Redux", level: 7 },
    { name: "GitHub Actions", level: 6 },
  ];

  return (
    <div className="flex flex-col h-full gap-6 overflow-y-auto">
      <h2 className="font-display text-sm text-ink border-b border-hairline pb-2 flex items-center gap-2">
        <PixelBioIcon className="w-4 h-4 text-accent-amber" /> BIO DIRECTORY
      </h2>

      {openFolder === null ? (
        <div className="flex flex-col gap-3 pt-2 text-ink">
          <button
            onClick={() => setOpenFolder("bio")}
            className="card bg-surface-card hover:bg-surface-dark hover:text-on-dark cursor-pointer transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <PixelFolderIcon className="w-4 h-4" /> [BIO] - Who is prxxie?
            </div>
          </button>
          <button
            onClick={() => setOpenFolder("skills")}
            className="card bg-surface-card hover:bg-surface-dark hover:text-on-dark cursor-pointer transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <PixelFolderIcon className="w-4 h-4" /> [SKILLS] - Character Stats
            </div>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setOpenFolder(null)}
            className="btn btn-primary btn-sm h-10 px-5 w-fit"
          >
            <PixelBackIcon className="w-3.5 h-3.5 mr-1" /> BACK
          </button>
          {openFolder === "bio" && (
            <div className="card bg-surface-dark text-on-dark p-6 text-sm leading-relaxed">
              <p className="mb-2">
                <strong>NAME:</strong> prxxie
              </p>
              <p className="mb-2">
                <strong>CLASS:</strong> Web Developer
              </p>
              <p>
                Hello! I build highly interactive websites. I love combining
                clean engineering practices (like micro frontends) with rich
                visual game designs.
              </p>
            </div>
          )}
          {openFolder === "skills" && (
            <div className="card bg-surface-dark text-on-dark p-6 text-sm">
              <h4 className="font-bold mb-3">CHARACTER LEVELS:</h4>
              <div className="flex flex-col gap-3">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between font-bold text-xs mb-1">
                      <span>{skill.name}</span>
                      <span>LV.{skill.level}</span>
                    </div>
                    <div className="h-4 border border-hairline bg-surface-dark-elevated relative">
                      <div
                        className="h-full bg-accent-amber transition-all duration-500"
                        style={{ width: `${skill.level * 10}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
