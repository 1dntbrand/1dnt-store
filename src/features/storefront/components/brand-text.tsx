import { Fragment } from "react";

/** Keep the registered mark attached to the material name at any heading size. */
export function BrandText({ children }: { children: string }) {
  return children.split(/(BioThane®)/).map((part, index) =>
    part === "BioThane®" ? (
      <span className="biothane-wordmark" key={index}>
        BioThane<sup className="biothane-registered">®</sup>
      </span>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}
