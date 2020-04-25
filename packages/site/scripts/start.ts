import ParcelBundler from "parcel-bundler";
import path from "path";

const projectDir = path.resolve(__dirname, "../");
const tempDir = path.resolve(projectDir, "./.temp");

const start = async () => {
  const bundler = new ParcelBundler(
    path.resolve(projectDir, "./public/index.html"),
    {
      cacheDir: path.resolve(tempDir, "./cache"),
      outDir: path.resolve(tempDir, "./dist")
    }
  );

  await bundler.serve();
};

start();
