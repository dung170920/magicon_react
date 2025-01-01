import dts from "rollup-plugin-dts";
import typescript from "@rollup/plugin-typescript";

const outputFileName = 'magicon-react';
const inputs = ['./src/magicon-react.ts'];

export default [
  {
    input: inputs[0],
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
      typescript({
        tsconfig: "./tsconfig.json"
      }),
    ],
  },
  {
    input: inputs[0],
    output: [
      {
        file: `dist/esm/${outputFileName}.d.ts`,
        format: "es",
      },
    ],
    plugins: [dts()],
  },
];