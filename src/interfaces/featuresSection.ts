export interface IFeaturesSection {
  topic: string;
  title: string;
  description: string;
  serviceFeatures: IServiceFeatures[];
}

export interface IServiceFeatures {
  title: string;
  description: string;
  icon: HeroIcon;
}

// type HeroIcon = (props: React.ComponentProps<"svg">) => JSX.Element;
type IconSVGProps = React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> &
  React.RefAttributes<SVGSVGElement>;
type IconProps = IconSVGProps & {
  title?: string;
  titleId?: string;
};

type HeroIcon = React.FC<IconProps>;
