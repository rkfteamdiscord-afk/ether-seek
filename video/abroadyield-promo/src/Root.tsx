import React from "react";
import { Composition, Folder } from "remotion";
import { Promo } from "./Promo";
import { Costs } from "./scenes/Costs";
import { Cta } from "./scenes/Cta";
import { Experts } from "./scenes/Experts";
import { Hook } from "./scenes/Hook";
import { PhotoBlitz } from "./scenes/PhotoBlitz";
import { Ranking } from "./scenes/Ranking";
import { RealNumber } from "./scenes/RealNumber";
import { UsTax } from "./scenes/UsTax";
import { Waterfall } from "./scenes/Waterfall";

// Scenes sum to 816 frames; 8 transitions overlap 92 frames → 724 frames ≈ 24.1 s.
export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Scenes">
      <Composition
        id="Hook"
        component={Hook}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={66}
      />
      <Composition
        id="Destinations"
        component={PhotoBlitz}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={124}
      />
      <Composition
        id="RealNumber"
        component={RealNumber}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={96}
      />
      <Composition
        id="Costs"
        component={Costs}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={75}
      />
      <Composition
        id="Ranking"
        component={Ranking}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={96}
      />
      <Composition
        id="Waterfall"
        component={Waterfall}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={84}
      />
      <Composition
        id="UsTax"
        component={UsTax}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={70}
      />
      <Composition
        id="Experts"
        component={Experts}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={70}
      />
      <Composition
        id="Cta"
        component={Cta}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={135}
      />
    </Folder>
    <Composition
      id="AbroadYieldPromo"
      component={Promo}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={724}
    />
  </>
);
