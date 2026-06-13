'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function BlogContent({ content }: { content: string }) {
  return (
    <div className="prose prose-gray max-w-none
      prose-headings:font-black prose-headings:text-navy
      prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
      prose-h3:text-lg prose-h3:mt-7 prose-h3:mb-3
      prose-p:text-gray-600 prose-p:leading-relaxed prose-p:text-base
      prose-a:text-orange-primary prose-a:no-underline hover:prose-a:underline
      prose-strong:text-navy prose-strong:font-bold
      prose-li:text-gray-600 prose-li:leading-relaxed
      prose-ul:my-4 prose-ol:my-4
      prose-blockquote:border-l-4 prose-blockquote:border-orange-primary prose-blockquote:pl-4 prose-blockquote:text-gray-500 prose-blockquote:italic prose-blockquote:not-italic
      prose-code:text-orange-primary prose-code:bg-orange-50 prose-code:px-1 prose-code:rounded prose-code:text-sm prose-code:font-medium
      prose-pre:bg-navy prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:overflow-x-auto
      prose-hr:border-gray-200 prose-hr:my-8
      prose-img:rounded-2xl prose-img:shadow-md
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
