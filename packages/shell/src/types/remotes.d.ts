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
  const PetsApp: (props: {
    usePetStore?: import("zustand").UseBoundStore<
      import("zustand").StoreApi<{
        hunger: number;
        happiness: number;
        isSleeping: boolean;
        status: "idle" | "eating" | "playing" | "sleeping";
        feed: () => void;
        play: () => void;
        toggleSleep: () => void;
        setStatus: (status: "idle" | "eating" | "playing" | "sleeping") => void;
        tick: () => void;
      }>
    >;
  }) => import("react").ReactElement;
  export default PetsApp;
}

declare module "sokoban/SokobanApp" {
  const SokobanApp: () => import("react").ReactElement;
  export default SokobanApp;
}
