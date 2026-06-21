import { useState } from "react";
import { useGame } from "@/store";
import { MONSTER_MAP } from "@/constants/maps";
import { MONSTERS, MONSTER_LANG_DEFS } from "@/constants/monsters";
import { getCombatStats } from "@/lib/combat";
import { Bar } from "@/components/Bar";
import { TimerBar } from "@/components/TimerBar";
import { Icon } from "@/components/icons";
import { formatNumber } from "@/lib/format";
import type { Monster } from "@/types/monsters";

const LANG_IDS = new Set(MONSTER_LANG_DEFS.map((l) => l.id));

function taskLabel(m: Monster): string {
  const idx = m.name.indexOf("の");
  return idx > 0 ? m.name.slice(idx + 1) : m.name;
}

function MonsterCard({
  m,
  label,
  onStart,
  onStop,
  isActive,
}: {
  m: Monster;
  label?: string;
  onStart: () => void;
  onStop: () => void;
  isActive: boolean;
}) {
  return (
    <div
      className={`rounded-[10px] border bg-panel2 p-3 ${isActive ? "border-accent2" : "border-border"}`}
    >
      <div className="mb-1 flex items-center gap-1.5 font-semibold">
        <Icon name={m.icon} size={15} />
        <span className="text-[13px]">{label ?? taskLabel(m)}</span>
      </div>
      <div className="mb-1.5 text-[11px] text-muted">
        規模 {m.hp} · 圧 {m.maxHit} · {m.xp} xp
        {m.dot ? <span className="ml-1 text-[#f97316]"> DoT {m.dot}/s</span> : null}
        {m.regen ? <span className="ml-1 text-accent2"> 回復 {m.regen}/s</span> : null}
      </div>
      <div className="mb-2 text-[11px]">
        <span className="rounded-md border border-border bg-panel px-1.5 py-px">
          ¥{formatNumber(m.goldMin)}〜{formatNumber(m.goldMax)}
        </span>
      </div>
      {isActive ? (
        <button className="w-full border-danger text-danger" onClick={onStop}>
          中断
        </button>
      ) : (
        <button
          className="w-full border-accent bg-accent font-semibold text-[#06101f]"
          onClick={onStart}
        >
          着手
        </button>
      )}
    </div>
  );
}

export function CombatView() {
  const state = useGame();
  const stats = getCombatStats(state);
  const active = state.active;
  const inCombat = active?.kind === "combat";
  const monster = active?.kind === "combat" ? MONSTER_MAP[active.monsterId] : null;
  const mainLang = state.mainLang;
  const interestLangs = state.interestLangs;

  const activeLang = monster?.weakTo && LANG_IDS.has(monster.weakTo) ? monster.weakTo : null;

  const [query, setQuery] = useState("");
  const [selectedLangs, setSelectedLangs] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const init = new Set<string>();
    if (activeLang) init.add(activeLang);
    else if (mainLang && LANG_IDS.has(mainLang)) init.add(mainLang);
    return init;
  });

  const toggleLang = (id: string) =>
    setSelectedLangs((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleExpanded = (id: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const clearFilters = () => {
    setQuery("");
    setSelectedLangs(new Set());
  };

  // Lang rank for ordered grouped view
  const langRank = (id: string) => {
    if (id === mainLang) return 0;
    if (interestLangs.includes(id)) return 1;
    return 2;
  };

  const sortedLangs = [...MONSTER_LANG_DEFS].sort((a, b) => langRank(a.id) - langRank(b.id));

  const langGroups = sortedLangs.map((lang) => ({
    lang,
    monsters: MONSTERS.filter((m) => m.weakTo === lang.id),
  }));

  const others = MONSTERS.filter((m) => !m.weakTo || !LANG_IDS.has(m.weakTo));

  const isActive = (m: Monster) =>
    state.active?.kind === "combat" && state.active.monsterId === m.id;

  // Filter logic: lang chips → text search (intersection)
  const q = query.trim().toLowerCase();
  const isFiltering = selectedLangs.size > 0 || q.length > 0;

  const filtered = isFiltering
    ? MONSTERS.filter((m) => {
        const langOk = selectedLangs.size === 0 || (!!m.weakTo && selectedLangs.has(m.weakTo));
        const textOk = q.length === 0 || m.name.toLowerCase().includes(q);
        return langOk && textOk;
      })
    : null;

  const langLabel = (langId: string) => {
    if (langId === mainLang)
      return <span className="ml-1 text-[11px] text-[#ffce54]">★ 得意</span>;
    if (interestLangs.includes(langId))
      return <span className="ml-1 text-[11px] text-accent2">● 興味</span>;
    return null;
  };

  return (
    <div>
      <h2 className="mb-1 flex items-center gap-2 text-lg">
        <Icon name="projects" size={22} /> 案件（フリーランス）
      </h2>
      <p className="mb-3 text-[13px] text-muted">
        無所属で受けられる単発案件。自動で対応し、メンタル50%以下で装備中の食事を自動でとります。
        装備・食事は「装備」タブで設定。会社の案件は所属で解禁（予定）。
      </p>

      {/* Arena */}
      {inCombat && monster && (
        <div className="mb-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-panel2 p-4 text-center">
            <div className="mb-1">
              <Icon name="company" size={44} />
            </div>
            <h3 className="my-1.5">あなた</h3>
            <Bar
              kind="hp"
              value={state.playerHp / stats.maxHp}
              right={`${Math.ceil(state.playerHp)}/${stats.maxHp}`}
            />
            <div className="mt-2">
              <TimerBar periodMs={stats.weaponSpeed} running={inCombat} label="Attack" />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-panel2 p-4 text-center">
            <div className="mb-1">
              <Icon name={monster.icon} size={44} />
            </div>
            <h3 className="my-1.5">{monster.name}</h3>
            <Bar
              kind="enemy"
              value={state.enemyHp / monster.hp}
              right={`${Math.max(0, Math.ceil(state.enemyHp))}/${monster.hp}`}
            />
            <div className="mt-2">
              <TimerBar periodMs={monster.speed} running={inCombat} label="Attack" />
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="mb-3 space-y-2">
        {/* Language chips */}
        <div className="flex flex-wrap gap-1.5">
          {sortedLangs.map((lang) => {
            const on = selectedLangs.has(lang.id);
            return (
              <button
                key={lang.id}
                onClick={() => toggleLang(lang.id)}
                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                  on
                    ? "border-accent bg-accent font-semibold text-[#06101f]"
                    : "border-border bg-panel hover:bg-panel2"
                }`}
              >
                <Icon name={lang.id} size={12} />
                {lang.name}
                {lang.id === mainLang && !on && (
                  <span className="text-[#ffce54]">★</span>
                )}
                {interestLangs.includes(lang.id) && lang.id !== mainLang && !on && (
                  <span className="text-accent2">●</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Text search + clear */}
        <div className="flex gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="案件名で絞り込み…"
            className="min-w-0 flex-1 rounded-lg border border-border bg-panel px-3 py-1.5 text-[13px] text-inherit"
          />
          {isFiltering && (
            <button
              onClick={clearFilters}
              className="shrink-0 border-border text-[12px] text-muted hover:text-inherit"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* Filtered flat results */}
      {isFiltering && filtered && (
        <div>
          {filtered.length === 0 ? (
            <p className="text-[13px] text-muted">条件に一致する案件が見つかりません。</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2">
              {filtered.map((m) => (
                <MonsterCard
                  key={m.id}
                  m={m}
                  label={selectedLangs.size === 1 ? taskLabel(m) : m.name}
                  isActive={isActive(m)}
                  onStart={() => state.startCombat(m.id)}
                  onStop={() => state.stop()}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Default grouped view */}
      {!isFiltering && (
        <div className="space-y-0.5">
          {langGroups.map(({ lang, monsters: langMs }) => (
            <div key={lang.id}>
              <button
                className="flex w-full items-center gap-2 rounded-lg px-2 py-[7px] text-left hover:bg-panel2"
                onClick={() => toggleExpanded(lang.id)}
              >
                <Icon name={lang.id} size={16} />
                <span className="font-semibold">{lang.name}</span>
                {langLabel(lang.id)}
                <span className="ml-auto text-[11px] text-muted">{langMs.length} 件</span>
                <span className="ml-1 text-[10px] text-muted">
                  {expanded.has(lang.id) ? "▲" : "▼"}
                </span>
              </button>
              {expanded.has(lang.id) && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2 px-1 pb-2 pt-1">
                  {langMs.map((m) => (
                    <MonsterCard
                      key={m.id}
                      m={m}
                      isActive={isActive(m)}
                      onStart={() => state.startCombat(m.id)}
                      onStop={() => state.stop()}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {others.length > 0 && (
            <div>
              <button
                className="flex w-full items-center gap-2 rounded-lg px-2 py-[7px] text-left hover:bg-panel2"
                onClick={() => toggleExpanded("__other")}
              >
                <Icon name="techdebt_m" size={16} />
                <span className="font-semibold">大型・特殊案件</span>
                <span className="ml-auto text-[11px] text-muted">{others.length} 件</span>
                <span className="ml-1 text-[10px] text-muted">
                  {expanded.has("__other") ? "▲" : "▼"}
                </span>
              </button>
              {expanded.has("__other") && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2 px-1 pb-2 pt-1">
                  {others.map((m) => (
                    <MonsterCard
                      key={m.id}
                      m={m}
                      isActive={isActive(m)}
                      onStart={() => state.startCombat(m.id)}
                      onStop={() => state.stop()}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
