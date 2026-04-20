import type { AnchorHTMLAttributes, ReactNode } from "react";

type InlineLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "children"
> & {
  href: string;
  children: ReactNode;
};

/**
 * External link for use inside running prose. Keeps JSX compact: wrap only the linked span.
 */
export function InlineLink({
  href,
  children,
  className,
  target = "_blank",
  rel = "noopener noreferrer",
  ...rest
}: InlineLinkProps) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      style={{ textDecoration: "underline" }}
      {...rest}
    >
      {children}
    </a>
  );
}
