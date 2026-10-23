import React, { lazy, Suspense } from "react";
import { Link, useParams } from "react-router";
import { games, isGameSlug } from "../routes";
import MfeLoader from "../components/MfeLoader";
import ErrorBoundary from "../components/regions/ErrorBoundary";
import { useProgressService } from "../hooks/useProgressService";

const GameBoard = lazy(() => import("./game/GameBoard"));

function MissingGame({ slug }: { slug: string }): React.ReactElement {
  return (
    <section className="flex flex-col gap-4 py-8">
      <p className="font-code text-[12px] text-muted">Unknown game</p>
      <h1 className="font-display text-[32px] leading-tight text-ink">There is no game called “{slug}”</h1>
      <p className="text-body">
        The three games are{" "}
        <Link to="/games" className="text-primary underline underline-offset-4">
          listed here
        </Link>
        .
      </p>
    </section>
  );
}

/**
 * The prerendered document carries the game container and a loading sentence,
 * never a board: the remotes are assembled from the artifact and the build has
 * no network to fetch them (US-SITE-003 AC4).
 */
function GamePlaceholder({ slug, title }: { slug: string; title: string }): React.ReactElement {
  return (
    <section className="flex flex-col gap-4 py-6" data-game-container={slug}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-[32px] leading-tight text-ink">{title}</h1>
        <Link to="/games" className="font-code text-[12px] text-muted underline underline-offset-4">
          All games
        </Link>
      </div>
      <div className="panel panel-dark items-center justify-center p-10" data-game-placeholder="">
        <p className="font-code text-[12px] text-on-dark-soft">Loading {title.toLowerCase()}…</p>
      </div>
    </section>
  );
}

export default function GameRoute(): React.ReactElement {
  const { game = "" } = useParams();
  const progress = useProgressService();

  if (!isGameSlug(game)) {
    return <MissingGame slug={game} />;
  }

  const title = games.find((entry) => entry.slug === game)?.title ?? game;

  if (import.meta.env.SSR) {
    return <GamePlaceholder slug={game} title={title} />;
  }

  return (
    <ErrorBoundary title={`${game} could not start`} resetKey={game}>
      <Suspense fallback={<MfeLoader petStage={progress.state.pet.stage} />}>
        <GameBoard slug={game} />
      </Suspense>
    </ErrorBoundary>
  );
}
