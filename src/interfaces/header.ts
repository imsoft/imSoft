export interface IHeader {
  name: string;
  description?: string;
  href: string;
  icon: HeroIcon;
}

type IconSVGProps = React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> &
  React.RefAttributes<SVGSVGElement>;
type IconProps = IconSVGProps & {
  title?: string;
  titleId?: string;
};

type HeroIcon = React.FC<IconProps>;
