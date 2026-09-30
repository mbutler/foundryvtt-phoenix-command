import {escapeHTML as e} from '../foundry/context.mjs';
// Anatomical sides, viewed from the front. Use the resolver's exact coverage matching.
export const bodyParts=[
  ['head','center','Head','M82 27 Q82 9 100 9 Q118 9 118 27 L117 37 L83 37 Z'],
  ['face','center','Face / visor','M84 40 H116 L112 55 H88 Z'],
  ['neck','center','Neck','M91 58 H109 V70 H91 Z'],
  ['torso','center','Torso','M77 73 H123 L119 139 H81 Z'],
  ['pelvis','center','Pelvis','M81 143 H119 L124 169 L101 177 L76 169 Z'],
  ...[['right',false],['left',true]].flatMap(([side,left])=>{
    const transform=left?'translate(200 0) scale(-1 1)':'';
    return [
      ['shoulder',side,`${side} shoulder`,'M58 75 L73 73 L73 94 L54 99 Z',transform],
      ['arm',side,`${side} arm`,'M53 103 L71 98 L64 143 L56 176 L43 173 L46 140 Z',transform],
      ['hand',side,`${side} hand`,'M42 178 L55 181 L54 200 L42 204 L37 194 Z',transform],
      ['leg',side,`${side} leg`,'M77 174 L97 181 L94 226 L90 274 L74 274 L72 226 Z',transform],
      ['foot',side,`${side} foot`,'M74 278 H90 L90 292 H65 L65 286 Z',transform]
    ];
  })
];

export function bodyDiagram(regions,{label,interactive=false}={}) {
  return `<svg class="pc-body-diagram" viewBox="0 0 200 310" role="${interactive?'group':'img'}" aria-label="${e(label)}"><path class="pc-body-axis" d="M100 0V310"/>${regions.map(r=>`<path class="pc-body-part" data-coverage="${e(r.state)}" d="${r.path}" ${r.transform?`transform="${r.transform}"`:''} ${interactive&&r.count?`role="button" tabindex="0" data-wound-region="${e(r.key)}" aria-pressed="false" aria-label="${e(r.label)}: ${e(r.detail)}"`:''}><title>${e(r.label)}: ${e(r.detail)}</title></path>`).join('')}<text x="34" y="25">R</text><text x="159" y="25">L</text></svg>`;
}
