import React, { lazy, Suspense } from "react";
import { Link, useParams } from "react-router";
import { isGameSlug } from "../routes";
import MfeLoader from "../components/MfeLoader";
import { useProgressService } from "../hooks/useProgressService";

const ShikakuApp = lazy(() => import("shikaku/ShikakuApp"));
const SokobanApp = lazy(() => import("sokoban/SokobanApp"));
const SlitherlinkApp = lazy(() => import("slitherlink/SlitherlinkApp"));

function Remote({ slug }: { slug: string }): React.ReactElement | null {
  switch (slug) {
    case "shikaku":
      return <ShikakuApp />;
    case "sokoban":
      return <SokobanApp />;
    case "slitherlink":
      return <SlitherlinkApp />;
    default:
      return null;
  }
}

function MissingGame({ slug }: { slug: string }): React.ReactElement {
  return (
    <section className="flex flex-col gap-4 py-8">
      <p className="font-code text-[12px] text-muted">Unknown game</p>
      <h1 className="font-display text-[32px] leading-tight text-ink">There is no game called “{slug}”</h1>
      <p className="text-body">
        The three games are <Link to="/games" className="text-primary underline underline-offset-4">listed here</Link>.
      </p>
    </section>
  );
}

export default function GameRoute(): React.ReactElement {
  const { game = "" } = useParams();
  const progress = useProgressService();

  if (!isGameSlug(game)) {
    return <MissingGame slug={game} />;
  }

  return (
    <Suspense fallback={<MfeLoader petStage={progress.state.pet.stage} />}>
      <Remote slug={game} />
    </Suspense>
  );
}
