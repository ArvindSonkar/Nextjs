import { FC, ReactNode } from "react";

interface BlogsLayout {
  children: ReactNode;
}

const BlogsLayout: FC<BlogsLayout> = ({ children }) => {
  return (
    <>
      <div>Blogs Layout</div>
      {children}
    </>
  );
};

export default BlogsLayout;
