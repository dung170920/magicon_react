import fs from "fs-extra";
import path from "path";
import { parse } from "svgson";

const toPascalCase = (str) => {
  return str
    .replace(/[-_]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/(^\w|[A-Z]|\b\w)/g, (char) => char.toUpperCase());
};

const createReactComponentCode = (iconName, iconSvgs) => {
  return `
import React, { createElement, forwardRef } from 'react';
import defaultAttributes from '../defaultAttributes';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  variant?: 'outline' | 'filled';
}

const ${iconName} = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24, variant = 'outline', strokeWidth = 1.5, ...props }, ref) =>
    createElement(
      'svg',
      {
        ref,
        ...defaultAttributes[variant],
        width: size,
        height: size,
        ...(variant === 'filled' ? { fill: color } : { stroke: color, strokeWidth }),
        ...props,
      },
      ${iconSvgs["outline"]
      .map(([tag, attrs]) => `variant === 'outline' && createElement('${tag}', ${JSON.stringify(attrs)})`)
      .join(",\n") +
    "," +
    iconSvgs["filled"]
      .map(([tag, attrs]) => `variant === 'filled' && createElement('${tag}', ${JSON.stringify(attrs)})`)
      .join(",")
    }
    ),
);

${iconName}.displayName = '${iconName}';
export default ${iconName};
  `;
};

const buildIcons = async (sourceDir, outputDir) => {
  const outlineDir = path.join(sourceDir, "Outline");
  const filledDir = path.join(sourceDir, "Filled");

  const outlineFiles = await fs.readdir(outlineDir);
  const filledFiles = await fs.readdir(filledDir);

  const commonFiles = outlineFiles.filter((file) => filledFiles.includes(file) && file.endsWith(".svg"));
  const exportStatements = [];
  for (const file of commonFiles) {
    const outlineFilePath = path.join(outlineDir, file);
    const filledFilePath = path.join(filledDir, file);

    const outlineContent = await fs.readFile(outlineFilePath, "utf-8");
    const filledContent = await fs.readFile(filledFilePath, "utf-8");

    const outlineSvg = await parseSvgContent(outlineContent);
    const filledSvg = await parseSvgContent(filledContent);

    const iconName = toPascalCase(file.replace(".svg", ""));
    const componentCode = createReactComponentCode(iconName, {
      outline: outlineSvg,
      filled: filledSvg,
    });

    const outputFilePath = path.join(outputDir, `${iconName}.tsx`);
    await fs.ensureDir(outputDir);
    await fs.writeFile(outputFilePath, componentCode, "utf-8");

    exportStatements.push(`export { default as ${iconName} } from './${iconName}';`);
  }
  const indexFilePath = path.join(outputDir, "index.ts");
  await fs.writeFile(indexFilePath, exportStatements.join("\n"), "utf-8");
};

const parseSvgContent = async (svgContent) => {
  const parsed = await parse(svgContent);
  return parsed.children.map((child) => [child.name, child.attributes || {}]);
};

const build = async () => {
  try {
    const sourceDir = path.resolve("./icons");
    const outputDir = path.resolve("./src/icons");

    await buildIcons(sourceDir, outputDir);
  } catch (err) {
    console.error("err:", err);
  }
};

build();
