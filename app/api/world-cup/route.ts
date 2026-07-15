import { NextResponse } from "next/server";

const FIFA_MATCH_FEED = "https://api.fifa.com/api/v3/calendar/matches?language=en&count=500&IdCompetition=17&IdSeason=285023";
const KNOCKOUT_MATCH_NUMBERS = new Set([
  73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88,
  89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 104,
]);

type LocalizedValue = { Description?: string };
type FifaTeam = {
  Abbreviation?: string;
  IdTeam?: string;
  Score?: number | null;
  TeamName?: LocalizedValue[];
};
type FifaMatch = {
  Away?: FifaTeam;
  AwayTeamPenaltyScore?: number | null;
  Date?: string;
  Home?: FifaTeam;
  HomeTeamPenaltyScore?: number | null;
  MatchNumber?: number;
  MatchStatus?: number;
  MatchTime?: string | null;
  ResultType?: number;
  Stadium?: { CityName?: LocalizedValue[] };
  Winner?: string | null;
};

const team = (value?: FifaTeam) => value?.Abbreviation
  ? {
      code: value.Abbreviation,
      id: value.IdTeam ?? null,
      name: value.TeamName?.[0]?.Description ?? value.Abbreviation,
      score: value.Score ?? null,
    }
  : null;

export async function GET() {
  try {
    const response = await fetch(FIFA_MATCH_FEED, {
      headers: { Accept: "application/json" },
      next: { revalidate: 20 },
    });
    if (!response.ok) throw new Error(`FIFA feed returned ${response.status}`);

    const payload = await response.json() as { Results?: FifaMatch[] };
    const matches = (payload.Results ?? [])
      .filter((item) => item.MatchNumber && KNOCKOUT_MATCH_NUMBERS.has(item.MatchNumber))
      .map((item) => {
        const home = team(item.Home);
        const away = team(item.Away);
        const winnerCode = home && item.Winner === home.id
          ? home.code
          : away && item.Winner === away.id
            ? away.code
            : null;
        return {
          away,
          awayPenaltyScore: item.AwayTeamPenaltyScore ?? null,
          home,
          homePenaltyScore: item.HomeTeamPenaltyScore ?? null,
          kickoff: item.Date ?? null,
          matchTime: item.MatchTime ?? null,
          number: item.MatchNumber,
          resultType: item.ResultType ?? 0,
          status: item.MatchStatus === 0 ? "Final" : item.MatchStatus === 1 ? "Upcoming" : "Live",
          venue: item.Stadium?.CityName?.[0]?.Description ?? null,
          winnerCode,
        };
      });

    return NextResponse.json(
      { matches, source: "FIFA", updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Live scores are unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
