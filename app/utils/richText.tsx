import { Fragment, type ReactNode } from "react";

const TOKEN = /<br\s*\/?>|<\/?(?:em|b|strong|i)>/gi;

export default function richText(value: string): ReactNode {
  if (!value || !TOKEN.test(value)) return value;
  TOKEN.lastIndex = 0;

  const out: ReactNode[] = [];
  let emphasis: string[] = [];
  let cursor = 0;
  let key = 0;

  const push = (text: string) => {
    if (!text) return;
    out.push(emphasis.length ? <em key={key++}>{text}</em> : <Fragment key={key++}>{text}</Fragment>);
  };

  for (let m = TOKEN.exec(value); m; m = TOKEN.exec(value)) {
    push(value.slice(cursor, m.index));
    cursor = m.index + m[0].length;

    const tag = m[0].toLowerCase();
    if (tag.startsWith("<br")) out.push(<br key={key++} />);
    else if (tag.startsWith("</")) emphasis.pop();
    else emphasis.push(tag);
  }
  push(value.slice(cursor));

  return out;
}
