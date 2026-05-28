import React, { useState } from 'react';

export default function AboutApp() {
  const [openFolder, setOpenFolder] = useState(null);

  const skills = [
    { name: 'React', level: 9 },
    { name: 'Tailwind CSS', level: 8 },
    { name: 'Zustand / Redux', level: 7 },
    { name: 'GitHub Actions', level: 6 }
  ];

  return (
    <div className="flex flex-col h-full gap-2 overflow-y-auto">
      <h2 className="font-press text-[12px] border-b-2 border-dashed border-cozy-border pb-1">🗄️ BIO DIRECTORY</h2>
      
      {openFolder === null ? (
        <div className="flex flex-col gap-2 pt-2">
          <div onClick={() => setOpenFolder('bio')} className="border-2 border-cozy-border p-2 bg-[#f0f9f2] cursor-pointer hover:bg-[#d5eedb]">
            📁 [BIO] - Who is prxxie?
          </div>
          <div onClick={() => setOpenFolder('skills')} className="border-2 border-cozy-border p-2 bg-[#f0f9f2] cursor-pointer hover:bg-[#d5eedb]">
            📁 [SKILLS] - Character Stats
          </div>
        </div>
      ) : (
        <div>
          <button onClick={() => setOpenFolder(null)} className="pixel-btn text-[8px] py-1 px-2 mb-2">🔙 BACK</button>
          {openFolder === 'bio' && (
            <div className="border-2 border-cozy-border p-3 bg-white text-sm leading-relaxed">
              <p className="mb-2"><strong>NAME:</strong> prxxie</p>
              <p className="mb-2"><strong>CLASS:</strong> Web Developer</p>
              <p>Hello! I build highly interactive websites. I love combining clean engineering practices (like micro frontends) with rich visual game designs.</p>
            </div>
          )}
          {openFolder === 'skills' && (
            <div className="border-2 border-cozy-border p-3 bg-white text-sm">
              <h4 className="font-bold mb-2">CHARACTER LEVELS:</h4>
              <div className="flex flex-col gap-2">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex justify-between font-bold text-xs mb-1">
                      <span>{skill.name}</span>
                      <span>LV.{skill.level}</span>
                    </div>
                    <div className="h-4 border-2 border-cozy-border bg-gray-100 relative">
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
