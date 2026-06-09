export default function PostContent({ html }: { html: string }) {
  return (
    <div
      className="wp-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
