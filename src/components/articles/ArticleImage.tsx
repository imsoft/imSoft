import Image from "next/image";

interface Props {
  imageSrc: string;
  alt: string;
}

const ArticleImage = ({ imageSrc, alt }: Props) => {
  return (
    <>
      <Image src={imageSrc} alt={alt} width={650} height={650} />
    </>
  );
};

export default ArticleImage;
