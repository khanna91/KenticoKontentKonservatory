import type { Preload } from "@sapper/common";

export type Preload<TProps, TSession = {}> = {
  (
    this: Preload.PreloadContext,
    page: Preload.Page,
    session: TSession | undefined
  ): TProps | Promise<TProps>;
};
