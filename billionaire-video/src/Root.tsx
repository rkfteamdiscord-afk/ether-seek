import { Composition } from "remotion";
import { Scene3Yacht } from "./scene3/Scene3Yacht";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Scene3Yacht"
        component={Scene3Yacht}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
