/** Detailed line drawings baked into the library (record player, Sonos
 * speakers, wall TVs, garage equipment, specific cars…): plain SVG
 * markup on a viewBox in centimetres, drawn stretched to the item's size
 * in its line colour and thickness (see furniture-draw.ts's "art"
 * prim). Classes: thin / thick lines, dash, dot (filled). */

export interface ArtDrawing {
  /** viewBox width and height. */
  w: number;
  h: number;
  svg: string;
}

export const ART: Record<string, ArtDrawing> = {
  monitor_curved_34: {
    w: 84,
    h: 20,
    svg: '<path d="M29,8.6 L29,5 Q29,2 32,2 L52,2 Q55,2 55,5 L55,8.6"/><rect x="38.5" y="0.8" width="7" height="3" rx="1.2"/><path d="M2,18.85 A100,100 0 0 1 82,18.85 L82,16.13 A102.5,102.5 0 0 0 2,16.13 Z"/><path d="M4,17.3 A100.6,100.6 0 0 1 80,17.3" class="thin"/>',
  },
  record_player: {
    w: 45,
    h: 36,
    svg: '<rect x="0.6" y="0.6" width="43.8" height="34.8" rx="2.5"/><circle cx="17" cy="18" r="14.5"/><circle cx="17" cy="18" r="12" class="thin"/><circle cx="17" cy="18" r="9" class="thin"/><circle cx="17" cy="18" r="4"/><circle cx="17" cy="18" r="0.7" class="dot"/><rect x="35" y="1.6" width="4" height="2.4" rx="0.8"/><circle cx="37" cy="7" r="2.6"/><circle cx="37" cy="7" r="0.9"/><path d="M37,9.6 L36.2,24 Q36,26.5 33.5,27.6 L30.6,28.9"/><rect x="27.6" y="28" width="3.4" height="2.2" rx="0.6" transform="rotate(-25 29.3 29.1)"/><circle cx="40.5" cy="22" r="0.9"/><circle cx="4.5" cy="31.5" r="1.6"/><rect x="7.6" y="30.6" width="3.4" height="1.8" rx="0.9"/>',
  },
  sonos_one: {
    w: 12,
    h: 12,
    svg: '<rect x="0.3" y="0.3" width="11.4" height="11.4" rx="3.6"/><circle cx="6" cy="6.6" r="1.3"/><path d="M2.6,6.6 H3.8 M8.2,6.6 H9.4 M8.8,6 V7.2"/><circle cx="6" cy="3.2" r="0.45" class="dot"/>',
  },
  sonos_era_100: {
    w: 12,
    h: 13,
    svg: '<rect x="0.3" y="0.3" width="11.4" height="12.4" rx="4"/><circle cx="6" cy="5.2" r="1.2"/><path d="M3.8,4.6 L3.2,5.2 L3.8,5.8 M8.2,4.6 L8.8,5.2 L8.2,5.8"/><rect x="3" y="8.1" width="6" height="1" rx="0.5" class="thin"/><circle cx="6" cy="2.4" r="0.35" class="dot"/>',
  },
  sonos_beam: {
    w: 65.1,
    h: 10,
    svg: '<rect x="0.35" y="0.35" width="64.4" height="9.3" rx="4.6"/><circle cx="32.55" cy="5" r="1.3"/><path d="M28.4,5 H29.8 M35.3,5 H36.7 M36,4.3 V5.7"/><circle cx="32.55" cy="2" r="0.35" class="dot"/><path d="M6,8 H59.1" class="thin dash"/>',
  },
  sonos_ray: {
    w: 55.9,
    h: 9.5,
    svg: '<rect x="0.35" y="0.35" width="55.2" height="8.8" rx="2"/><circle cx="27.95" cy="4.6" r="1.2"/><path d="M23.9,4.6 H25.3 M30.6,4.6 H32 M31.3,3.9 V5.3"/><circle cx="27.95" cy="1.9" r="0.35" class="dot"/><path d="M4,7.6 H51.9" class="thin dash"/>',
  },
  sonos_roam: {
    w: 6.2,
    h: 6,
    svg: '<path d="M2.4,1 Q3.1,-0.1 3.8,1 L5.6,4.6 Q6.1,5.6 5,5.6 L1.2,5.6 Q0.1,5.6 0.6,4.6 Z"/><circle cx="3.1" cy="3.7" r="0.6"/>',
  },
  tv_wall_43: {
    w: 96.5,
    h: 6,
    svg: '<rect x="28.95" y="0.4" width="38.60" height="2.2" rx="0.4" class="thin"/><rect x="0.4" y="2.6" width="95.70" height="3" rx="1"/><path d="M2.2,4.7 H94.30" class="thin"/>',
  },
  tv_wall_50: {
    w: 112,
    h: 6,
    svg: '<rect x="33.60" y="0.4" width="44.80" height="2.2" rx="0.4" class="thin"/><rect x="0.4" y="2.6" width="111.20" height="3" rx="1"/><path d="M2.2,4.7 H109.80" class="thin"/>',
  },
  tv_wall_55: {
    w: 123,
    h: 6,
    svg: '<rect x="36.90" y="0.4" width="49.20" height="2.2" rx="0.4" class="thin"/><rect x="0.4" y="2.6" width="122.20" height="3" rx="1"/><path d="M2.2,4.7 H120.80" class="thin"/>',
  },
  tv_wall_65: {
    w: 145,
    h: 6,
    svg: '<rect x="43.50" y="0.4" width="58.00" height="2.2" rx="0.4" class="thin"/><rect x="0.4" y="2.6" width="144.20" height="3" rx="1"/><path d="M2.2,4.7 H142.80" class="thin"/>',
  },
  tv_wall_75: {
    w: 168,
    h: 6,
    svg: '<rect x="54.00" y="0.4" width="60.00" height="2.2" rx="0.4" class="thin"/><rect x="0.4" y="2.6" width="167.20" height="3" rx="1"/><path d="M2.2,4.7 H165.80" class="thin"/>',
  },
  tv_wall_85: {
    w: 190,
    h: 6,
    svg: '<rect x="65.00" y="0.4" width="60.00" height="2.2" rx="0.4" class="thin"/><rect x="0.4" y="2.6" width="189.20" height="3" rx="1"/><path d="M2.2,4.7 H187.80" class="thin"/>',
  },
  snowblower_single: {
    w: 56,
    h: 132,
    svg: '<path d="M4,9 Q28,1 52,9 L54,30 Q54,38 46,38 L10,38 Q2,38 2,30 Z"/><path d="M7,12 Q28,5 49,12" class="thin"/><path d="M7,22 Q28,16 49,22" class="thin"/><circle cx="28" cy="30" r="4.5"/><path d="M25.3,26.5 L24.6,15 Q28,12.6 31.4,15 L30.7,26.5"/><path d="M24.6,15 Q28,11.4 31.4,15" class="thick"/><path d="M14,38 H42 Q46,38 46,44 V70 Q46,78 38,78 H18 Q10,78 10,70 V44 Q10,38 14,38 Z"/><circle cx="20" cy="50" r="2.6"/><path d="M16,66 H40 M16,70 H40" class="thin"/><rect x="3" y="54" width="7" height="20" rx="3"/><rect x="46" y="54" width="7" height="20" rx="3"/><path d="M15,77 V118 Q15,128 25,128 H31 Q41,128 41,118 V77"/><path d="M15,110 Q15,124 22,127 M41,110 Q41,124 34,127" class="thick"/><path d="M15,104 Q28,110 41,104" class="thin"/>',
  },
  snowblower_two: {
    w: 70,
    h: 150,
    svg: '<path d="M4,7 Q35,1 66,7 L68,30 Q68,36 62,36 H8 Q2,36 2,30 Z"/><path d="M7,10 Q35,4 63,10" class="thin"/><path d="M24,36 Q24,52 35,52 Q46,52 46,36"/><circle cx="35" cy="42" r="5.5"/><path d="M31.8,38 L30.8,18 Q35,15.2 39.2,18 L38.2,38"/><path d="M30.8,18 Q35,13.6 39.2,18" class="thick"/><rect x="17" y="50" width="36" height="42" rx="6"/><circle cx="26" cy="61" r="2.8"/><path d="M22,82 H48 M22,86 H48" class="thin"/><rect x="1" y="56" width="14" height="34" rx="5"/><rect x="55" y="56" width="14" height="34" rx="5"/><path d="M3,62 H13 M3,68 H13 M3,74 H13 M3,80 H13 M3,86 H13 M57,62 H67 M57,68 H67 M57,74 H67 M57,80 H67 M57,86 H67" class="thin"/><rect x="16" y="92" width="38" height="12" rx="3"/><circle cx="25" cy="98" r="1.6"/><circle cx="35" cy="98" r="1.6"/><circle cx="45" cy="98" r="1.6"/><path d="M19,104 V136 Q19,147 30,147 H40 Q51,147 51,136 V104"/><path d="M19,128 Q19,143 27,146 M51,128 Q51,143 43,146" class="thick"/><path d="M19,122 Q27,127 34,122 M36,122 Q43,127 51,122" class="thin"/>',
  },
  mower_push_30: {
    w: 86,
    h: 170,
    svg: '<path d="M10,4 Q43,-1 76,4 Q84,6 84,16 V72 Q84,84 72,86 H14 Q2,84 2,72 V16 Q2,6 10,4 Z"/><circle cx="43" cy="44" r="31" class="thin"/><rect x="0" y="7" width="6" height="20" rx="2.5"/><rect x="80" y="7" width="6" height="20" rx="2.5"/><rect x="0" y="57" width="7" height="26" rx="3"/><rect x="79" y="57" width="7" height="26" rx="3"/><rect x="27" y="26" width="32" height="34" rx="8"/><circle cx="43" cy="43" r="9"/><circle cx="43" cy="43" r="3"/><circle cx="55" cy="31" r="2.5"/><rect x="20" y="86" width="46" height="38" rx="8"/><path d="M26,94 H60 M26,102 H60 M26,110 H60 M26,118 H60" class="thin"/><path d="M15,82 V166 M71,82 V166 M15,166 H71"/><path d="M15,134 H71" class="thin"/><path d="M15,154 Q43,160 71,154" class="thin"/>',
  },
  lawn_tractor: {
    w: 112,
    h: 183,
    svg: '<rect x="2" y="62" width="108" height="60" rx="26" class="thin dash"/><rect x="16" y="14" width="12" height="26" rx="4"/><rect x="84" y="14" width="12" height="26" rx="4"/><rect x="6" y="116" width="20" height="46" rx="6"/><rect x="86" y="116" width="20" height="46" rx="6"/><rect x="30" y="4" width="52" height="62" rx="14"/><path d="M38,12 H74" class="thin"/><rect x="28" y="66" width="56" height="94" rx="8"/><circle cx="56" cy="80" r="9"/><circle cx="56" cy="80" r="1.5"/><rect x="36" y="108" width="40" height="34" rx="10"/><rect x="38" y="140" width="36" height="8" rx="4"/><rect x="34" y="160" width="44" height="20" rx="6"/>',
  },
  mini_skid_steer: {
    w: 104,
    h: 270,
    svg: '<path d="M3,3 H101 L102,32 Q102,35 99,35 H5 Q2,35 2,32 Z"/><path d="M4,3 H100" class="thick"/><path d="M6,26 H98" class="thin"/><path d="M3,5 L6,33 M101,5 L98,33" class="thin"/><rect x="20" y="35" width="64" height="8" rx="2"/><rect x="17" y="38" width="9" height="140" rx="3.5"/><rect x="78" y="38" width="9" height="140" rx="3.5"/><path d="M21.5,60 V150 M82.5,60 V150" class="thin"/><rect x="2" y="72" width="16" height="172" rx="8"/><rect x="86" y="72" width="16" height="172" rx="8"/><path d="M3,92 H17 M3,108 H17 M3,124 H17 M3,140 H17 M3,156 H17 M3,172 H17 M3,188 H17 M3,204 H17 M3,220 H17 M87,92 H101 M87,108 H101 M87,124 H101 M87,140 H101 M87,156 H101 M87,172 H101 M87,188 H101 M87,204 H101 M87,220 H101" class="thin"/><rect x="27" y="58" width="50" height="152" rx="8"/><path d="M35,82 H69 M35,90 H69 M35,98 H69 M35,106 H69" class="thin"/><circle cx="52" cy="132" r="4"/><rect x="31" y="190" width="42" height="22" rx="4"/><circle cx="41" cy="201" r="3"/><circle cx="63" cy="201" r="3"/><rect x="24" y="220" width="56" height="46" rx="4"/><path d="M30,228 H74 M30,236 H74 M30,244 H74 M30,252 H74 M30,260 H74" class="thin"/>',
  },
  car_land_rover_discovery: {
    w: 222,
    h: 497,
    svg: '<path d="M31,3 H191 Q209,3 210,22 L211,60 Q214,90 211,120 V350 Q214,382 211,414 L210,478 Q209,494 191,494 H31 Q13,494 12,478 L11,414 Q8,382 11,350 V120 Q8,90 11,60 L12,22 Q13,3 31,3 Z"/><path d="M36,148 L34,20 Q111,12 188,20 L186,148" class="thin"/><path d="M30,152 H192 L182,200 H40 Z"/><path d="M11,150 L3,156 Q0,166 4,170 H11 M211,150 L219,156 Q222,166 218,170 H211"/><path d="M40,200 H182 L184,430 H38 Z"/><path d="M38,300 H184" class="thin"/><path d="M46,208 V422 M176,208 V422" class="thick"/><rect x="62" y="214" width="98" height="72" rx="6" class="thin"/><rect x="62" y="314" width="98" height="96" rx="6" class="thin"/><path d="M38,430 H184 L190,458 H32 Z"/><path d="M28,474 H194" class="thin"/>',
  },
  car_mercedes_glc: {
    w: 208,
    h: 472,
    svg: '<path d="M40,4 Q104,-1 168,4 Q196,10 198,44 L199,70 Q202,100 199,128 L198,345 Q202,375 199,405 L197,436 Q194,466 164,469 H44 Q14,466 11,436 L9,405 Q6,375 10,345 L10,128 Q6,100 9,70 L10,44 Q12,10 40,4 Z"/><path d="M66,22 Q64,80 68,140 M142,22 Q144,80 140,140" class="thin"/><path d="M28,150 Q104,138 180,150 L166,208 Q104,200 42,208 Z"/><path d="M10,156 L2,162 Q0,172 4,176 H10 M198,156 L206,162 Q208,172 204,176 H198"/><path d="M42,208 Q104,200 166,208 L168,392 Q104,400 40,392 Z"/><rect x="58" y="222" width="92" height="150" rx="14" class="thin"/><path d="M40,392 Q104,400 168,392 L180,428 Q104,438 28,428 Z"/><path d="M30,446 Q104,456 178,446" class="thin"/>',
  },
};
