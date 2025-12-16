import { Label } from '@/components/ui/label';

interface SettingRowProps {
    id: string;
    title: string;
    description: string;
    children: React.ReactNode;
}

export const SettingRow = ({ id, title, description, children }: SettingRowProps) => (
    <div className="flex items-start justify-between">
        <Label htmlFor={id} className="flex flex-col gap-1 text-left items-start">
            <span>{title}</span>
            <span className="font-normal text-muted-foreground text-sm">
                {description}
            </span>
        </Label>
        {children}
    </div>
);
