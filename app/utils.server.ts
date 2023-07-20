import { brotliCompress, brotliDecompress } from "zlib";
import { promisify } from "util";

const compress = promisify(brotliCompress);
const decompress = promisify(brotliDecompress);

export const compressData = async (data: Buffer) => {
  const compressed = await compress(data);
  return compressed;
};

export const decompressData = async (data: Buffer) => {
  const decompressed = await decompress(data);
  return decompressed.toString("utf-8");
};
