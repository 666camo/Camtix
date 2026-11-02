export default function PageHeading({ eyebrow, title, accent, description, variant = 'display' }) {
  return (
    <header className={`page-heading page-heading--${variant}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}{accent && <> <span>{accent}</span></>}</h1>
      {description && <p className="page-description">{description}</p>}
    </header>
  );
}
