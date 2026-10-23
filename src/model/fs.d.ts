namespace NFileSystem {
  interface Stats {
    birthtime: Date;
    ctime: Date;
    atime: Date;
    mtime: Date;
  }

  interface ReadPictureResolveFace {
    buffer: Buffer<ArrayBuffer>;
    resolution: {
      width: number;
      height: number;
      orientation?: number;
      type?: string;
    };
    type: { readonly ext: string; readonly mime: string } | undefined;
    stats: Stats;
    path: string;
  }
}
