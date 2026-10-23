import React from "react";
import { Link } from "react-router";
import { games } from "../routes";

export default function GamesHub(): React.ReactElement {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-[32px] leading-tight text-ink">Games</h1>
        <p className="text-body max-w-prose">
          Three puzzles, each built as its own deployable remote and each solved in the browser.
        </p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2">
        {games.map((game) => (
          <li key={game.slug} className="panel">
            <div className="panel-body flex flex-col gap-2">
              <h2 className="font-display text-[22px] text-ink">{game.title}</h2>
              <p className="text-body">{game.blurb}</p>
              <Link to={`/games/${game.slug}`} className="text-primary underline underline-offset-4">
                Play {game.title}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
