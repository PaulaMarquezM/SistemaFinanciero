import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  enabled: boolean;
  style?: React.CSSProperties; // Agregamos esto para recibir estilos extra
}

export function SortableItem({ id, children, enabled, style: propStyle }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: enabled ? (isDragging ? 'grabbing' : 'grab') : 'default',
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
    position: 'relative' as 'relative',
    height: '100%', // Asegura que llene la celda del grid
    ...propStyle // Aquí aplicamos el estilo que viene de fuera (el gridColumn)
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...(enabled ? listeners : {})}>
      {children}
    </div>
  );
}