declare module "about/AboutApp" {
  const AboutApp: () => import("react").ReactElement;
  export default AboutApp;
}

declare module "posts/PostsApp" {
  const PostsApp: () => import("react").ReactElement;
  export default PostsApp;
}

declare module "shikaku/ShikakuApp" {
  const ShikakuApp: () => import("react").ReactElement;
  export default ShikakuApp;
}

declare module "pets/PetsApp" {
  interface PetsProgressState {
    state: {
      pet: {
        xp: number;
        stage: number;
        lastFedAt: number;
        happiness: number;
        lastPlayedAt: number;
        isSleeping: boolean;
      };
      completedLevels: unknown[];
      foodConsumed: number;
    };
    isHungry: boolean;
    foodAvailable: number;
    hungryLevel: number;
    happiness: number;
    isSleeping: boolean;
    feedPet: () => Promise<void>;
    playWithPet: () => Promise<void>;
    toggleSleep: () => Promise<void>;
  }
  const PetsApp: (props: {
    progressState?: PetsProgressState;
  }) => import("react").ReactElement;
  export default PetsApp;
}

declare module "sokoban/SokobanApp" {
  const SokobanApp: () => import("react").ReactElement;
  export default SokobanApp;
}

declare module "slitherlink/SlitherlinkApp" {
  const SlitherlinkApp: () => import("react").ReactElement;
  export default SlitherlinkApp;
}

