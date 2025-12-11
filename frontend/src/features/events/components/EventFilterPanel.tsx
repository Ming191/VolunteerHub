import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useGetEventTags } from '../hooks/useEventTags';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { SearchEventsParams } from '../api/eventService';

type FilterState = Omit<SearchEventsParams, 'page' | 'size'>;

interface EventFilterPanelProps {
    onFilterChange: (filters: FilterState) => void;
    initialFilters?: FilterState;
}

export default function EventFilterPanel({ onFilterChange, initialFilters }: EventFilterPanelProps) {
    const { data: tags } = useGetEventTags();
    const [filters, setFilters] = useState<FilterState>(initialFilters || {
        q: '',
        location: '',
        tags: [],
        upcoming: false, // Default to false if not provided, to catch more events
        matchAllTags: false,
    });
    const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);

    const handleApplyFilters = () => {
        onFilterChange(filters);
    };

    const handleClearFilters = () => {
        const clearedFilters: FilterState = {
            q: '',
            location: '',
            tags: [],
            upcoming: true,
            matchAllTags: false,
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    const handleTagSelect = (tagValue: string) => {
        setFilters((prev) => {
            const newTags = prev.tags?.includes(tagValue)
                ? prev.tags.filter((t) => t !== tagValue)
                : [...(prev.tags || []), tagValue];
            return { ...prev, tags: newTags };
        });
    };

    return (
        <div className="bg-card border rounded-lg shadow-sm">
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Text Search */}
                    <div className="space-y-2">
                        <Label htmlFor="search-text" className="text-sm font-medium">
                            Search by keyword
                        </Label>
                        <Input
                            id="search-text"
                            placeholder="Event title, description..."
                            value={filters.q}
                            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                            className="w-full"
                        />
                    </div>

                    {/* Location Search */}
                    <div className="space-y-2">
                        <Label htmlFor="search-location" className="text-sm font-medium">
                            Location
                        </Label>
                        <Input
                            id="search-location"
                            placeholder="e.g., Hanoi, Community Center"
                            value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            className="w-full"
                        />
                    </div>

                    {/* Tag Multi-Select */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Tags</Label>
                        <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={isTagPopoverOpen}
                                    className="w-full justify-between"
                                >
                                    <span className="truncate">
                                        {filters.tags?.length ? `${filters.tags.length} selected` : 'Select tags...'}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search tags..." />
                                    <CommandList>
                                        <CommandEmpty>No tags found.</CommandEmpty>
                                        <CommandGroup>
                                            {tags?.map((tag) => (
                                                <CommandItem key={tag.value} onSelect={() => handleTagSelect(tag.value)}>
                                                    <Check
                                                        className={cn(
                                                            'mr-2 h-4 w-4',
                                                            (filters.tags || []).includes(tag.value) ? 'opacity-100' : 'opacity-0'
                                                        )}
                                                    />
                                                    {tag.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Actions Column */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Actions</Label>
                        <div className="flex gap-2">
                            <Button onClick={handleApplyFilters} className="flex-1">
                                Apply
                            </Button>
                            <Button onClick={handleClearFilters} variant="outline" className="flex-1">
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Selected Tags Display */}
                {filters.tags && filters.tags.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex flex-wrap gap-2">
                            {filters.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="px-3 py-1">
                                    {tag.replace(/_/g, ' ')}
                                    <button
                                        onClick={() => handleTagSelect(tag)}
                                        className="ml-2 rounded-full outline-none hover:bg-destructive/80 transition-colors"
                                        aria-label={`Remove ${tag} tag`}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upcoming Events Toggle */}
                <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="upcoming"
                            checked={filters.upcoming}
                            onCheckedChange={(checked) => setFilters({ ...filters, upcoming: !!checked })}
                        />
                        <Label
                            htmlFor="upcoming"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            Show upcoming events only
                        </Label>
                    </div>
                </div>
            </div>
        </div>
    );
}
