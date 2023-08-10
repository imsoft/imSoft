import Image from "next/image";

interface Props {
  imageSrc: string;
  alt: string;
}

const ArticleImage = ({ imageSrc, alt }: Props) => {
  return (
    <>
      <Image src={imageSrc} alt={alt} width={6500} height={6500} />
    </>
  );
};

export default ArticleImage;
