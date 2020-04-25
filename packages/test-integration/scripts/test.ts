// read files in directory
// each file is test
// each file exports a function
import { taskEither, array } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { TaskEither, taskify } from "fp-ts/lib/TaskEither";
import * as fs from "fs";
import * as path from "path";
import { project } from "./lib/parcel";
import { flow, identity } from "fp-ts/lib/function";
import { Task } from "fp-ts/lib/Task";
import { Page } from "playwright";

export const readdir: (
  path: fs.PathLike,
  options: { withFileTypes: true }
) => TaskEither<NodeJS.ErrnoException, fs.Dirent[]> = taskify(fs.readdir);

const testDir = path.resolve(project, "tests");

const prop = <T extends {}, K extends keyof T>(k: K) => (t: T) => t[k];

const validate = (dirents: fs.Dirent[]) =>
  pipe(
    dirents,
    array.filter((dirent) => dirent.isFile()),
    array.filter(
      flow(prop("name"), path.extname, (ext) => ext === ".tsx" || ext === ".ts")
    )
  );

// run file?

const dynamic = <T>(p: string): TaskEither<NodeJS.ErrnoException, T> =>
  taskEither.tryCatch(
    () => import(p),
    (a) => a as NodeJS.ErrnoException
  );

type Test = { test: (page: Page) => Promise<void> };

const main = pipe(
  readdir(testDir, { withFileTypes: true }),
  taskEither.map(
    // read each file
    flow(
      validate,
      array.map(
        flow(prop("name"), (filename) => path.resolve(testDir, filename))
      )
    )
  ),
  taskEither.chain(
    flow(
      array.map((a) => dynamic<Test>(a)),
      array.array.sequence(taskEither.taskEither)
    )
  )
);

main();
