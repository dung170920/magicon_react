import fs from "fs-extra";
import path from "path";
import { parse } from "svgson";
import { IconSvg } from "../src/create-component";
import { toPascalCase } from "../helpers";
import { ReactSVGElement } from "react";

const createReactComponentCode = (iconName: string, iconSvgs: Record<"outline" | "filled", IconSvg>) => {
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
      ${
        iconSvgs["outline"]
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

const buildIcons = async (sourceDir: string, outputDir: string) => {
  const outlineDir = path.join(sourceDir, "Outline");
  const filledDir = path.join(sourceDir, "Filled");

  const outlineFiles = await fs.readdir(outlineDir);
  const filledFiles = await fs.readdir(filledDir);

  const commonFiles = outlineFiles.filter((file) => filledFiles.includes(file) && file.endsWith(".svg"));

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

    console.log(`Đã tạo: ${outputFilePath}`);
  }
};

const parseSvgContent = async (svgContent: string): Promise<IconSvg> => {
  const parsed = await parse(svgContent);
  return parsed.children.map((child) => [child.name as keyof ReactSVGElement, child.attributes || {}]) as IconSvg;
};

const build = async () => {
  try {
    const sourceDir = path.resolve("./icons");
    const outputDir = path.resolve("./src/icons");

    await buildIcons(sourceDir, outputDir);

    console.log("Hoàn thành việc tạo icons!");
  } catch (err) {
    console.error("Lỗi khi tạo icons:", err);
  }
};

build();
