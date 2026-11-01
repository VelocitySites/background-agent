import type { ClothingItem } from "@/lib/shop/catalog";
import { adjustColor } from "@/lib/shop/color";
import { fold } from "@/lib/shop/graphics";

export type FigureAngle = "front" | "right" | "back" | "left";

interface AngleBodyProps {
  skin: string;
  skinId: string;
  hair: string;
  hairStyle: number;
  top: ClothingItem | null;
  bottom: ClothingItem | null;
  feet: ClothingItem | null;
  head: ClothingItem | null;
  bodyScale: number;
}

export function BackBody({
  skin,
  skinId,
  hair,
  hairStyle,
  top,
  bottom,
  feet,
  head,
  bodyScale,
}: AngleBodyProps) {
  const cloth = top?.color ?? `url(#${skinId})`;
  const clothDark = fold(top, skin);
  const legs = bottom?.color ?? `url(#${skinId})`;
  const legsDark = fold(bottom, skin);
  const shoe = feet?.color ?? skin;
  const shoeDark = fold(feet, "#111");

  return (
    <g>
      <ellipse cx="100" cy="408" rx="42" ry="7" fill="rgba(0,0,0,0.28)" />
      <g transform={`translate(100 230) scale(${bodyScale} 1) translate(-100 -230)`}>
        <path d="M70 228 C68 290 66 340 68 368 L90 368 C92 330 94 280 96 228 Z" fill={legs} />
        <path d="M104 228 C106 280 108 330 110 368 L132 368 C134 340 132 290 130 228 Z" fill={legsDark} />
        {bottom?.kind === "jeans" && (
          <g fill="none" stroke={bottom.accent} strokeWidth="1.2">
            <path d="M72 248 H92 V262 H72 Z" />
            <path d="M108 248 H128 V262 H108 Z" />
            <path d="M64 232 H136" />
          </g>
        )}
        {bottom?.kind === "joggers" && (
          <g>
            <ellipse cx="79" cy="364" rx="12" ry="5" fill={legsDark} />
            <ellipse cx="121" cy="364" rx="12" ry="5" fill={legsDark} />
          </g>
        )}
        {feet && (
          <g>
            <path d="M62 366 H94 V378 C94 388 62 388 62 378 Z" fill={shoe} />
            <path d="M106 366 H138 V378 C138 388 106 388 106 378 Z" fill={shoeDark} />
            <path d="M60 380 H96 M104 380 H140" stroke={shoeDark} strokeWidth="4" strokeLinecap="round" />
          </g>
        )}
        <path d="M58 118 C52 140 48 170 50 210 L46 232 H154 L150 210 C152 170 148 140 142 118 L118 108 H82 Z" fill={cloth} />
        <path d="M100 118 V228" stroke={clothDark} strokeWidth="1.4" opacity="0.7" />
        {top?.kind === "hoodie" && (
          <path d="M78 168 H122 V198 H78 Z" fill={clothDark} opacity="0.45" />
        )}
        {top?.kind === "oxford" && (
          <path d="M86 112 H114 L108 124 H92 Z" fill={top.accent} />
        )}
        <path d="M52 130 C40 160 36 190 40 214 L52 210 C50 186 54 160 62 140 Z" fill={top ? clothDark : `url(#${skinId})`} />
        <path d="M148 130 C160 160 164 190 160 214 L148 210 C150 186 146 160 138 140 Z" fill={top ? cloth : `url(#${skinId})`} />
        <ellipse cx="40" cy="220" rx="9" ry="11" fill={skin} />
        <ellipse cx="160" cy="220" rx="9" ry="11" fill={skin} />
      </g>
      {hairStyle !== 5 && (
        <path
          d={
            hairStyle === 2
              ? "M64 70 C58 110 60 160 70 190 L84 184 C76 150 74 110 80 78 C88 40 112 40 120 78 C126 110 124 150 116 184 L130 190 C140 160 142 110 136 70 C128 28 72 28 64 70 Z"
              : "M68 52 C66 24 80 8 100 8 C120 8 134 24 132 52 C126 36 114 28 100 28 C86 28 74 36 68 52 Z"
          }
          fill={hair}
        />
      )}
      {top?.kind === "hoodie" && (
        <path d="M66 96 C62 70 78 48 100 46 C122 48 138 70 134 96 C124 78 112 72 100 72 C88 72 76 78 66 96 Z" fill={top.color} />
      )}
      <ellipse cx="100" cy="58" rx="30" ry="36" fill={`url(#${skinId})`} />
      {hairStyle !== 5 && (
        <path d="M70 48 C72 20 84 10 100 10 C116 10 128 20 130 48 C120 34 110 30 100 30 C90 30 80 34 70 48 Z" fill={hair} />
      )}
      <BackHeadwear item={head} hair={hair} />
    </g>
  );
}

function BackHeadwear({ item, hair }: { item: ClothingItem | null; hair: string }) {
  if (!item) return null;
  const dark = fold(item);
  if (item.kind === "beanie") {
    return <path d="M68 46 C66 16 82 4 100 4 C118 4 134 16 132 46 C124 34 112 30 100 30 C88 30 76 34 68 46 Z" fill={item.color} />;
  }
  if (item.kind === "bucket") {
    return (
      <g>
        <path d="M78 36 C78 16 122 16 122 36 V44 H78 Z" fill={item.color} />
        <ellipse cx="100" cy="46" rx="44" ry="9" fill={dark} />
      </g>
    );
  }
  return (
    <g>
      <path d="M68 40 C66 16 82 6 100 6 C118 6 134 16 132 40 C124 28 112 24 100 24 C88 24 76 28 68 40 Z" fill={item.color} />
      <path d="M78 38 H122" stroke={item.accent || hair} strokeWidth="3" />
      <path d="M86 34 H114" stroke={dark} strokeWidth="2" />
    </g>
  );
}

export function SideBody({
  skin,
  skinId,
  hair,
  hairStyle,
  top,
  bottom,
  feet,
  head,
  bodyScale,
}: AngleBodyProps) {
  const cloth = top?.color ?? `url(#${skinId})`;
  const clothDark = fold(top, skin);
  const legs = bottom?.color ?? `url(#${skinId})`;
  const legsDark = fold(bottom, skin);
  const shoe = feet?.color ?? skin;
  const sole = fold(feet, "#111");

  return (
    <g>
      <ellipse cx="108" cy="408" rx="36" ry="7" fill="rgba(0,0,0,0.28)" />
      <g transform={`translate(108 240) scale(${bodyScale} 1) translate(-108 -240)`}>
        <path d="M96 230 C92 290 90 340 92 368 L112 368 C114 330 112 280 114 230 Z" fill={legsDark} />
        <path d="M108 228 C112 290 118 340 124 366 L146 366 C140 330 132 280 126 228 Z" fill={legs} />
        {bottom?.kind === "jeans" && (
          <path d="M118 250 H140 V264 H118 Z" fill="none" stroke={bottom.accent} strokeWidth="1.2" />
        )}
        {bottom?.kind === "joggers" && <ellipse cx="132" cy="362" rx="14" ry="5" fill={legsDark} />}
        {feet && <SideShoe color={shoe} sole={sole} accent={feet.accent} kind={feet.kind} />}
        <path
          d="M92 150 C86 130 96 112 112 108 L124 112 C136 120 142 140 140 168 L136 228 L100 228 L96 176 Z"
          fill={cloth}
        />
        {top?.kind === "oxford" && (
          <path d="M112 108 L128 118 L120 128 L108 114 Z" fill={top.accent} />
        )}
        {top?.kind === "graphic" && <rect x="112" y="150" width="16" height="22" rx="2" fill={top.accent} />}
        <path d="M98 150 C86 170 82 196 88 220 L102 214 C98 196 100 174 108 158 Z" fill={top ? clothDark : `url(#${skinId})`} />
        <ellipse cx="90" cy="226" rx="8" ry="10" fill={skin} />
        {top?.kind === "hoodie" && <path d="M100 228 H136" stroke={clothDark} strokeWidth="7" strokeLinecap="round" />}
      </g>
      {hairStyle === 2 && <path d="M78 70 C70 110 72 150 84 180 L98 172 C88 140 86 100 96 72 Z" fill={hair} />}
      {top?.kind === "hoodie" && (
        <path d="M96 100 C92 78 104 58 124 56 C140 62 146 82 140 102 C130 88 116 84 108 88 Z" fill={top.color} />
      )}
      <ellipse cx="112" cy="58" rx="24" ry="36" fill={`url(#${skinId})`} />
      <path d="M128 62 C138 66 142 74 136 80 C132 74 130 68 128 64 Z" fill={skin} />
      {hairStyle !== 5 && (
        <path d="M92 50 C90 22 104 10 122 14 C132 18 138 32 134 48 C124 30 108 26 96 40 Z" fill={hair} />
      )}
      <path d="M112 70 L112 82 L108 86" stroke={adjustColor(skin, -35)} strokeWidth="1.1" fill="none" />
      <SideHeadwear item={head} />
    </g>
  );
}

function SideShoe({
  color,
  sole,
  accent,
  kind,
}: {
  color: string;
  sole: string;
  accent: string;
  kind: ClothingItem["kind"];
}) {
  const tall = kind === "canvas";
  const top = tall ? 332 : 356;
  return (
    <g>
      <path
        d={`M108 ${top + 18} H148 C160 ${top + 18} 164 ${top + 30} 150 ${top + 38} H104 C94 ${top + 34} 96 ${top + 22} 108 ${top + 18} Z`}
        fill={color}
      />
      {tall && <path d="M116 332 H142 V352 H116 Z" fill={color} />}
      {tall && <path d="M122 348 H146 L150 362 H118 Z" fill={accent} />}
      <path
        d={`M100 ${top + 36} H164`}
        stroke={tall ? accent : sole}
        strokeWidth="5"
        strokeLinecap="round"
      />
      {tall && <path d="M122 336 H136 M122 344 H136" stroke={accent} strokeWidth="1.3" strokeLinecap="round" />}
      {kind === "runner" && <path d={`M114 ${top + 24} H146`} stroke={accent || "#1d4e89"} strokeWidth="3" strokeLinecap="round" />}
    </g>
  );
}

function SideHeadwear({ item }: { item: ClothingItem | null }) {
  if (!item) return null;
  const dark = fold(item);
  if (item.kind === "beanie") {
    return <path d="M96 40 C96 16 120 8 134 22 C140 36 132 48 118 46 C106 44 96 36 96 40 Z" fill={item.color} />;
  }
  if (item.kind === "bucket") {
    return (
      <g>
        <path d="M102 28 H132 V42 H102 Z" fill={item.color} />
        <path d="M96 40 H158 C156 50 108 50 100 44 Z" fill={dark} />
      </g>
    );
  }
  return (
    <g>
      <path d="M100 36 C100 16 124 10 138 24 C140 36 130 42 116 40 C106 38 100 32 100 36 Z" fill={item.color} />
      <path d="M112 38 H164 L158 48 H116 Z" fill={dark} />
    </g>
  );
}
