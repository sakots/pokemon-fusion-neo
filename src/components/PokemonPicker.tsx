import { useState } from 'react';
import type { FusionPokemon } from '../domain/fusion';
import { searchPokemon } from '../domain/selection';

export default function PokemonPicker({ side, label, pokemon, selected, onSelect, onRandom }: {
  side: 'head' | 'body';
  label: string;
  pokemon: readonly FusionPokemon[];
  selected: FusionPokemon;
  onSelect: (id: number) => void;
  onRandom: () => void;
}) {
  const [query, setQuery] = useState('');
  const matches = searchPokemon(pokemon, query);
  const selectedMatches = matches.some(entry => entry.id === selected.id);
  const numberedName = (entry: FusionPokemon) => `No.${String(entry.id).padStart(4, '0')} ${entry.name}`;

  return (
    <section className="pokemon-picker" aria-labelledby={`${side}-title`}>
      <h2 id={`${side}-title`}>{label}</h2>
      <div className="selected-pokemon">
        <img src={selected.originalPath} alt={`選択中の${label}：${selected.name}`} width="96" height="96" />
        <p>選択中：{numberedName(selected)}</p>
      </div>
      <label htmlFor={`${side}-search`}>{label}を検索</label>
      <input id={`${side}-search`} type="search" value={query} placeholder="名前または図鑑番号"
        onChange={event => setQuery(event.target.value)} />
      <p id={`${side}-search-status`} className="search-status" role="status">
        {matches.length ? `${matches.length}種類` : '該当するポケモンがありません'}
      </p>
      <label htmlFor={`${side}-select`}>{label}を選択</label>
      <select id={`${side}-select`} value={selected.id} disabled={matches.length === 0}
        aria-describedby={`${side}-search-status`} onChange={event => onSelect(Number(event.target.value))}>
        {!selectedMatches && <option value={selected.id} disabled>{numberedName(selected)}</option>}
        {matches.map(entry => <option key={entry.id} value={entry.id}>{numberedName(entry)}</option>)}
      </select>
      <button type="button" className="random-button" onClick={onRandom}>{label}をランダム</button>
    </section>
  );
}
