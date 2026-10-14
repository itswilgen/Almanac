import { useEffect, useRef, type ReactNode } from "react";
import { ArrowUpRight, Flower2, X } from "lucide-react";
import { Link } from "react-router-dom";
export function Brand() {
  return (
    <Link className="brand" to="/">
      <Flower2 size={30} strokeWidth={1.3} />
      <span>
        almanac<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
export function ErrorMessage({ message }: { message: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (message) ref.current?.focus();
  }, [message]);
  return message ? (
    <div ref={ref} tabIndex={-1} role="alert" className="error">
      {message}
    </div>
  ) : null;
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
          ),
        ).filter((control) => control.getClientRects().length > 0);
        const first = controls[0],
          last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <header>
        <div>
          <p className="eyebrow">YOUR JOURNAL</p>
          <h2 id="dialog-title">{title}</h2>
        </div>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <Brand />
      <p>Your body. Your rhythm. Your record.</p>
      <div>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/learn">
          Learn <ArrowUpRight size={14} />
        </Link>
      </div>
    </footer>
  );
}
