import { useRef, useState } from "react";

/** "Copy" button that sits right after the text it copies. Falls back to selecting that text. */
export default function CopyButton({ text }: { text: string }) {
  const [label, setLabel] = useState("Copy");
  const ref = useRef<HTMLButtonElement>(null);

  const onClick = () => {
    const select = () => {
      const t = ref.current?.previousElementSibling;
      if (t) {
        const r = document.createRange();
        r.selectNodeContents(t);
        const w = getSelection();
        w?.removeAllRanges();
        w?.addRange(r);
      }
      setLabel("Selected");
    };
    try {
      navigator.clipboard.writeText(text).then(() => setLabel("Copied"), select);
    } catch {
      select();
    }
    setTimeout(() => setLabel("Copy"), 2000);
  };

  return (
    <button type="button" className="copy" ref={ref} onClick={onClick}>
      {label}
    </button>
  );
}
