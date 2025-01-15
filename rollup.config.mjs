import dts from "rollup-plugin-dts";
import typescript from "@rollup/plugin-typescript";
import filesize from 'rollup-plugin-filesize';

const outputFileName = 'magicon';
const inputs = ['./src/magicon.ts'];

export default [
  {
    input: inputs[0],
    external: ['react'],
    output: [
      {
        file: `dist/esm/${outputFileName}.js`,
        format: "es",
      },
      {
        file: `dist/cjs/${outputFileName}.js`,
        format: "cjs",
      },
    ],
    plugins: [
      filesize(),
      typescript({
        tsconfig: "./tsconfig.json"
      }),
    ],
  },
  {
    input: inputs[0],
    external: ['react'],
    output: [
      {
        file: `dist/esm/${outputFileName}.d.ts`,
        format: "es",
      },
    ],
    plugins: [dts()],
  },
];