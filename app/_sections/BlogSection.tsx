import { ExternalLink } from "react-feather";

import BlogCard from "@/_components/BlogCard";
import SectionWatcher from "@/_components/SectionWatcher";
import SlideUpInView from "@/_components/SlideUpInView";
import CTAButton from "@/_components/buttons/CTAButton";
import prisma from "@/lib/prisma";

const BLOG_LINK = "https://velog.io/@bestdevmgp";

async function getBlogs() {
  const response = await prisma.blog.findMany();
  return response;
}

export default async function BlogSection() {
  const blogs = await getBlogs();

  return (
    <SectionWatcher id="blog">
      <SlideUpInView>
        <h2 className="section-eyebrow">블로그</h2>
        <p className="section-title">
          자세한 문제해결 과정은
          <br />
          블로그에서 확인할 수 있습니다.
        </p>

        <div className="cards grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-11">
          {blogs.map(props => (
            <BlogCard key={`blog-card-${props.id}`} {...props} />
          ))}
        </div>

        <CTAButton
          label="블로그로 이동"
          suffix={<ExternalLink className="w-4 h-4" />}
          link={BLOG_LINK}
          className="mx-auto"
        />
      </SlideUpInView>
    </SectionWatcher>
  );
}
