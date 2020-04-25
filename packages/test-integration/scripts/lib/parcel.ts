import ParcelBundler, { ParcelOptions } from "parcel-bundler";
import * as path from "path";
import { Task } from "fp-ts/lib/Task";
import { Server } from "http";

export const bundle = (config: ParcelOptions) => (
  entryFiles: string | string[]
) => new ParcelBundler(entryFiles, config);

export const project = path.resolve(__dirname, "../../");
export const temp = path.resolve(project, ".temp/dist");

const options = {
  outDir: path.resolve(temp, "dist"),
  cacheDir: path.resolve(temp, "cache"),
};

export const mybundle = bundle(options);

export const html = path.resolve(project, "./public/index.html");

export const devServer: Task<Server> = mybundle(html).serve;
