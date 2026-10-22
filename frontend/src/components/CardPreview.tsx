import type { CSSProperties } from "react";
import type { CardCustomization } from "../types";

type Props = {
  custom: CardCustomization;
  className?: string;
};

function nameSize(name: string): string {
  if (name.length > 20) return "5.5cqw";
  if (name.length > 14) return "6.5cqw";
  return "8.5cqw";
}

function Contacts({ custom, style }: { custom: CardCustomization; style: CSSProperties }) {
  const rows = [custom.text.phone, custom.text.email, custom.text.website, custom.text.address].filter(Boolean);
  if (rows.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-[3cqw] gap-y-[0.6cqw]" style={style}>
      {rows.map((row, i) => (
        <span key={i} className="whitespace-nowrap">
          {row}
        </span>
      ))}
    </div>
  );
}

export default function CardPreview({ custom, className = "" }: Props) {
  const { bg, accent, font, text, template } = custom;
  const fontStyle: CSSProperties = { fontFamily: `"${font}", serif` };
  const nameStyle: CSSProperties = { ...fontStyle, fontSize: nameSize(text.name), lineHeight: 1.08, color: accent };
  const metaStyle: CSSProperties = {
    ...fontStyle,
    fontSize: "3cqw",
    letterSpacing: "0.08em",
    color: accent,
    opacity: 0.75,
  };
  const contactStyle: CSSProperties = { ...fontStyle, fontSize: "2.3cqw", color: accent, opacity: 0.85 };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[1.2cqw] shadow-card ${className}`}
      style={{
        aspectRatio: "350 / 200",
        containerType: "inline-size",
        backgroundColor: bg,
      }}
      data-template={template}
    >
      {template === "classic" && (
        <div className="flex h-full flex-col items-center justify-between px-[8cqw] py-[7cqw]">
          <span className="text-[1.8cqw] tracking-[0.5em] uppercase" style={{ ...fontStyle, color: accent, opacity: 0.5 }}>
            {text.company || "\u00A0"}
          </span>
          <div className="flex flex-col items-center gap-[2.5cqw]">
            <h3 className="text-center" style={nameStyle}>{text.name || "Votre nom"}</h3>
            <span className="h-[0.25cqw] w-[30cqw]" style={{ backgroundColor: accent }} />
            <p style={metaStyle}>{[text.title, text.company].filter(Boolean).join(" · ")}</p>
          </div>
          <Contacts custom={custom} style={contactStyle} />
        </div>
      )}

      {template === "minimal" && (
        <div className="flex h-full flex-col justify-between px-[8cqw] py-[7cqw]">
          <div>
            <p className="text-[2cqw] uppercase tracking-[0.4em]" style={metaStyle}>
              {text.company || "Carte de visite"}
            </p>
            <h3 className="mt-[2cqw]" style={nameStyle}>{text.name || "Votre nom"}</h3>
          </div>
          <div className="flex flex-wrap gap-x-[3cqw] gap-y-[0.8cqw]">
            {[text.phone, text.email, text.website, text.address].filter(Boolean).map((row, i) => (
              <span key={i} className="flex items-center gap-[1.4cqw] whitespace-nowrap" style={contactStyle}>
                <span className="h-[1cqw] w-[1cqw] rounded-full" style={{ backgroundColor: accent }} />
                {row}
              </span>
            ))}
          </div>
        </div>
      )}

      {template === "bold" && (
        <div className="flex h-full flex-col justify-between px-[8cqw] py-[6.5cqw]">
          <div className="flex items-start justify-between">
            <span className="h-[1.4cqw] w-[22cqw]" style={{ backgroundColor: accent }} />
            <span className="text-[1.8cqw] tracking-[0.4em] uppercase" style={{ ...fontStyle, color: accent, opacity: 0.6 }}>
              {text.company || "CARTE"}
            </span>
          </div>
          <div className="flex items-end justify-between gap-[4cqw]">
            <h3 className="max-w-[60cqw] leading-tight" style={{ ...nameStyle, textTransform: "uppercase" }}>
              {text.name || "Votre nom"}
            </h3>
            <div className="flex flex-col items-end gap-[1cqw] text-end" style={contactStyle}>
              {[text.title, text.phone, text.email, text.website].filter(Boolean).map((row, i) => (
                <span key={i} className="whitespace-nowrap">{row}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {template === "elegant" && (
        <div className="relative flex h-full flex-col items-center justify-between px-[8cqw] py-[6cqw]">
          <span className="absolute start-[6cqw] top-[4.5cqw] w-[10cqw] border-t-[0.2cqw]" style={{ borderColor: accent }} />
          <span className="absolute end-[6cqw] top-[4.5cqw] w-[10cqw] border-t-[0.2cqw]" style={{ borderColor: accent }} />
          <div className="flex flex-col items-center gap-[1.5cqw] pt-[2cqw]">
            <p className="text-[2.2cqw] tracking-[0.35em] uppercase" style={metaStyle}>
              {text.company || "Carte de visite"}
            </p>
            <h3 className="text-center italic" style={nameStyle}>{text.name || "Votre nom"}</h3>
            <p className="text-[2.6cqw]" style={metaStyle}>{text.title || "\u00A0"}</p>
          </div>
          <Contacts custom={custom} style={contactStyle} />
          <span className="absolute bottom-[4.5cqw] start-[6cqw] w-[10cqw] border-t-[0.2cqw]" style={{ borderColor: accent }} />
          <span className="absolute bottom-[4.5cqw] end-[6cqw] w-[10cqw] border-t-[0.2cqw]" style={{ borderColor: accent }} />
        </div>
      )}

      <span
        className="pointer-events-none absolute bottom-[2cqw] end-[3cqw] text-[1.6cqw] tracking-[0.35em] uppercase opacity-25"
        style={{ ...fontStyle, color: accent }}
      >
        Cartelier
      </span>
    </div>
  );
}
