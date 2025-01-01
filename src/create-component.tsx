import { createElement, forwardRef, ForwardRefExoticComponent, ReactSVGElement, RefAttributes, SVGProps } from "react";
import defaultAttributes from "./defaultAttributes";

export type IconSvg = [elementName: keyof ReactSVGElement, attrs: Record<string, string>][];

type SvgProps = RefAttributes<SVGSVGElement> & Partial<SVGProps<SVGSVGElement>>;

export interface IconProps extends SvgProps {
  size?: string | number;
}

export type MagiconIcon = ForwardRefExoticComponent<IconProps>;

const createReactComponent = (
  variant: 'outline' | 'filled',
  iconName: string,
  iconSvg: IconSvg,
) => {
  const Component: React.FC<React.PropsWithoutRef<IconProps> & React.RefAttributes<SVGSVGElement>> = forwardRef<SVGSVGElement, IconProps>(
    (
      { color = 'currentColor', size = 24, className, children, strokeWidth = 1.5, ...rest }: IconProps,
      ref,
    ) =>
      createElement(
        'svg',
        {
          ref,
          ...defaultAttributes[variant],
          width: size,
          height: size,
          className,
          ...(variant === 'filled'
            ? {
              fill: color,
            }
            : {
              strokeWidth,
              stroke: color,
            }),
          ...rest,
        },
        [
          ...iconSvg.map(([tag, attrs]) => createElement(tag, attrs)),
          ...(Array.isArray(children) ? children : [children]),
        ],
      ),
  );

  Component.displayName = `${iconName}Icon`;

  return Component;
};

export default createReactComponent;