import { ChevronsRight } from "react-feather";

import Image from "next/image";
import Link from "next/link";

interface BlogCardProps {
  title: string;
  date: string;
  forwardLink: string;
  bgImageUrl: string;
}

const BlogCard = ({ title, date, forwardLink, bgImageUrl }: BlogCardProps) => {
  return (
    <Link className="no-underline" href={forwardLink} target="_blank">
      <div className="w-full h-fit md:h-64 xl:h-72 p-5 md:p-6 rounded-md md:rounded-lg border-black/25 relative overflow-hidden group">
        <Image className="object-cover" src={bgImageUrl} alt={`blog-${title}`} fill />
        <div className="overlay absolute top-0 bottom-0 left-0 right-0 bg-black/50 backdrop-blur-[2px] group-hover:backdrop-blur transition-[backdrop-filter]" />

        <div className="relative z-10 flex flex-col md:h-full">
          <p className="text-white text-lg md:text-xl font-bold mb-10 md:mb-4">{title}</p>

          <div className="text-white/60 text-xs md:text-sm font-normal flex justify-between md:flex-col md:flex-grow">
            <p>{date}</p>
            <div className="flex gap-1 items-center">
              <p>자세히 보기</p>
              <ChevronsRight size={14} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
