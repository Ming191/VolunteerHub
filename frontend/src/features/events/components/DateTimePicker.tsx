import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { RippleButton } from '@/components/animate-ui/components/buttons/ripple';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
    value?: Date;
    onChange: (date: Date | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    disablePastDates?: boolean;
}

export const DateTimePicker = ({
    value,
    onChange,
    placeholder = 'Pick a date and time',
    disabled = false,
    disablePastDates = true,
}: DateTimePickerProps) => {
    const handleTimeChange = (timeString: string) => {
        if (!timeString) return;

        const [hours, minutes] = timeString.split(':');
        const newDate = value ? new Date(value) : new Date();
        newDate.setHours(parseInt(hours), parseInt(minutes));
        onChange(newDate);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <RippleButton
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        'w-full pl-3 text-left font-normal border-2 hover:border-green-300 focus:border-green-500 transition-colors',
                        !value && 'text-muted-foreground'
                    )}
                >
                    {value ? format(value, 'PPP p') : <span>{placeholder}</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </RippleButton>
            </PopoverTrigger>
            <PopoverContent className="w-full min-w-[320px] p-0 bg-white shadow-xl border-2" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    disabled={disablePastDates ? (date) => date < new Date() : undefined}
                />
                <div className="p-3 border-t">
                    <Input
                        type="time"
                        value={value ? format(value, 'HH:mm') : ''}
                        onChange={(e) => handleTimeChange(e.target.value)}
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}

