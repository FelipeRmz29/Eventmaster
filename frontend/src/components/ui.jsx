import { Link } from "react-router-dom";
import { createElement } from "react";

const cx = (...classes) => classes.filter(Boolean).join(" ");

export function Button({
  as,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  className = "",
  children,
  ...props
}) {
  const component = as || "button";
  const buttonClassName = cx(
    "ui-button",
    `ui-button-${variant}`,
    `ui-button-${size}`,
    className
  );

  const isDisabled = disabled || loading;
  const componentProps = {
    className: buttonClassName,
    "aria-busy": loading || undefined,
    ...props,
  };

  if (component === "button") {
    componentProps.disabled = isDisabled;
  } else if (isDisabled) {
    componentProps["aria-disabled"] = "true";
    componentProps.tabIndex = -1;
    componentProps.onClick = (event) => event.preventDefault();
  }

  return createElement(
    component,
    componentProps,
    <>
      {loading && <span className="ui-button-spinner" aria-hidden="true" />}
      {icon && !loading && <span className="ui-button-icon">{icon}</span>}
      <span>{children}</span>
    </>
  );
}

export function ButtonLink(props) {
  return <Button as={Link} {...props} />;
}

export function Card({ className = "", children, ...props }) {
  return (
    <section className={cx("ui-card", className)} {...props}>
      {children}
    </section>
  );
}

export function Badge({ tone = "neutral", className = "", children }) {
  return <span className={cx("ui-badge", `ui-badge-${tone}`, className)}>{children}</span>;
}

export function Input({ label, error, className = "", ...props }) {
  return (
    <label className={cx("ui-field", className)}>
      {label && <span>{label}</span>}
      <input {...props} />
      {error && <small>{error}</small>}
    </label>
  );
}

export function StatCard({ label, value, helper, tone = "neutral" }) {
  return (
    <Card className={cx("stat-card", `stat-card-${tone}`)}>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <p>{helper}</p>}
    </Card>
  );
}

export function SectionHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="section-actions">{actions}</div>}
    </div>
  );
}

export function SectionTitle({ title, subtitle, link, linkLabel = "Ver todo" }) {
  return (
    <SectionHeader
      title={title}
      description={subtitle}
      actions={
        link ? (
          <ButtonLink to={link} variant="ghost" size="sm">
            {linkLabel}
          </ButtonLink>
        ) : null
      }
    />
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty-panel">
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

export function LoadingState({ label = "Cargando..." }) {
  return (
    <div className="loading-state" role="status">
      <span />
      {label}
    </div>
  );
}
