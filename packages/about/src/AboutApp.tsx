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
    <div className="flex flex-col h-full gap-2 overflow-y-auto">
      <h2 className="font-press text-[12px] border-b border-dashed border-cozy-border pb-1 flex items-center gap-1">
        <PixelBioIcon className="w-4 h-4 text-cozy-accent" /> BIO DIRECTORY
      </h2>

      {openFolder === null ? (
        <div className="flex flex-col gap-2 pt-2 text-cozy-text">
          <div
            onClick={() => setOpenFolder("bio")}
            className="border border-cozy-border p-2 bg-black cursor-pointer hover:bg-cozy-accent hover:text-black transition-colors"
          >
            <PixelFolderIcon className="w-4 h-4 mr-2" /> [BIO] - Who is prxxie?
          </div>
          <div
            onClick={() => setOpenFolder("skills")}
            className="border border-cozy-border p-2 bg-black cursor-pointer hover:bg-cozy-accent hover:text-black transition-colors"
          >
            <PixelFolderIcon className="w-4 h-4 mr-2" /> [SKILLS] - Character Stats
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setOpenFolder(null)}
            className="pixel-btn text-[8px] py-1 px-2 mb-2"
          >
            <PixelBackIcon className="w-3.5 h-3.5 mr-1" /> BACK
          </button>
          {openFolder === "bio" && (
            <div className="border border-cozy-border p-3 bg-black text-cozy-text text-sm leading-relaxed">
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
            <div className="border border-cozy-border p-3 bg-black text-cozy-text text-sm">
              <h4 className="font-bold mb-2">CHARACTER LEVELS:</h4>
              <div className="flex flex-col gap-2">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between font-bold text-xs mb-1">
                      <span>{skill.name}</span>
                      <span>LV.{skill.level}</span>
                    </div>
                    <div className="h-4 border border-cozy-border bg-[#201500] relative">
                      <div
                        className="h-full bg-cozy-accent"
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
