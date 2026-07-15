"use client";

import * as React from "react";
import {
  BaseEdge,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
  useViewport,
} from "@xyflow/react";

import { CloseIcon, ExpandIcon, HandIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FlipBoard } from "@/components/ui/flip-board";
import { WorldCupTrophyThree } from "@/components/world-cup-trophy-three";
import { cn } from "@/lib/utils";

type Team = {
  code: string;
  name: string;
  flag: string;
  flagFit?: "cover" | "fill";
};

type Match = {
  id: string;
  number: number;
  date: string;
  kickoff?: string;
  matchTime?: string | null;
  venue: string;
  status: "Final" | "Live" | "Upcoming";
  teams: [Team | null, Team | null];
  scores: [number | null, number | null];
  winner?: string;
  note?: string;
};

type Stadium = {
  name: string;
  photo: string;
};

const localFlags: Record<string, string> = {
  ARG: "/flags/ar.svg",
  BEL: "/flags/be.svg",
  ENG: "/flags/gb-eng.svg",
  ESP: "/flags/es.svg",
  FRA: "/flags/fr.svg",
  MAR: "/flags/ma.svg",
  NOR: "/flags/no.svg",
  SUI: "/flags/ch.svg",
};

const makeTeam = (code: string, name: string, countryCode: string): Team => ({
  code,
  name,
  flag: localFlags[code] ?? `https://flagcdn.com/${countryCode}.svg`,
});

const teams: Record<string, Team> = {
  RSA: makeTeam("RSA", "South Africa", "za"),
  CAN: { ...makeTeam("CAN", "Canada", "ca"), flagFit: "fill" },
  GER: makeTeam("GER", "Germany", "de"),
  PAR: makeTeam("PAR", "Paraguay", "py"),
  NED: makeTeam("NED", "Netherlands", "nl"),
  MAR: makeTeam("MAR", "Morocco", "ma"),
  BRA: makeTeam("BRA", "Brazil", "br"),
  JPN: makeTeam("JPN", "Japan", "jp"),
  FRA: makeTeam("FRA", "France", "fr"),
  SWE: makeTeam("SWE", "Sweden", "se"),
  CIV: makeTeam("CIV", "Côte d’Ivoire", "ci"),
  NOR: makeTeam("NOR", "Norway", "no"),
  MEX: makeTeam("MEX", "Mexico", "mx"),
  ECU: makeTeam("ECU", "Ecuador", "ec"),
  ENG: makeTeam("ENG", "England", "gb-eng"),
  COD: makeTeam("COD", "Congo DR", "cd"),
  USA: makeTeam("USA", "USA", "us"),
  BIH: makeTeam("BIH", "Bosnia", "ba"),
  BEL: makeTeam("BEL", "Belgium", "be"),
  SEN: makeTeam("SEN", "Senegal", "sn"),
  POR: makeTeam("POR", "Portugal", "pt"),
  CRO: makeTeam("CRO", "Croatia", "hr"),
  ESP: makeTeam("ESP", "Spain", "es"),
  AUT: makeTeam("AUT", "Austria", "at"),
  SUI: makeTeam("SUI", "Switzerland", "ch"),
  ALG: makeTeam("ALG", "Algeria", "dz"),
  ARG: makeTeam("ARG", "Argentina", "ar"),
  CPV: makeTeam("CPV", "Cabo Verde", "cv"),
  COL: makeTeam("COL", "Colombia", "co"),
  GHA: makeTeam("GHA", "Ghana", "gh"),
  AUS: makeTeam("AUS", "Australia", "au"),
  EGY: makeTeam("EGY", "Egypt", "eg"),
};

const match = (
  number: number,
  date: string,
  venue: string,
  first: Team | null,
  second: Team | null,
  scores: [number | null, number | null],
  winner?: string,
  note?: string,
  status: Match["status"] = "Final",
  kickoff?: string,
): Match => ({ id: `m${number}`, number, date, kickoff, venue, status, teams: [first, second], scores, winner, note });

const roundOf32: Match[] = [
  match(74, "29 Jun", "Boston", teams.GER, teams.PAR, [1, 1], "PAR", "PSO 3–4"),
  match(77, "30 Jun", "New York/NJ", teams.FRA, teams.SWE, [3, 0], "FRA"),
  match(73, "28 Jun", "Los Angeles", teams.RSA, teams.CAN, [0, 1], "CAN"),
  match(75, "29 Jun", "Monterrey", teams.NED, teams.MAR, [1, 1], "MAR", "PSO 2–3"),
  match(83, "2 Jul", "Toronto", teams.POR, teams.CRO, [2, 1], "POR"),
  match(84, "2 Jul", "Los Angeles", teams.ESP, teams.AUT, [3, 0], "ESP"),
  match(81, "1 Jul", "San Francisco", teams.USA, teams.BIH, [2, 0], "USA"),
  match(82, "1 Jul", "Seattle", teams.BEL, teams.SEN, [3, 2], "BEL", "AET"),
  match(76, "29 Jun", "Houston", teams.BRA, teams.JPN, [2, 1], "BRA"),
  match(78, "30 Jun", "Dallas", teams.CIV, teams.NOR, [1, 2], "NOR"),
  match(79, "30 Jun", "Mexico City", teams.MEX, teams.ECU, [2, 0], "MEX"),
  match(80, "1 Jul", "Atlanta", teams.ENG, teams.COD, [2, 1], "ENG"),
  match(86, "3 Jul", "Miami", teams.ARG, teams.CPV, [3, 2], "ARG", "AET"),
  match(88, "3 Jul", "Dallas", teams.AUS, teams.EGY, [1, 1], "EGY", "PSO 2–4"),
  match(85, "2 Jul", "Vancouver", teams.SUI, teams.ALG, [2, 0], "SUI"),
  match(87, "3 Jul", "Kansas City", teams.COL, teams.GHA, [1, 0], "COL"),
];

const roundOf16: Match[] = [
  match(89, "4 Jul", "Philadelphia", teams.PAR, teams.FRA, [0, 1], "FRA"),
  match(90, "4 Jul", "Houston", teams.CAN, teams.MAR, [0, 3], "MAR"),
  match(93, "6 Jul", "Dallas", teams.POR, teams.ESP, [0, 1], "ESP"),
  match(94, "6 Jul", "Seattle", teams.USA, teams.BEL, [1, 4], "BEL"),
  match(91, "5 Jul", "New York/NJ", teams.BRA, teams.NOR, [1, 2], "NOR"),
  match(92, "5 Jul", "Mexico City", teams.MEX, teams.ENG, [2, 3], "ENG"),
  match(95, "7 Jul", "Atlanta", teams.ARG, teams.EGY, [3, 2], "ARG"),
  match(96, "7 Jul", "Vancouver", teams.SUI, teams.COL, [0, 0], "SUI", "PSO 4–3"),
];

const quarterFinals: Match[] = [
  match(97, "9 Jul", "Boston", teams.FRA, teams.MAR, [2, 0], "FRA"),
  match(98, "10 Jul", "Los Angeles", teams.ESP, teams.BEL, [2, 1], "ESP"),
  match(99, "11 Jul", "Miami", teams.NOR, teams.ENG, [1, 2], "ENG", "AET"),
  match(100, "11 Jul", "Kansas City", teams.ARG, teams.SUI, [3, 1], "ARG", "AET"),
];

const semiFinals: Match[] = [
  match(101, "14 Jul", "Dallas", teams.FRA, teams.ESP, [0, 2], "ESP", undefined, "Final", "2026-07-14T19:00:00Z"),
  match(102, "15 Jul · 12:00 PT", "Atlanta", teams.ENG, teams.ARG, [null, null], undefined, undefined, "Upcoming", "2026-07-15T19:00:00Z"),
];

const finalMatch = match(104, "19 Jul · 12:00 PT", "New York/NJ", teams.ESP, null, [null, null], undefined, undefined, "Upcoming", "2026-07-19T19:00:00Z");
const WORLD_CUP_26_EMBLEM = "https://digitalhub.fifa.com/transform/72a8ea8e-9019-49a4-8e79-8b2488cd9972/WC26_logo_brand_identity_black-bg?io=transform%3Afill%2Caspectratio%3A1x1%2Cwidth%3A300&quality=100";
const stadiums: Record<string, Stadium> = {
  Atlanta: { name: "Mercedes-Benz Stadium", photo: "/stadiums/atlanta.jpg" },
  Boston: { name: "Gillette Stadium", photo: "/stadiums/boston.jpg" },
  Dallas: { name: "AT&T Stadium", photo: "/stadiums/dallas.jpg" },
  Houston: { name: "NRG Stadium", photo: "/stadiums/houston.jpg" },
  "Kansas City": { name: "Arrowhead Stadium", photo: "/stadiums/kansas-city.jpg" },
  "Los Angeles": { name: "SoFi Stadium", photo: "/stadiums/los-angeles.jpg" },
  Miami: { name: "Hard Rock Stadium", photo: "/stadiums/miami.jpg" },
  "Mexico City": { name: "Estadio Azteca", photo: "/stadiums/mexico-city.jpg" },
  Monterrey: { name: "Estadio BBVA", photo: "/stadiums/monterrey.jpg" },
  "New York/NJ": { name: "MetLife Stadium", photo: "/stadiums/new-york-nj.jpg" },
  Philadelphia: { name: "Lincoln Financial Field", photo: "/stadiums/philadelphia.jpg" },
  "San Francisco": { name: "Levi’s Stadium", photo: "/stadiums/san-francisco.jpg" },
  Seattle: { name: "Lumen Field", photo: "/stadiums/seattle.jpg" },
  Toronto: { name: "BMO Field", photo: "/stadiums/toronto.jpg" },
  Vancouver: { name: "BC Place", photo: "/stadiums/vancouver.jpg" },
};
// Keep every match subtree contiguous while placing France upper-left and
// Norway upper-right. This avoids crossings when the radial order changes.
const ROUND32_LAYOUT_IDS = [
  "m83", "m84", "m81", "m82",
  "m74", "m77", "m73", "m75",
  "m76", "m78", "m79", "m80",
  "m86", "m88", "m85", "m87",
];
const ROUND16_LAYOUT_IDS = ["m93", "m94", "m89", "m90", "m91", "m92", "m95", "m96"];
const QUARTER_LAYOUT_IDS = ["m98", "m97", "m99", "m100"];
const FALLBACK_MATCHES = [...roundOf32, ...roundOf16, ...quarterFinals, ...semiFinals, finalMatch];

type LiveTeamRecord = { code: string; name: string; score: number | null };
type LiveMatchRecord = {
  away: LiveTeamRecord | null;
  awayPenaltyScore: number | null;
  home: LiveTeamRecord | null;
  homePenaltyScore: number | null;
  kickoff: string | null;
  matchTime: string | null;
  number: number;
  resultType: number;
  status: Match["status"];
  venue: string | null;
  winnerCode: string | null;
};
type LiveFeed = { matches: LiveMatchRecord[]; source: string; updatedAt: string };

const dateParts = (date: Date, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", options).format(date);
const formatMatchDate = (kickoff: string, status: Match["status"]) => {
  const date = new Date(kickoff);
  const day = dateParts(date, { day: "numeric", month: "short", timeZone: "America/Los_Angeles" });
  if (status === "Final") return day;
  const time = dateParts(date, { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Los_Angeles" });
  return `${day} · ${time} PT`;
};
const liveTeam = (record: LiveTeamRecord | null, fallback: Team | null) => {
  if (!record) return fallback;
  return teams[record.code] ?? makeTeam(record.code, record.name, record.code.toLowerCase());
};
const mergeLiveMatch = (fallback: Match, live?: LiveMatchRecord): Match => {
  if (!live) return fallback;
  const first = liveTeam(live.home, fallback.teams[0]);
  const second = liveTeam(live.away, fallback.teams[1]);
  const penaltyNote = live.homePenaltyScore !== null && live.awayPenaltyScore !== null
    ? `PSO ${live.homePenaltyScore}–${live.awayPenaltyScore}`
    : live.resultType === 3
      ? "AET"
      : undefined;
  return {
    ...fallback,
    date: live.kickoff ? formatMatchDate(live.kickoff, live.status) : fallback.date,
    kickoff: live.kickoff ?? fallback.kickoff,
    matchTime: live.matchTime,
    note: penaltyNote,
    scores: [live.home?.score ?? null, live.away?.score ?? null],
    status: live.status,
    teams: [first, second],
    winner: live.winnerCode ?? undefined,
  };
};

function useLiveFeed() {
  const [feed, setFeed] = React.useState<LiveFeed | null>(null);

  React.useEffect(() => {
    let disposed = false;
    let controller: AbortController | null = null;
    const refresh = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch("/api/world-cup", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(`Live feed returned ${response.status}`);
        const nextFeed = await response.json() as LiveFeed;
        if (!disposed && nextFeed.matches.length > 0) setFeed(nextFeed);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    };

    void refresh();
    const interval = window.setInterval(refresh, 30_000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      disposed = true;
      controller?.abort();
      window.clearInterval(interval);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  return feed;
}
const CANVAS_SIZE = 1400;
const CENTER = CANVAS_SIZE / 2;
const TROPHY_NODE_SIZE = 192;
const FIT_VIEW_PADDING = 0.065;

type TeamNode = Node<{
  team: Team;
  selectedTeam: string | null;
  onSelect: (code: string) => void;
  sourcePosition: Position;
  targetPosition: Position;
  tooltipPlacement: "above" | "below";
  outer: boolean;
  eliminated: boolean;
  match?: Match;
}, "team">;

type PendingNode = Node<{
  sourcePosition: Position;
  targetPosition: Position;
  tooltipPlacement: "above" | "below";
  match: Match;
}, "pending">;

type TrophyNode = Node<{ kind: "trophy" }, "trophy">;

type CircleGeometry = {
  x: number;
  y: number;
  radius: number;
};

type TreeEdgeData = Record<string, unknown> & {
  sourceCircle: CircleGeometry;
  targetCircle: CircleGeometry;
};

const TooltipInteractionContext = React.createContext<{
  activeId: string | null;
  showOnTouch: (id: string) => void;
}>({ activeId: null, showOnTouch: () => undefined });

function MatchTooltip({
  match: item,
  id,
  placement = "above",
  open = false,
}: {
  match: Match;
  id: string;
  placement?: "above" | "below";
  open?: boolean;
}) {
  const { zoom } = useViewport();
  const [first, second] = item.teams;
  const hasScore = item.scores.every((score) => score !== null);
  const stadium = stadiums[item.venue];
  const score = hasScore ? `${item.scores[0]}–${item.scores[1]}` : "vs";
  const inverseZoom = Math.min(2.75, Math.max(0.75, 1 / zoom));
  const penaltyScore = item.note?.match(/^PSO (\d+)–(\d+)$/);
  const winner = item.winner ? teams[item.winner] : undefined;
  const winnerIndex = item.teams.findIndex((team) => team?.code === item.winner);
  const outcome = penaltyScore && winner && winnerIndex >= 0
    ? `${winner.name} won ${penaltyScore[winnerIndex + 1]}–${penaltyScore[winnerIndex === 0 ? 2 : 1]} on penalties`
    : item.note === "AET" && winner
      ? `${winner.name} won after extra time`
      : undefined;
  return (
    <div
      id={id}
      role="tooltip"
      className={cn(
        "pointer-events-none absolute left-1/2 z-50 w-72 overflow-hidden rounded-lg border border-white/10 bg-card text-card-foreground opacity-0 shadow-2xl transition-none group-hover/node:opacity-100 group-hover/node:transition-opacity group-hover/node:delay-500 group-hover/node:duration-150",
        open && "opacity-100 transition-opacity duration-150",
        placement === "above" ? "bottom-full mb-3" : "top-full mt-3",
      )}
      style={{
        transform: `translateX(-50%) scale(${inverseZoom})`,
        transformOrigin: placement === "above" ? "bottom center" : "top center",
        opacity: open ? 1 : undefined,
      }}
    >
      <div className="relative h-28 overflow-hidden bg-muted">
        <img src={stadium.photo} alt="" loading="lazy" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/85" aria-hidden="true" />
        <p className="absolute right-3 top-3 max-w-52 truncate rounded bg-black/65 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          {stadium.name}
        </p>
        <img
          src={WORLD_CUP_26_EMBLEM}
          alt=""
          className="absolute bottom-3 left-1/2 size-11 -translate-x-1/2 rounded-[3px] object-cover shadow-lg"
        />
      </div>
      <div className="px-4 pb-4 pt-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
          <div className="min-w-0 text-center">
            {first ? (
              <img src={first.flag} alt="" className="mx-auto size-11 rounded-full border-2 border-card bg-muted object-cover shadow-md" />
            ) : (
              <span className="mx-auto block size-11 rounded-full border-2 border-dashed border-muted-foreground/40 bg-muted" />
            )}
            <p className="mt-2 truncate text-xs font-semibold">{first?.name ?? "To be decided"}</p>
          </div>
          <p className="pt-3 text-lg font-bold tabular-nums text-primary">{score}</p>
          <div className="min-w-0 text-center">
            {second ? (
              <img src={second.flag} alt="" className="mx-auto size-11 rounded-full border-2 border-card bg-muted object-cover shadow-md" />
            ) : (
              <span className="mx-auto block size-11 rounded-full border-2 border-dashed border-muted-foreground/40 bg-muted" />
            )}
            <p className="mt-2 truncate text-xs font-semibold">{second?.name ?? "To be decided"}</p>
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          {outcome ? item.date : `${item.date} · ${item.status}`}
        </p>
        {outcome && <p className="mt-1 text-center text-xs font-semibold text-card-foreground">{outcome}</p>}
      </div>
    </div>
  );
}

function TeamFlowNode({ id, data }: NodeProps<TeamNode>) {
  const tooltipInteraction = React.useContext(TooltipInteractionContext);
  const selected = data.team.code === data.selectedTeam;
  const muted = data.eliminated && !selected;
  const size = data.outer ? 56 : 44;
  return (
    <div
      className="group/node relative"
      data-touch-tooltip-open={tooltipInteraction.activeId === id ? "true" : undefined}
      style={{ width: size, height: size }}
    >
      <Handle type="target" position={data.targetPosition} className="pointer-events-none opacity-0" />
      <button
        type="button"
        className={cn(
          "group relative block size-full overflow-hidden rounded-full border-2 border-border bg-card transition-[border-color,box-shadow,filter,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "hover:-translate-y-0.5 hover:border-muted-foreground hover:brightness-110",
          muted && "border-border grayscale opacity-45 hover:grayscale-0 hover:opacity-80",
          selected && "border-primary [box-shadow:var(--shadow-primary)]",
        )}
        onClick={() => data.onSelect(data.team.code)}
        onPointerUp={(event) => {
          if (event.pointerType !== "mouse" && data.match) tooltipInteraction.showOnTouch(id);
        }}
        aria-label={`Trace ${data.team.name}${data.eliminated ? ", eliminated" : ""}`}
        aria-describedby={data.match ? `match-${id}` : undefined}
        aria-pressed={selected}
      >
        <img
          src={data.team.flag}
          alt=""
          className={cn("size-full", data.team.flagFit === "fill" ? "object-fill" : "object-cover")}
          loading="lazy"
        />
      </button>
      {data.outer && (
        <span className={cn(
          "pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 text-[11px] font-semibold text-muted-foreground",
          muted && "opacity-45",
          selected && "text-primary",
        )}>
          {data.team.code}
        </span>
      )}
      {data.match && (
        <MatchTooltip
          match={data.match}
          id={`match-${id}`}
          placement={data.tooltipPlacement}
          open={tooltipInteraction.activeId === id}
        />
      )}
      <Handle type="source" position={data.sourcePosition} className="pointer-events-none opacity-0" />
    </div>
  );
}

function PendingFlowNode({ id, data }: NodeProps<PendingNode>) {
  const tooltipInteraction = React.useContext(TooltipInteractionContext);
  return (
    <div
      className="group/node relative flex size-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      data-touch-tooltip-open={tooltipInteraction.activeId === id ? "true" : undefined}
      tabIndex={0}
      onPointerUp={(event) => {
        if (event.pointerType !== "mouse") tooltipInteraction.showOnTouch(id);
      }}
      aria-label={`${data.match.teams[0]?.name} versus ${data.match.teams[1]?.name}, ${data.match.status}`}
      aria-describedby={`match-${data.match.id}`}
    >
      <Handle type="target" position={data.targetPosition} className="pointer-events-none opacity-0" />
      <span className="size-1.5 rounded-full bg-muted-foreground/40" aria-hidden="true" />
      <MatchTooltip
        match={data.match}
        id={`match-${data.match.id}`}
        placement={data.tooltipPlacement}
        open={tooltipInteraction.activeId === id}
      />
      <Handle type="source" position={data.sourcePosition} className="pointer-events-none opacity-0" />
    </div>
  );
}

function TrophyFlowNode() {
  const { zoom } = useViewport();
  const [showHint, setShowHint] = React.useState(true);
  const [canRotate, setCanRotate] = React.useState(false);
  const hintInverseZoom = Math.min(2.75, Math.max(0.75, 1 / zoom));
  return (
    <div className="relative flex size-48 items-center justify-center">
      <Handle id="left" type="target" position={Position.Left} className="pointer-events-none opacity-0" />
      <Handle id="right" type="target" position={Position.Right} className="pointer-events-none opacity-0" />
      <div className="relative size-44">
        <WorldCupTrophyThree className="size-full" onInteract={() => setShowHint(false)} onInteractiveChange={setCanRotate} />
        {showHint && canRotate && (
          <p
            className="pointer-events-none absolute left-1/2 top-full mt-2 flex items-center gap-1 whitespace-nowrap font-[family-name:var(--font-caveat)] text-[9px] font-medium leading-none text-muted-foreground"
            style={{
              transform: `translateX(-50%) scale(${hintInverseZoom})`,
              transformOrigin: "top center",
            }}
          >
            <HandIcon className="size-2 shrink-0" aria-hidden="true" />
            Rotate trophy
          </p>
        )}
      </div>
    </div>
  );
}

function pointInsideCircle(circle: CircleGeometry, toward: { x: number; y: number }) {
  const dx = toward.x - circle.x;
  const dy = toward.y - circle.y;
  const length = Math.hypot(dx, dy) || 1;
  const distance = circle.radius - 2;
  return {
    x: circle.x + (dx / length) * distance,
    y: circle.y + (dy / length) * distance,
  };
}

function RadialTreeEdge({ id, data, style, markerEnd }: EdgeProps<Edge<TreeEdgeData>>) {
  const sourceCircle = data!.sourceCircle;
  const targetCircle = data!.targetCircle;
  const sourceAngle = Math.atan2(sourceCircle.y - CENTER, sourceCircle.x - CENTER);
  const sourceRadius = Math.hypot(sourceCircle.x - CENTER, sourceCircle.y - CENTER);
  const targetRadius = Math.hypot(targetCircle.x - CENTER, targetCircle.y - CENTER);
  const bendRadius = (sourceRadius + targetRadius) / 2;
  const bendX = CENTER + Math.cos(sourceAngle) * bendRadius;
  const bendY = CENTER + Math.sin(sourceAngle) * bendRadius;
  const bend = { x: bendX, y: bendY };
  // Intersect each segment with the actual circle instead of React Flow's
  // cardinal handle. The final 2px sit beneath the node border for a clean join.
  const connectedSource = pointInsideCircle(sourceCircle, bend);
  const connectedTarget = pointInsideCircle(targetCircle, bend);
  const path = `M ${connectedSource.x},${connectedSource.y} L ${bendX},${bendY} L ${connectedTarget.x},${connectedTarget.y}`;
  return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
}

const nodeTypes = { team: TeamFlowNode, pending: PendingFlowNode, trophy: TrophyFlowNode };
const edgeTypes = { radial: RadialTreeEdge };

function sideForAngle(angle: number): Position {
  const x = Math.cos(angle);
  const y = Math.sin(angle);
  if (Math.abs(x) >= Math.abs(y)) return x >= 0 ? Position.Right : Position.Left;
  return y >= 0 ? Position.Bottom : Position.Top;
}

function opposite(position: Position): Position {
  if (position === Position.Left) return Position.Right;
  if (position === Position.Right) return Position.Left;
  if (position === Position.Top) return Position.Bottom;
  return Position.Top;
}

function teamNode(
  id: string,
  team: Team,
  radius: number,
  angleDegrees: number,
  selectedTeam: string | null,
  onSelect: (code: string) => void,
  outer = false,
  eliminated = false,
  match?: Match,
): TeamNode {
  const angle = angleDegrees * Math.PI / 180;
  const targetPosition = sideForAngle(angle);
  const size = outer ? 56 : 44;
  return {
    id,
    type: "team",
    position: {
      x: CENTER + Math.cos(angle) * radius - size / 2,
      y: CENTER + Math.sin(angle) * radius - size / 2,
    },
    data: {
      team,
      selectedTeam,
      onSelect,
      targetPosition,
      sourcePosition: opposite(targetPosition),
      tooltipPlacement: Math.sin(angle) < 0 ? "below" : "above",
      outer,
      eliminated,
      match,
    },
    draggable: false,
    selectable: false,
  };
}

function circleForNode(node: TeamNode | PendingNode | TrophyNode): CircleGeometry {
  if (node.type === "pending") {
    return { x: node.position.x + 22, y: node.position.y + 22, radius: 3 };
  }
  const diameter = node.type === "team" ? (node.data.outer ? 56 : 44) : TROPHY_NODE_SIZE;
  return {
    x: node.position.x + diameter / 2,
    y: node.position.y + diameter / 2,
    radius: diameter / 2,
  };
}

const progression: Array<[string, string]> = [
  ["m74", "m89"], ["m77", "m89"], ["m73", "m90"], ["m75", "m90"],
  ["m83", "m93"], ["m84", "m93"], ["m81", "m94"], ["m82", "m94"],
  ["m76", "m91"], ["m78", "m91"], ["m79", "m92"], ["m80", "m92"],
  ["m86", "m95"], ["m88", "m95"], ["m85", "m96"], ["m87", "m96"],
  ["m89", "m97"], ["m90", "m97"], ["m93", "m98"], ["m94", "m98"],
  ["m91", "m99"], ["m92", "m99"], ["m95", "m100"], ["m96", "m100"],
  ["m97", "m101"], ["m98", "m101"], ["m99", "m102"], ["m100", "m102"],
  ["m101", "m104"], ["m102", "m104"],
];

function makeTreeEdge(
  source: string,
  target: string,
  sourceTeam: Team | undefined,
  targetTeam: Team | undefined,
  selectedTeam: string | null,
  activeCodes: string[] = [],
  targetHandle?: string,
): Edge {
  const active = selectedTeam !== null && (sourceTeam?.code === selectedTeam || activeCodes.includes(selectedTeam));
  const completed = Boolean(sourceTeam && targetTeam && sourceTeam.code === targetTeam.code);

  return {
    id: `${source}-${target}`,
    source,
    target,
    targetHandle,
    type: "radial",
    className: active ? "bracket-edge-active" : undefined,
    focusable: false,
    selectable: false,
    style: {
      stroke: active
        ? "var(--primary)"
        : completed
          ? "color-mix(in oklab, var(--muted-foreground) 78%, var(--background))"
          : "color-mix(in oklab, var(--muted-foreground) 52%, var(--background))",
      strokeWidth: active ? 2.5 : completed ? 1.6 : 1.2,
      strokeDasharray: active || completed ? undefined : "2 6",
      strokeLinecap: "round",
      opacity: 1,
    },
  };
}

function RadialBracket({
  matches,
  selectedTeam,
  onSelect,
  onClear,
}: {
  matches: Match[];
  selectedTeam: string | null;
  onSelect: (code: string) => void;
  onClear: () => void;
}) {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const flowRef = React.useRef<ReactFlowInstance<TeamNode | PendingNode | TrophyNode, Edge<TreeEdgeData>> | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [touchTooltipId, setTouchTooltipId] = React.useState<string | null>(null);
  const matchById = React.useMemo(() => new Map(matches.map((item) => [item.id, item])), [matches]);
  const matchesForLayout = React.useCallback((ids: string[]) => ids.map((id) => matchById.get(id)!), [matchById]);
  const currentRoundOf32 = React.useMemo(() => matches.filter((item) => item.number >= 73 && item.number <= 88), [matches]);
  const round32Layout = React.useMemo(() => matchesForLayout(ROUND32_LAYOUT_IDS), [matchesForLayout]);
  const round16Layout = React.useMemo(() => matchesForLayout(ROUND16_LAYOUT_IDS), [matchesForLayout]);
  const quarterLayout = React.useMemo(() => matchesForLayout(QUARTER_LAYOUT_IDS), [matchesForLayout]);
  const currentSemiFinals = React.useMemo(() => [matchById.get("m101")!, matchById.get("m102")!], [matchById]);

  React.useEffect(() => {
    if (!isFullscreen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isFullscreen]);

  React.useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const fit = () => flowRef.current?.fitView({ padding: FIT_VIEW_PADDING, minZoom: 0.1, maxZoom: 1 });
    const observer = new ResizeObserver(() => requestAnimationFrame(fit));
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const nodes = React.useMemo<Array<TeamNode | PendingNode | TrophyNode>>(() => {
    const outerNodes = round32Layout.flatMap((item, matchIndex) => item.teams.map((team, teamIndex) => {
      if (!team) throw new Error(`Missing team in match ${item.number}`);
      const leafIndex = matchIndex * 2 + teamIndex;
      return teamNode(
        `leaf-${item.id}-${team.code}`,
        team,
        625,
        95.625 + leafIndex * 11.25,
        selectedTeam,
        onSelect,
        true,
        item.winner !== team.code,
      );
    }));
    const round32Winners = round32Layout.map((item, index) => teamNode(
      `win-${item.id}`,
      teams[item.winner!],
      490,
      101.25 + index * 22.5,
      selectedTeam,
      onSelect,
      false,
      round16Layout[Math.floor(index / 2)].winner !== item.winner,
      item,
    ));
    const round16Winners = round16Layout.map((item, index) => teamNode(
      `win-${item.id}`,
      teams[item.winner!],
      355,
      112.5 + index * 45,
      selectedTeam,
      onSelect,
      false,
      quarterLayout[Math.floor(index / 2)].winner !== item.winner,
      item,
    ));
    const quarterWinners = quarterLayout.map((item, index) => teamNode(`win-${item.id}`, teams[item.winner!], 225, 135 + index * 90, selectedTeam, onSelect, false, false, item));
    const semiFinalNodes = currentSemiFinals.map((item): PendingNode | TeamNode => {
      const angle = item.id === "m101" ? Math.PI : 0;
      if (item.winner && teams[item.winner]) {
        return teamNode(
          `pending-${item.id}`,
          teams[item.winner],
          115,
          angle * 180 / Math.PI,
          selectedTeam,
          onSelect,
          false,
          false,
          item,
        );
      }
      const targetPosition = sideForAngle(angle);
      return {
        id: `pending-${item.id}`,
        type: "pending",
        position: { x: CENTER + Math.cos(angle) * 115 - 22, y: CENTER + Math.sin(angle) * 115 - 22 },
        data: {
          targetPosition,
          sourcePosition: opposite(targetPosition),
          tooltipPlacement: Math.sin(angle) < 0 ? "below" : "above",
          match: item,
        },
        draggable: false,
        selectable: false,
      };
    });
    const trophy: TrophyNode = {
      id: "trophy",
      type: "trophy",
      position: { x: CENTER - TROPHY_NODE_SIZE / 2, y: CENTER - TROPHY_NODE_SIZE / 2 },
      data: { kind: "trophy" },
      draggable: false,
      selectable: false,
    };
    return [...outerNodes, ...round32Winners, ...round16Winners, ...quarterWinners, ...semiFinalNodes, trophy];
  }, [currentSemiFinals, onSelect, quarterLayout, round16Layout, round32Layout, selectedTeam]);

  const edges = React.useMemo<Edge<TreeEdgeData>[]>(() => {
    const winnerByMatch = new Map(matches.filter((item) => item.winner).map((item) => [item.id, teams[item.winner!]]));
    const result: Edge[] = [];
    currentRoundOf32.forEach((item) => item.teams.forEach((team) => {
      if (!team) return;
      result.push(makeTreeEdge(`leaf-${item.id}-${team.code}`, `win-${item.id}`, team, winnerByMatch.get(item.id), selectedTeam));
    }));
    progression.slice(0, 24).forEach(([source, target]) => {
      result.push(makeTreeEdge(`win-${source}`, `win-${target}`, winnerByMatch.get(source), winnerByMatch.get(target), selectedTeam));
    });
    progression.slice(24, 28).forEach(([source, target]) => {
      result.push(makeTreeEdge(`win-${source}`, `pending-${target}`, winnerByMatch.get(source), winnerByMatch.get(target), selectedTeam));
    });
    result.push(makeTreeEdge("pending-m101", "trophy", winnerByMatch.get("m101"), undefined, selectedTeam, currentSemiFinals[0].teams.flatMap((team) => team?.code ?? []), "left"));
    result.push(makeTreeEdge("pending-m102", "trophy", winnerByMatch.get("m102"), undefined, selectedTeam, currentSemiFinals[1].teams.flatMap((team) => team?.code ?? []), "right"));
    const circles = new Map(nodes.map((node) => [node.id, circleForNode(node)]));
    return result.map((edge) => ({
      ...edge,
      data: {
        sourceCircle: circles.get(edge.source)!,
        targetCircle: circles.get(edge.target)!,
      },
    }));
  }, [currentRoundOf32, currentSemiFinals, matches, nodes, selectedTeam]);

  const clearCanvasState = React.useCallback(() => {
    setTouchTooltipId(null);
    onClear();
  }, [onClear]);

  return (
    <TooltipInteractionContext.Provider value={{ activeId: touchTooltipId, showOnTouch: setTouchTooltipId }}>
      <div
        ref={frameRef}
        role="region"
        data-fullscreen={isFullscreen ? "true" : undefined}
        className={cn(
          "radial-scroll size-full overflow-hidden bg-background",
          isFullscreen && "fixed inset-y-0 left-0 z-50 !h-dvh !w-screen",
        )}
        aria-label="Complete World Cup knockout bracket. Click empty canvas to clear the selected route."
      >
      <div className="relative size-full">
        <ReactFlow
          className="relative z-10"
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: FIT_VIEW_PADDING, minZoom: 0.1, maxZoom: 1 }}
          onInit={(instance) => {
            flowRef.current = instance;
            requestAnimationFrame(() => instance.fitView({ padding: FIT_VIEW_PADDING, minZoom: 0.1, maxZoom: 1 }));
          }}
          panOnDrag
          panOnScroll={false}
          zoomOnScroll
          zoomOnPinch
          zoomOnDoubleClick
          preventScrolling
          minZoom={0.1}
          maxZoom={2}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          onNodeClick={(_, node) => {
            if (node.type === "trophy") setTouchTooltipId(null);
          }}
          onPaneClick={clearCanvasState}
          proOptions={{ hideAttribution: true }}
        />
        <div className="absolute bottom-3 right-3 z-20 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="size-11 p-0"
            onClick={() => {
              setTouchTooltipId(null);
              setIsFullscreen((value) => !value);
            }}
            aria-label={isFullscreen ? "Exit graph fullscreen" : "View graph fullscreen"}
            aria-pressed={isFullscreen}
          >
            {isFullscreen ? (
              <CloseIcon className="relative z-10 size-5" aria-hidden="true" />
            ) : (
              <ExpandIcon className="relative z-10 size-5" aria-hidden="true" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="size-11 p-0"
            onClick={() => {
              setTouchTooltipId(null);
              flowRef.current?.zoomIn({ duration: 180 });
            }}
            aria-label="Zoom in"
          >
            <PlusIcon className="relative z-10 size-5" aria-hidden="true" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="size-11 p-0"
            onClick={() => {
              setTouchTooltipId(null);
              flowRef.current?.zoomOut({ duration: 180 });
            }}
            aria-label="Zoom out"
          >
            <MinusIcon className="relative z-10 size-5" aria-hidden="true" />
          </Button>
        </div>
        <a
          href="https://sketchfab.com/3d-models/world-cup-trophy-c4ae2dd470194a81b856ad84620d8beb"
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 left-3 z-20 text-[10px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Trophy by waimus · CC BY-SA
        </a>
      </div>
      </div>
    </TooltipInteractionContext.Provider>
  );
}

export default function Page() {
  const [selectedTeam, setSelectedTeam] = React.useState<string | null>(null);
  const liveFeed = useLiveFeed();
  const matches = React.useMemo(() => {
    const liveByNumber = new Map(liveFeed?.matches.map((item) => [item.number, item]) ?? []);
    return FALLBACK_MATCHES.map((item) => mergeLiveMatch(item, liveByNumber.get(item.number)));
  }, [liveFeed]);
  const featuredMatch = React.useMemo(() => {
    const candidates = matches.filter((item) => item.number >= 101);
    const today = new Intl.DateTimeFormat("en-CA", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date());
    const dateKey = (item: Match) => item.kickoff
      ? new Intl.DateTimeFormat("en-CA", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(item.kickoff))
      : "";
    return candidates.find((item) => item.status === "Live")
      ?? candidates.find((item) => dateKey(item) === today)
      ?? candidates
        .filter((item) => item.status === "Upcoming" && item.kickoff)
        .sort((a, b) => new Date(a.kickoff!).getTime() - new Date(b.kickoff!).getTime())[0]
      ?? candidates[candidates.length - 1];
  }, [matches]);
  const featuredTime = featuredMatch.kickoff
    ? dateParts(new Date(featuredMatch.kickoff), { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Los_Angeles" })
    : "";
  const featuredIsToday = featuredMatch.kickoff
    ? new Date(featuredMatch.kickoff).toDateString() === new Date().toDateString()
    : false;
  const featuredDay = featuredMatch.kickoff
    ? dateParts(new Date(featuredMatch.kickoff), { day: "numeric", month: "short", timeZone: "America/Los_Angeles" }).toUpperCase()
    : "NEXT";
  const featuredTeams = `${featuredMatch.teams[0]?.code ?? "TBD"}   VS   ${featuredMatch.teams[1]?.code ?? "TBD"}`;
  const featuredTiming = featuredMatch.status === "Live"
    ? `LIVE ${featuredMatch.matchTime ?? ""}`.trim()
    : featuredIsToday
      ? `TODAY ${featuredTime} PT`
      : `${featuredDay} ${featuredTime.replace(":00", "")} PT`;
  const featuredWhen = featuredMatch.status === "Live"
    ? "live"
    : `${featuredIsToday ? "today" : featuredDay} at ${featuredTime} Pacific Time`;
  const featuredLabel = `${featuredMatch.teams[0]?.name ?? "To be decided"} versus ${featuredMatch.teams[1]?.name ?? "To be decided"}, ${featuredWhen} in ${featuredMatch.venue}`;

  return (
    <main className="isolate flex h-svh flex-col overflow-hidden bg-background" data-live-source={liveFeed?.source}>
      <header className="relative z-30 shrink-0 border-b border-border bg-background">
        <div className="mx-auto flex max-w-[1540px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src={WORLD_CUP_26_EMBLEM}
              alt=""
              className="size-9 rounded-[3px] border border-border bg-black object-cover shadow-md"
            />
            <p className="text-sm font-semibold">FIFA World Cup 26</p>
          </div>
          <Button variant="primary" size="sm" asChild>
            <a href="https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/knockout-stage-match-schedule-bracket" target="_blank" rel="noreferrer">Match centre</a>
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <section className="relative z-20 grid shrink-0 gap-8 border-b border-border bg-background px-4 pb-10 sm:px-0 lg:grid-cols-[1fr_420px] lg:items-center">
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-balance sm:text-6xl">Road to the final</h1>
          <div className="flex justify-start lg:justify-end" role="img" aria-label={featuredLabel}>
            <div className="sm:hidden" aria-hidden="true">
              <FlipBoard rows={[featuredTeams, featuredTiming]} columns={14} tileSize={16} gap={2} className="p-2" />
            </div>
            <div className="hidden sm:block" aria-hidden="true">
              <FlipBoard rows={[featuredTeams, featuredTiming]} columns={14} tileSize={25} gap={3} className="p-3" />
            </div>
          </div>
        </section>

        <section className="relative min-h-0 flex-1 overflow-hidden bg-background pt-6 sm:pt-8">
          <RadialBracket matches={matches} selectedTeam={selectedTeam} onSelect={setSelectedTeam} onClear={() => setSelectedTeam(null)} />
        </section>
      </div>
    </main>
  );
}
