"use client";

import { useId, useRef, useState } from "react";
import type { ClothingSlot } from "@/types";
import {
  type ClothingItem,
  type SelectedOutfit,
} from "@/lib/shop/catalog";
import {
  BODY_TYPES,
  HAIR_COLORS,
  SKIN_TONES,
  type AvatarConfig,
  DEFAULT_AVATAR,
} from "@/lib/shop/avatar";
import { adjustColor } from "@/lib/shop/color";
import { cn } from "@/lib/utils";
import { angleFromYaw, BackBody, SideBody } from "@/components/shop/FigureAngles";

const BODY_SCALE = [0.84, 0.93, 1, 1.08, 1.16];

interface DressedFigureProps {
  outfit: Partial<SelectedOutfit>;
  avatar?: AvatarConfig | null;
  activeSlot?: ClothingSlot | null;
  onSlotClick?: (slot: ClothingSlot) => void;
  onPieceDoubleClick?: (slot: ClothingSlot) => void;
  deepDive?: boolean;
  /** Drag and the side arrows spin the figure through a full turn. */
  orbit?: boolean;
  framed?: boolean;
  className?: string;
}

export function DressedFigure({
  outfit,
  avatar,
  activeSlot = null,
  onSlotClick,
  onPieceDoubleClick,
  deepDive = false,
  orbit = false,
  framed = true,
  className,
}: DressedFigureProps) {
  const rawId = useId().replace(/:/g, "");
  const [yaw, setYaw] = useState(0);
  const [grabbing, setGrabbing] = useState(false);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const facing = angleFromYaw(yaw);
  const person = avatar ?? DEFAULT_AVATAR;
  const skin = SKIN_TONES[person.skinTone] ?? SKIN_TONES[2];
  const hair = HAIR_COLORS[person.hairColor] ?? HAIR_COLORS[0];
  const skinShadow = adjustColor(skin, -28);
  const scale = BODY_SCALE[person.bodyType] ?? 1;
  const top = outfit.top ?? null;
  const bottom = outfit.bottom ?? null;
  const feet = outfit.feet ?? null;
  const head = outfit.head ?? null;
  const longSleeves = top?.kind === "hoodie" || top?.kind === "oxford";

  const turn = (delta: number) => setYaw((current) => current + delta);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!orbit) return;
    if ((event.target as HTMLElement).closest("[data-orbit-button]")) return;
    drag.current = { x: event.clientX, moved: false };
    setGrabbing(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    if (Math.abs(dx) > 2) drag.current.moved = true;
    if (!drag.current.moved) return;
    drag.current.x = event.clientX;
    turn(dx * 0.7);
  };

  const onPointerUp = () => {
    if (drag.current?.moved) {
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 280);
    }
    drag.current = null;
    setGrabbing(false);
  };

  const guarded = (slot: ClothingSlot) => {
    if (suppressClick.current) return;
    onSlotClick?.(slot);
  };

  return (
    <div
      className={cn(
        "relative",
        framed &&
          "overflow-hidden rounded-3xl border border-brand-700/50 bg-gradient-to-b from-brand-800/95 to-brand-950 shadow-2xl",
        orbit && (grabbing ? "cursor-grabbing" : "cursor-grab"),
        className
      )}
      style={orbit ? { touchAction: "none" } : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {framed && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent-500/10 via-transparent to-black/40" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-accent-400/10 blur-3xl" />
        </>
      )}

      <svg
        viewBox="0 0 200 430"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={`Figure wearing ${describeOutfit(outfit)}. ${BODY_TYPES[person.bodyType] ?? "Average"} build.`}
      >
        <defs>
          <linearGradient id={`${rawId}-skin`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skin} />
            <stop offset="100%" stopColor={skinShadow} />
          </linearGradient>
          <clipPath id={`${rawId}-face`}>
            <ellipse cx="100" cy="58" rx="24" ry="30" />
          </clipPath>
        </defs>

        <g transform={`translate(100 0) scale(${facing.squeeze} 1) translate(-100 0)`}>
        {facing.angle === "back" && (
          <BackBody
            skin={skin}
            skinId={`${rawId}-skin`}
            hair={hair}
            hairStyle={person.hairStyle}
            top={top}
            bottom={bottom}
            feet={feet}
            head={head}
            bodyScale={scale}
          />
        )}
        {facing.angle === "front" && (
          <>
        <ellipse cx="100" cy="408" rx="46" ry="8" fill="rgba(0,0,0,0.28)" />

        <g transform={`translate(100 230) scale(${scale} 1) translate(-100 -230)`}>
          <Legs item={bottom} skinId={`${rawId}-skin`} />
          <Shoes item={feet} />
          {!longSleeves && <Arms skinId={`${rawId}-skin`} />}
          <Torso item={top} skin={skin} skinId={`${rawId}-skin`} />
          <Hands skin={skin} covered={longSleeves} />
        </g>

        <HairBack style={person.hairStyle} color={hair} />
        {top?.kind === "hoodie" && <Hood color={top.color} dark={adjustColor(top.color, -30)} />}
        <ellipse cx="100" cy="58" rx="30" ry="36" fill={`url(#${rawId}-skin)`} />
        <rect x="88" y="88" width="24" height="22" rx="6" fill={skin} />
        {person.photoUrl ? (
          <image
            href={person.photoUrl}
            x="74"
            y="28"
            width="52"
            height="64"
            clipPath={`url(#${rawId}-face)`}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <Face skin={skin} />
        )}
        <HairFront style={person.hairStyle} color={hair} overPhoto={Boolean(person.photoUrl)} />
        <Headwear item={head} />
          </>
        )}
        {(facing.angle === "left" || facing.angle === "right") && (
          <g transform={facing.angle === "left" ? "translate(200 0) scale(-1 1)" : undefined}>
            <SideBody
              skin={skin}
              skinId={`${rawId}-skin`}
              hair={hair}
              hairStyle={person.hairStyle}
              top={top}
              bottom={bottom}
              feet={feet}
              head={head}
              bodyScale={scale}
            />
          </g>
        )}
        </g>
      </svg>

      {onSlotClick && (
        <div className="absolute inset-0">
          <Zone
            label="Select headwear"
            active={activeSlot === "head"}
            hint={deepDive && head ? "Double-click" : undefined}
            onClick={() => guarded("head")}
            onDoubleClick={
              onPieceDoubleClick
                ? () => {
                    if (suppressClick.current) return;
                    onPieceDoubleClick("head");
                  }
                : undefined
            }
            className="left-1/2 top-[4%] h-[18%] w-[34%] -translate-x-1/2 rounded-full"
          />
          <Zone
            label="Select top"
            active={activeSlot === "top"}
            hint={deepDive && top ? "Double-click" : undefined}
            onClick={() => guarded("top")}
            onDoubleClick={
              onPieceDoubleClick
                ? () => {
                    if (suppressClick.current) return;
                    onPieceDoubleClick("top");
                  }
                : undefined
            }
            className="left-1/2 top-[24%] h-[26%] w-[46%] -translate-x-1/2 rounded-2xl"
          />
          <Zone
            label="Select bottom"
            active={activeSlot === "bottom"}
            hint={deepDive && bottom ? "Double-click" : undefined}
            onClick={() => guarded("bottom")}
            onDoubleClick={
              onPieceDoubleClick
                ? () => {
                    if (suppressClick.current) return;
                    onPieceDoubleClick("bottom");
                  }
                : undefined
            }
            className="left-1/2 top-[50%] h-[28%] w-[40%] -translate-x-1/2 rounded-2xl"
          />
          <Zone
            label="Select footwear"
            active={activeSlot === "feet"}
            hint={deepDive && feet ? "Double-click" : undefined}
            onClick={() => guarded("feet")}
            onDoubleClick={
              onPieceDoubleClick
                ? () => {
                    if (suppressClick.current) return;
                    onPieceDoubleClick("feet");
                  }
                : undefined
            }
            className="left-1/2 top-[80%] h-[14%] w-[52%] -translate-x-1/2 rounded-xl"
          />
        </div>
      )}

      {orbit && (
        <>
          <button
            type="button"
            data-orbit-button
            aria-label="Turn left"
            onClick={() => turn(-50)}
            className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-brand-950/80 text-white hover:bg-brand-800"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            data-orbit-button
            aria-label="Turn right"
            onClick={() => turn(50)}
            className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-brand-950/80 text-white hover:bg-brand-800"
          >
            <Chevron direction="right" />
          </button>
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 text-center">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/80">{facing.label}</p>
            <p className="text-[10px] text-white/45">Drag to turn</p>
          </div>
        </>
      )}
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
      <path
        d={direction === "left" ? "M12 4 L6 10 L12 16" : "M8 4 L14 10 L8 16"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Zone({
  label,
  active,
  hint,
  onClick,
  onDoubleClick,
  className,
}: {
  label: string;
  active: boolean;
  hint?: string;
  onClick: () => void;
  onDoubleClick?: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      aria-label={hint ? `${label}. ${hint} to look closer.` : label}
      onClick={onClick}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDoubleClick?.();
      }}
      className={cn(
        "group absolute transition-all duration-300",
        active ? "bg-accent-500/25 ring-2 ring-accent-400" : "hover:bg-white/10",
        hint && "hover:ring-2 hover:ring-accent-300/70",
        className
      )}
    >
      {hint && (
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-brand-950/90 px-2 py-1 text-[10px] uppercase tracking-wide text-white opacity-0 shadow group-hover:opacity-100">
          {hint}
        </span>
      )}
    </button>
  );
}

function Face({ skin }: { skin: string }) {
  const brow = adjustColor(skin, -70);
  return (
    <g>
      <ellipse cx="88" cy="56" rx="3.2" ry="2.2" fill="#1f2937" />
      <ellipse cx="112" cy="56" rx="3.2" ry="2.2" fill="#1f2937" />
      <ellipse cx="89" cy="55" rx="1" ry="1" fill="#fff" opacity="0.8" />
      <ellipse cx="113" cy="55" rx="1" ry="1" fill="#fff" opacity="0.8" />
      <path d="M83 48 Q88 46 94 48" stroke={brow} strokeWidth="1.4" fill="none" />
      <path d="M106 48 Q112 46 117 48" stroke={brow} strokeWidth="1.4" fill="none" />
      <path d="M100 60 L100 70 L96 73" stroke={adjustColor(skin, -40)} strokeWidth="1.1" fill="none" />
      <path d="M92 80 Q100 86 108 80" stroke="#9a4d3c" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </g>
  );
}

function HairBack({ style, color }: { style: number; color: string }) {
  if (style === 5) return null;
  if (style === 2) {
    return (
      <path
        d="M68 70 C60 90 58 140 64 180 L78 176 C74 140 76 100 82 78 C90 40 110 40 118 78 C124 100 126 140 122 176 L136 180 C142 140 140 90 132 70 C124 30 76 30 68 70 Z"
        fill={color}
      />
    );
  }
  if (style === 3) {
    return (
      <g fill={color}>
        <circle cx="70" cy="62" r="14" />
        <circle cx="130" cy="62" r="14" />
        <circle cx="64" cy="80" r="10" />
        <circle cx="136" cy="80" r="10" />
      </g>
    );
  }
  return null;
}

function HairFront({
  style,
  color,
  overPhoto,
}: {
  style: number;
  color: string;
  overPhoto: boolean;
}) {
  if (style === 5) return null;
  const short = style === 0;
  return (
    <g fill={color}>
      <path
        d={
          short
            ? "M76 40 C74 22 86 12 100 12 C114 12 126 22 124 40 C118 30 110 26 100 26 C90 26 82 30 76 40 Z"
            : "M70 46 C68 24 82 12 100 12 C118 12 132 24 130 46 C122 32 112 26 100 26 C88 26 78 32 70 46 Z"
        }
      />
      {short && (
        <>
          <path d="M74 36 C72 46 76 54 80 56 C76 46 78 40 82 36 Z" />
          <path d="M126 36 C128 46 124 54 120 56 C124 46 122 40 118 36 Z" />
          <path d="M96 16 C98 28 98 36 96 40" stroke={adjustColor(color, 28)} strokeWidth="1.2" fill="none" />
        </>
      )}
      {style === 3 && (
        <>
          <circle cx="78" cy="28" r="10" />
          <circle cx="100" cy="18" r="11" />
          <circle cx="122" cy="28" r="10" />
        </>
      )}
      {style === 1 && (
        <path d="M68 44 C66 68 70 84 78 88 C74 68 76 54 82 44 Z M132 44 C134 68 130 84 122 88 C126 68 124 54 118 44 Z" />
      )}
      {!overPhoto && style === 4 && (
        <path
          d="M74 40 C82 28 90 50 100 34 C110 50 118 28 126 40"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
        />
      )}
      {!overPhoto && style === 1 && (
        <path
          d="M78 34 C88 26 112 26 122 34"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

function Hood({ color, dark }: { color: string; dark: string }) {
  return (
    <path
      d="M70 108 C64 86 76 64 90 58 C96 54 104 54 110 58 C124 64 136 86 130 108 C120 92 110 86 100 86 C90 86 80 92 70 108 Z"
      fill={color}
      stroke={dark}
      strokeWidth="2"
    />
  );
}

function Arms({ skinId }: { skinId: string }) {
  return (
    <g fill={`url(#${skinId})`}>
      <path d="M42 158 C32 176 30 192 34 206 C40 210 48 206 50 198 C52 182 54 168 60 158 Z" />
      <path d="M158 158 C168 176 170 192 166 206 C160 210 152 206 150 198 C148 182 146 168 140 158 Z" />
    </g>
  );
}

function Hands({ skin, covered }: { skin: string; covered: boolean }) {
  const y = covered ? 214 : 204;
  return (
    <g fill={skin}>
      <ellipse cx="36" cy={y} rx="9" ry="11" />
      <ellipse cx="164" cy={y} rx="9" ry="11" />
    </g>
  );
}

function Torso({
  item,
  skin,
  skinId,
}: {
  item: ClothingItem | null;
  skin: string;
  skinId: string;
}) {
  if (!item) {
    return (
      <path
        d="M62 112 C56 124 50 150 48 168 L46 228 L154 228 L152 168 C150 150 144 124 138 112 L118 104 L100 116 L82 104 Z"
        fill={`url(#${skinId})`}
      />
    );
  }

  const main = item.color;
  const dark = adjustColor(main, -32);
  const light = adjustColor(main, 22);

  if (item.kind === "hoodie") {
    return (
      <g>
        <path d="M46 124 C30 150 24 186 30 214 L46 210 C44 184 50 156 62 132 Z" fill={dark} />
        <path d="M154 124 C170 150 176 186 170 214 L154 210 C156 184 150 156 138 132 Z" fill={main} />
        <path
          d="M58 108 C52 122 48 150 46 168 L44 236 L156 236 L154 168 C152 150 148 122 142 108 L100 118 Z"
          fill={main}
        />
        <path d="M78 164 H122 V168 C122 188 78 188 78 168 Z" fill={dark} opacity="0.55" />
        <path d="M86 168 V186 M114 168 V186" stroke={light} strokeWidth="1" opacity="0.45" />
        <path d="M44 228 H156" stroke={dark} strokeWidth="8" strokeLinecap="round" />
        <path d="M70 112 Q100 128 130 112" fill="none" stroke={dark} strokeWidth="3" />
      </g>
    );
  }

  if (item.kind === "oxford") {
    return (
      <g>
        <path d="M48 120 C34 146 30 180 36 210 L48 206 C46 180 52 150 62 128 Z" fill={dark} />
        <path d="M152 120 C166 146 170 180 164 210 L152 206 C154 180 148 150 138 128 Z" fill={main} />
        <path
          d="M60 108 C54 122 50 150 48 168 L46 232 L154 232 L152 168 C150 150 146 122 140 108 L118 102 L100 118 L82 102 Z"
          fill={main}
        />
        <path d="M82 104 L100 126 L118 104 L112 100 L100 114 L88 100 Z" fill={item.accent} />
        <path d="M100 126 V220" stroke={dark} strokeWidth="1.4" />
        {[148, 166, 184, 202].map((y) => (
          <circle key={y} cx="100" cy={y} r="1.6" fill={dark} />
        ))}
        <path d="M46 222 H154" stroke={item.accent} strokeWidth="5" />
      </g>
    );
  }

  return (
    <g>
      <path
        d="M32 166 C26 146 42 122 68 110 L84 104 Q100 118 116 104 L132 110 C158 122 174 146 168 166 L150 158 L146 228 L54 228 L50 158 Z"
        fill={main}
      />
      <path d="M32 158 H50" stroke={dark} strokeWidth="3" strokeLinecap="round" />
      <path d="M150 158 H168" stroke={dark} strokeWidth="3" strokeLinecap="round" />
      <path d="M86 106 Q100 120 114 106 Q100 112 86 106 Z" fill={skin} />
      <path d="M84 106 Q100 122 116 106" fill="none" stroke={dark} strokeWidth="3.2" strokeLinecap="round" />
      {item.kind === "graphic" && (
        <g>
          <rect x="80" y="142" width="40" height="32" rx="4" fill={item.accent} />
          <rect x="86" y="150" width="22" height="5" rx="1" fill={light} />
          <rect x="86" y="160" width="14" height="4" rx="1" fill={dark} opacity="0.55" />
        </g>
      )}
      <path d="M52 220 H148" stroke={dark} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
    </g>
  );
}

function Legs({ item, skinId }: { item: ClothingItem | null; skinId: string }) {
  const fill = item ? item.color : `url(#${skinId})`;
  const dark = item ? adjustColor(item.color, -28) : "transparent";
  const hem = item?.kind === "joggers" ? 356 : 340;

  return (
    <g>
      {item && <path d="M62 214 H138 V232 H62 Z" fill={adjustColor(item.color, -18)} />}
      <path
        d={
          item?.kind === "joggers"
            ? `M74 228 C72 280 74 320 78 ${hem} L92 ${hem} C90 320 92 280 96 228 Z`
            : `M66 228 C64 280 62 318 64 ${hem} L90 ${hem} C92 318 92 280 94 228 Z`
        }
        fill={fill}
      />
      <path
        d={
          item?.kind === "joggers"
            ? `M104 228 C108 280 110 320 108 ${hem} L122 ${hem} C126 320 128 280 126 228 Z`
            : `M106 228 C108 280 110 318 110 ${hem} L136 ${hem} C138 318 136 280 134 228 Z`
        }
        fill={item ? adjustColor(item.color, -10) : fill}
      />
      {item && (
        <g stroke={dark} fill="none" strokeLinecap="round">
          <path d="M100 232 V320" strokeWidth="1" opacity="0.45" />
          {item.kind === "jeans" && (
            <>
              <path d="M70 236 V332" stroke={item.accent} strokeWidth="0.9" />
              <path d="M130 236 V332" stroke={item.accent} strokeWidth="0.9" />
              <circle cx="100" cy="224" r="2.2" fill={item.accent} stroke="none" />
              <rect x="112" y="252" width="14" height="12" rx="1.5" stroke={item.accent} />
              <path d="M114 256 h10 M114 260 h8" stroke={item.accent} strokeWidth="0.7" />
            </>
          )}
          {item.kind === "chinos" && (
            <>
              <path d="M78 240 V332" strokeWidth="0.8" opacity="0.65" />
              <path d="M122 240 V332" strokeWidth="0.8" opacity="0.65" />
              <path d={`M64 ${hem - 2} H90 M110 ${hem - 2} H136`} strokeWidth="2" />
            </>
          )}
          {item.kind === "joggers" && (
            <>
              <path d="M92 226 H108" stroke={item.accent} strokeWidth="1.6" />
              <path d="M96 222 v10 M104 222 v10" stroke={item.accent} strokeWidth="1.3" />
              <path d={`M76 ${hem - 6} H94 V${hem + 4} H76 Z`} fill={dark} stroke="none" />
              <path d={`M106 ${hem - 6} H124 V${hem + 4} H106 Z`} fill={dark} stroke="none" />
            </>
          )}
        </g>
      )}
    </g>
  );
}

function Shoes({ item }: { item: ClothingItem | null }) {
  if (!item) return null;
  const main = item.color;
  const dark = adjustColor(main, -35);
  const sole = item.kind === "leather" ? "#dedcd6" : "#111827";

  if (item.kind === "canvas") {
    return (
      <g>
        <ShoeHigh x={46} color={main} sole={item.accent} lace={item.accent} toe={item.accent} />
        <ShoeHigh x={112} color={adjustColor(main, -8)} sole={item.accent} lace={item.accent} toe={item.accent} flip />
      </g>
    );
  }

  if (item.kind === "runner") {
    return (
      <g>
        <ShoeRunner x={44} color={main} stripe={item.accent} sole={dark} />
        <ShoeRunner x={108} color={adjustColor(main, -8)} stripe={item.accent} sole={dark} flip />
      </g>
    );
  }

  return (
    <g>
      <ShoeLow x={48} color={main} sole={sole} />
      <ShoeLow x={110} color={adjustColor(main, -6)} sole={sole} flip />
    </g>
  );
}

function ShoeLow({
  x,
  color,
  sole,
  flip,
}: {
  x: number;
  color: string;
  sole: string;
  flip?: boolean;
}) {
  const d = flip
    ? `M${x + 4} 372 H${x + 28} C${x + 40} 372 ${x + 46} 378 ${x + 44} 386 C${x + 42} 396 ${x + 28} 398 ${x + 8} 396 C${x - 2} 394 ${x - 2} 384 ${x + 4} 376 Z`
    : `M${x + 38} 372 H${x + 14} C${x + 2} 372 ${x - 4} 378 ${x - 2} 386 C${x} 396 ${x + 14} 398 ${x + 34} 396 C${x + 44} 394 ${x + 44} 384 ${x + 38} 376 Z`;
  return (
    <g>
      <path d={d} fill={color} />
      <path d={d} fill="none" stroke={sole} strokeWidth="3" />
    </g>
  );
}

function ShoeHigh({
  x,
  color,
  sole,
  lace,
  toe,
  flip,
}: {
  x: number;
  color: string;
  sole: string;
  lace: string;
  toe: string;
  flip?: boolean;
}) {
  return (
    <g>
      <path
        d={
          flip
            ? `M${x + 10} 300 H${x + 28} V358 H${x + 38} C${x + 50} 360 ${x + 50} 376 ${x + 42} 390 H${x + 8} C${x - 2} 386 ${x} 368 ${x + 10} 356 Z`
            : `M${x + 34} 300 H${x + 16} V358 H${x + 6} C${x - 6} 360 ${x - 6} 376 ${x + 2} 390 H${x + 36} C${x + 46} 386 ${x + 44} 368 ${x + 34} 356 Z`
        }
        fill={color}
      />
      <path
        d={flip ? `M${x + 8} 328 H${x + 30}` : `M${x + 14} 328 H${x + 36}`}
        stroke={sole}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d={flip ? `M${x + 4} 382 H${x + 44}` : `M${x} 382 H${x + 42}`}
        stroke={sole}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <ellipse cx={flip ? x + 36 : x + 8} cy="372" rx="9" ry="7" fill={toe} />
      <path
        d={
          flip
            ? `M${x + 16} 358 l6 8 M${x + 22} 358 l-6 8 M${x + 16} 366 l6 8 M${x + 22} 366 l-6 8`
            : `M${x + 20} 358 l6 8 M${x + 26} 358 l-6 8 M${x + 20} 366 l6 8 M${x + 26} 366 l-6 8`
        }
        stroke={lace}
        strokeWidth="1.3"
        fill="none"
      />
    </g>
  );
}

function ShoeRunner({
  x,
  color,
  stripe,
  sole,
  flip,
}: {
  x: number;
  color: string;
  stripe: string;
  sole: string;
  flip?: boolean;
}) {
  return (
    <g>
      <path
        d={
          flip
            ? `M${x + 8} 348 H${x + 24} V362 H${x + 34} C${x + 52} 362 ${x + 54} 376 ${x + 44} 386 H${x + 6} C${x - 6} 384 ${x - 4} 366 ${x + 8} 356 Z`
            : `M${x + 36} 348 H${x + 20} V362 H${x + 10} C${x - 8} 362 ${x - 10} 376 ${x} 386 H${x + 38} C${x + 50} 384 ${x + 48} 366 ${x + 36} 356 Z`
        }
        fill={color}
      />
      <path
        d={flip ? `M${x + 10} 366 C${x + 22} 358 ${x + 30} 374 ${x + 40} 366` : `M${x + 6} 366 C${x + 18} 358 ${x + 26} 374 ${x + 38} 366`}
        stroke={stripe}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={flip ? `M${x + 2} 388 H${x + 50}` : `M${x - 4} 388 H${x + 46}`}
        stroke={sole}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d={flip ? `M${x + 6} 394 H${x + 46}` : `M${x} 394 H${x + 42}`}
        stroke="#111827"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}

function Headwear({ item }: { item: ClothingItem | null }) {
  if (!item) return null;
  const main = item.color;
  const dark = adjustColor(main, -28);
  const light = adjustColor(item.accent, 0);

  if (item.kind === "beanie") {
    return (
      <g>
        <path d="M68 48 C66 18 82 6 100 6 C118 6 134 18 132 48 C124 36 112 32 100 32 C88 32 76 36 68 48 Z" fill={main} />
        <path d="M66 44 H134 C132 56 120 60 100 60 C80 60 68 56 66 44 Z" fill={dark} />
        <path d="M96 8 L100 2 L104 8" fill={light} />
      </g>
    );
  }

  if (item.kind === "bucket") {
    return (
      <g>
        <path d="M78 40 C78 18 122 18 122 40 C122 48 78 48 78 40 Z" fill={main} />
        <path d="M78 36 H122 V46 H78 Z" fill={dark} />
        <ellipse cx="100" cy="48" rx="46" ry="10" fill={main} />
        <ellipse cx="100" cy="48" rx="46" ry="10" fill="none" stroke={dark} strokeWidth="1.5" />
      </g>
    );
  }

  return (
    <g>
      <path d="M72 44 C72 18 84 8 100 8 C116 8 128 18 128 44 C120 32 110 28 100 28 C90 28 80 32 72 44 Z" fill={main} />
      <ellipse cx="100" cy="44" rx="32" ry="7" fill={dark} />
      <ellipse cx="100" cy="42" rx="28" ry="5" fill={main} />
      <circle cx="100" cy="18" r="2.2" fill={light} />
    </g>
  );
}

function describeOutfit(outfit: Partial<SelectedOutfit>): string {
  const names = [outfit.head, outfit.top, outfit.bottom, outfit.feet]
    .filter((item): item is ClothingItem => Boolean(item))
    .map((item) => `${item.brand} ${item.name}`);
  return names.length ? names.join(", ") : "nothing yet";
}
