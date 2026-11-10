import { Check, Copy } from 'lucide-react';
import { useCopy } from '../../hooks/useCopy';
import { useToast } from '../../context/ToastContext';

interface Props {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}

export function CopyButton({ text, label = 'Kopieren', copiedLabel = 'Kopiert!', className = 'btn-secondary' }: Props) {
  const { copied, copy } = useCopy();
  const toast = useToast();
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        const ok = await copy(text);
        if (!ok) toast('Kopieren fehlgeschlagen', 'error');
      }}
      aria-label={label}
    >
      {copied ? <Check className="h-4 w-4 text-accent-500" /> : <Copy className="h-4 w-4" />}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
