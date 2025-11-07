import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export function PasswordInput({ label, field }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
                <div className="relative">
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </FormControl>
            <FormMessage />
        </FormItem>
    );
}
