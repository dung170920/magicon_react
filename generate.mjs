import fs from "fs-extra";
import path from "path";
import { parse } from "svgson";
import { optimize } from 'svgo';

const toPascalCase = (str) => {
  return str
    .replace(/[-_]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/(^\w|[A-Z]|\b\w)/g, (char) => char.toUpperCase());
};

const cleanSvgContent = (svgContent) => {
  const result = optimize(svgContent, {
    plugins: [
      { name: 'removeDimensions', active: true },
      { name: 'removeAttrs', params: { attrs: '(id|class|stroke|fill)' } },
      { name: 'removeComments', active: true },
      { name: 'removeEmptyContainers', active: true },
    ],
  });
  return result.data;
};

const createReactComponentCode = (iconName, iconSvgs) => {
  return `
import React, { createElement, forwardRef } from 'react';

export interface IconProps  {
  size?: string | number;
  variant?: 'outline' | 'filled';
  className?: string;
  color?: string;
}

const ${iconName} = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24, variant = 'outline', className, ...props }, ref) =>
    createElement(
      'svg',
      {
        ref,
        height: size,
        width: size,
        fill: color,
        viewBox: '0 0 24 24',
        className,
        ...props
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

    let outlineContent = await fs.readFile(outlineFilePath, "utf-8");
    let filledContent = await fs.readFile(filledFilePath, "utf-8");

    outlineContent = cleanSvgContent(outlineContent);
    filledContent = cleanSvgContent(filledContent);

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
