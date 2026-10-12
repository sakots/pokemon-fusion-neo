import { useLayoutEffect, useRef, useState } from 'react';
import { fusionName } from '../domain/fusion';
import type { FusionPokemon } from '../domain/fusion';
import { renderFusion } from '../fusion/render';

export default function FusionPreview({ head, body }: { head: FusionPokemon; body: FusionPokemon }) {
  const target = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const name = fusionName(head, body);

  useLayoutEffect(() => {
    let active = true;
    target.current?.replaceChildren();
    setState('loading');
    renderFusion(head, body).then(canvas => {
      if (!active) return;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', name);
      target.current?.replaceChildren(canvas);
      setState('ready');
    }).catch(() => { if (active) setState('error'); });
    return () => { active = false; };
  }, [head, body, name, attempt]);

  return (
    <figure className="fusion-card" data-head={head.id} data-body={body.id} data-state={state} aria-busy={state === 'loading'}>
      <div className="fusion-image" ref={target} />
      {state === 'loading' && <p className="preview-message" role="status">読み込み中</p>}
      {state === 'error' && <div>
        <p role="alert">画像を読み込めませんでした。</p>
        <button type="button" onClick={() => setAttempt(value => value + 1)}>再試行</button>
      </div>}
      <figcaption aria-live="polite" aria-atomic="true">
        <strong>{name}</strong>
        <small>{head.name} × {body.name}</small>
      </figcaption>
    </figure>
  );
}
