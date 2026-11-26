import type { ServiceBlock, ServiceSection } from "../lib/service-text";

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function Value({ value, pending }: { value: string | null; pending: string }) {
  if (value === null) return <span className="service-pending">{pending}</span>;
  if (EMAIL.test(value))
    return (
      <a className="text-link" href={`mailto:${value}`}>
        {value}
      </a>
    );
  return value;
}

function Block({ block, pending }: { block: ServiceBlock; pending: string }) {
  if (typeof block === "string") return <p>{block}</p>;
  if ("rows" in block)
    return (
      <dl className="service-rows">
        {block.rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              <Value value={value} pending={pending} />
            </dd>
          </div>
        ))}
      </dl>
    );
  if ("list" in block)
    return (
      <ul className="service-list">
        {block.list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  if ("steps" in block)
    return (
      <ol className="service-list service-steps">
        {block.steps.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    );
  return <address className="service-address">{block.address}</address>;
}

export function ServiceSections({
  sections,
  pending,
  heading: Heading = "h3",
}: {
  sections: ServiceSection[];
  pending: string;
  heading?: "h3" | "h4";
}) {
  return sections.map(({ title, blocks }) => (
    <section key={title} className="service-section">
      <Heading>{title}</Heading>
      {blocks.map((block, index) => (
        <Block key={index} block={block} pending={pending} />
      ))}
    </section>
  ));
}
