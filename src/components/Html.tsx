export default function Html({ html, ...props }: {
  html: string,
  [key: string]: any,
}) {
  return <div dangerouslySetInnerHTML={{ __html: html }} {...props} />;
};
