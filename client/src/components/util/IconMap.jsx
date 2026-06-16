import React from "react";
import {
  IconActivity,
  IconArcheryArrow,
  IconBallAmericanFootball,
  IconBallBaseball,
  IconBallBasketball,
  IconBallFootball,
  IconBallTennis,
  IconBallVolleyball,
  IconBarbell,
  IconBeach,
  IconBed,
  IconBike,
  IconBodyScan,
  IconBowling,
  IconBrain,
  IconCricket,
  IconCurling,
  IconDeer,
  IconDeviceGamepad2,
  IconDiscGolf,
  IconFish,
  IconFlame,
  IconGolf,
  IconGymnastics,
  IconHeartbeat,
  IconHorse,
  IconIceSkating,
  IconJumpRope,
  IconKarate,
  IconKayak,
  IconMountain,
  IconPingPong,
  IconPlayHandball,
  IconRugby,
  IconRun,
  IconSailboat,
  IconSkiJumping,
  IconSnowboarding,
  IconSnowflake,
  IconStairs,
  IconStopwatch,
  IconStretching,
  IconSwimming,
  IconTrekking,
  IconWalk,
  IconWaterpolo,
  IconWheelchair,
  IconYinYang,
  IconYoga,
} from "@tabler/icons-react";
import { BoxingGlove, Hockey, Racquet, Sword } from "@phosphor-icons/react";

// Workout activity icons. Free, self-hosted (Tabler + Phosphor, both MIT) so
// nothing here depends on the FontAwesome kit. Color is inherited from the
// parent via currentColor; size is fixed for the compact nav row.
const SIZE = 20;

// Tabler icons take a numeric `stroke` (width); Phosphor inherit currentColor.
const t = (Icon) => <Icon size={SIZE} stroke={1.75} />;
const p = (Icon) => <Icon size={SIZE} />;
const emoji = (glyph, label) => (
  <span
    role="img"
    aria-label={label}
    style={{ fontSize: "1.05rem", lineHeight: 1 }}
  >
    {glyph}
  </span>
);

const iconMap = {
  Pickleball: p(Racquet),
  "American Football": t(IconBallAmericanFootball),
  Archery: t(IconArcheryArrow),
  "Australian Football": t(IconBallAmericanFootball),
  Badminton: p(Racquet),
  Baseball: t(IconBallBaseball),
  Basketball: t(IconBallBasketball),
  Bowling: t(IconBowling),
  Boxing: p(BoxingGlove),
  Climbing: t(IconMountain),
  Cricket: t(IconCricket),
  "Cross Training": t(IconBarbell),
  Curling: t(IconCurling),
  Cycling: t(IconBike),
  Dance: emoji("💃", "Dance"),
  Elliptical: t(IconRun),
  "Equestrian Sports": t(IconHorse),
  Fencing: p(Sword),
  Fishing: t(IconFish),
  "Functional Strength Training": t(IconBarbell),
  Golf: t(IconGolf),
  Gymnastics: t(IconGymnastics),
  Handball: t(IconPlayHandball),
  Hiking: t(IconTrekking),
  Hockey: p(Hockey),
  Hunting: t(IconDeer),
  Lacrosse: emoji("🥍", "Lacrosse"),
  "Martial Arts": t(IconKarate),
  "Mind and Body": t(IconBrain),
  "Paddle Sports": t(IconKayak),
  Play: t(IconDeviceGamepad2),
  "Preparation and Recovery": t(IconBed),
  Racquetball: p(Racquet),
  Rowing: t(IconKayak), // generic: no rowing/oar icon in Tabler or Phosphor
  Rugby: t(IconRugby),
  Running: t(IconRun),
  Sailing: t(IconSailboat),
  "Skating Sports": t(IconIceSkating),
  "Snow Sports": t(IconSnowflake),
  Soccer: t(IconBallFootball),
  Softball: t(IconBallBaseball),
  Squash: p(Racquet),
  "Stair Climbing": t(IconStairs),
  "Surfing Sports": t(IconBeach), // generic: no surfer glyph available
  Swimming: t(IconSwimming),
  "Table Tennis": t(IconPingPong),
  Tennis: t(IconBallTennis),
  "Track and Field": t(IconStopwatch),
  "Traditional Strength Training": t(IconBarbell),
  Volleyball: t(IconBallVolleyball),
  Walking: t(IconWalk),
  "Water Fitness": t(IconSwimming),
  "Water Polo": t(IconWaterpolo),
  "Water Sports": t(IconWaterpolo),
  Wrestling: t(IconKarate), // generic: Tabler/Phosphor have no wrestling icon
  Yoga: t(IconYoga),
  Barre: t(IconStretching),
  "Core Training": t(IconBodyScan),
  "Cross Country Skiing": t(IconSkiJumping),
  "Downhill Skiing": t(IconSkiJumping),
  Flexibility: t(IconStretching),
  "High Intensity Interval Training": t(IconFlame),
  "Jump Rope": t(IconJumpRope),
  Kickboxing: p(BoxingGlove),
  Pilates: t(IconStretching),
  Snowboarding: t(IconSnowboarding),
  "Step Training": t(IconStairs),
  "Wheelchair Walk Pace": t(IconWheelchair),
  "Wheelchair Run Pace": t(IconWheelchair),
  "Tai Chi": t(IconYinYang),
  "Mixed Cardio": t(IconHeartbeat),
  "Hand Cycling": t(IconWheelchair),
  "Disc Sports": t(IconDiscGolf),
  "Fitness Gaming": t(IconDeviceGamepad2),
  "Other Activity": t(IconActivity),
};

export default iconMap;
