import { ComponentType, SVGProps } from 'react';

export type SvgIconSource = {
  component?: ComponentType<SVGProps<SVGSVGElement>>;
  raw?: string;
  url?: string;
};

export type SvgIconProps = SvgIconSource & {
  className?: string;
  title?: string;
};
